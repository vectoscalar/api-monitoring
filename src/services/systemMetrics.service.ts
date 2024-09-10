
import { execSync } from 'child_process';

import { axiosClient, logger } from "../common/services";
import { BASE_URL_SAAS, ORGANIZATIONS_ROUTE, PROJECTS_ROUTE, ENDPOINT_LOGS_ROUTE, SYSTEM_METRICS_ROUTE, EC2_METADATA_URL } from "../common/constant";
import { UserAccountService } from "./userAccount.service";
import { SystemMetricsDAO, InstanceDAO } from "../dao";

const os = require('os');
const checkDiskSpace = require('check-disk-space').default;


class SystemMetrics {
  private systemmetricsDao: SystemMetricsDAO;
  private instanceDao: InstanceDAO;

  constructor() {
    this.systemmetricsDao = new SystemMetricsDAO();
    this.instanceDao = new InstanceDAO();
  }

  getCurrentCpuUsage() {
    const cpus = os.cpus();

    let totalIdle = 0, totalTick = 0;

    cpus.forEach((cpu: any) => {
      for (let type in cpu.times) {
        totalTick += cpu.times[type];
      }
      totalIdle += cpu.times.idle;
    });

    return {
      idle: totalIdle / cpus.length,
      total: totalTick / cpus.length
    };
  }

  calculateCpuUsage() {
    return new Promise((resolve) => {
      const startMeasure = this.getCurrentCpuUsage();

      setTimeout(() => {
        const endMeasure = this.getCurrentCpuUsage();

        const idleDifference = endMeasure.idle - startMeasure.idle;
        const totalDifference = endMeasure.total - startMeasure.total;

        const percentageCpu = 100 - ~~(100 * idleDifference / totalDifference);

        resolve({ value: percentageCpu, unit: '%' });
      }, 100);
    });
  }

  getMemoryUsage() {
    const memoryUsage = process.memoryUsage();
    const { rss, heapTotal, heapUsed, external } = memoryUsage;
    const percentage = ((heapUsed + external) / rss) * 100

    return {
      memoryInUse: {
        value: (rss / (1024 * 1024)).toFixed(2),
        unit: 'MB'
      },
      heapTotal: {
        value: (heapTotal / (1024 * 1024)).toFixed(2),
        unit: 'MB'
      },
      heapUsed: {
        value: (heapUsed / (1024 * 1024)).toFixed(2),
        unit: 'MB'
      },
      external: {
        value: (external / (1024 * 1024)).toFixed(2),
        unit: 'MB'
      },
      percentage: {
        value: percentage.toFixed(2),
        unit: '%'
      }
    };
  }

  async diskUsage() {
    const drives = os.platform() === 'win32' ? 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('').map(d => d + ':\\') : ['/'];

    const results: any = [];
    const osPlatform = os.platform();

    /** Ensuring the PowerShell path is included in the environment’s PATH variable for windows. */
    if (osPlatform === 'win32') {
      const powershellPath = 'C:\\Windows\\System32\\WindowsPowerShell\\v1.0';
      if (!process.env.PATH?.includes(powershellPath)) {
        process.env.PATH = `${process.env.PATH};${powershellPath}`;
      }
    }

    for (const drive of drives) {
      try {
        let diskSpace;
        if (osPlatform === 'win32') {
          diskSpace = await checkDiskSpace(drive);

          diskSpace = {
            free: diskSpace.free / (1024 * 1024 * 1024), /* Convert bytes to GB */
            size: diskSpace.size / (1024 * 1024 * 1024)
          };
        }
        else if (osPlatform === 'linux' || osPlatform === 'darwin') { /* 'darwin' is for macOS */
          /* For Linux and macOS, we use the 'df' command to get disk space */
          const output = execSync(`df -h ${drive}`).toString();
          const lines = output.split('\n');
          const data = lines[1].split(/\s+/);
          diskSpace = {
            free: parseFloat(data[3]), /* In GB */
            size: parseFloat(data[1])
          };
        }


        const { free, size } = diskSpace;
        const percentage = ((size - free) / size) * 100;

        results.push({
          drive,
          free: {
            value: free.toFixed(2),
            unit: 'GB'
          },
          size: {
            value: size.toFixed(2),
            unit: 'GB'
          },
          percentage: {
            value: percentage.toFixed(2),
            unit: '%'
          }
        });
      } catch (error) {
        /* Ignore if the drive does not exist */
      }
    }

    return results;
  }

  async startMonitoring() {
    const isEc2Res: any = await this.isEC2();
    const provider = isEc2Res ? 'aws' : 'local';
    let machineId: string;

    if (provider === 'local') {
      machineId = os.hostname() + os.platform() + os.arch();
    } else {
      machineId = isEc2Res[0];
    }

    const { organizationId, projectId, microserviceId, serviceKey } = UserAccountService.getAccountInfo();

    /* Upsert machine Id */
    await this.instanceDao.upsertInstance(microserviceId, machineId)

    while (true) {
      try {
        const cpuUsage = await this.calculateCpuUsage();
        const memoryUsage = this.getMemoryUsage();
        const diskUsage = await this.diskUsage();

        const data = {
          cpuUsage,
          memoryUsage,
          diskUsage,
          timestamp: new Date(),
          instanceId: machineId,
          microserviceId
        };

        /** NOTE: commented below code for internal use only
           metrics are saved by making axios call but commented to save cost for */
        // if (serviceKey) {
        //   const url = BASE_URL_SAAS + `${ORGANIZATIONS_ROUTE}/${organizationId}${PROJECTS_ROUTE}/${projectId}${SYSTEM_METRICS_ROUTE}`;
        //   const headers = { apiKey: serviceKey }
        //   await axiosClient.post(url, data, headers)

        //   logger.trace("successfully inserted");
        // } else {
        await this.systemmetricsDao.create(data);

        logger.trace("successfully inserted");
        // }


      } catch (error) {
        console.error('Error during monitoring:', error);
      }

      /* Waiting for 1 minute before the next iteration*/
      await new Promise(resolve => setTimeout(resolve, 10 * 1000));
    }
  }

  async isEC2(retries = 3) {
    for (let i = 0; i < retries; i++) {
      try {
        const response = await axiosClient.get(EC2_METADATA_URL, { timeout: '1000' });
        if (response.status === 200) {
          return [response];
        }
      } catch (error) {
        if (i === retries - 1) {
          return false;
        }

        /* Retry after a second*/
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    }
    return false;
  }

}

export const systemMetrics = new SystemMetrics();
