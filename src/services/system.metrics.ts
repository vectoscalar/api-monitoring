import { axiosClient, logger } from "../common/services";
import { BASE_URL_SAAS, ORGANIZATIONS_ROUTE, PROJECTS_ROUTE, ENDPOINT_LOGS_ROUTE, SYSTEM_METRICS_ROUTE, EC2_METADATA_URL } from "../common/constant";
import { userAccountService } from "./userAccount.service";
import { SystemMetricsDAO } from "../dao";

const os = require('os');
const checkDiskSpace = require('check-disk-space').default;


class SystemMetrics {
  private systemmetricsDao: SystemMetricsDAO;

  constructor() {
    this.systemmetricsDao = new SystemMetricsDAO();
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

        resolve(percentageCpu + '%');
      }, 100);
    });
  }

  getMemoryUsage() {
    const memoryUsage = process.memoryUsage();
    return {
      rss: memoryUsage.rss / (1024 * 1024) + ' MB',
      heapTotal: memoryUsage.heapTotal / (1024 * 1024) + ' MB',
      heapUsed: memoryUsage.heapUsed / (1024 * 1024) + ' MB',
      external: memoryUsage.external / (1024 * 1024) + ' MB',
    };
  }

  async diskUsage() {
    const drives = os.platform() === 'win32' ? 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('').map(d => d + ':\\') : ['/'];

    const results: any = [];

    if (os.platform() === 'win32') {
      const powershellPath = 'C:\\Windows\\System32\\WindowsPowerShell\\v1.0';
      if (!process.env.PATH?.includes(powershellPath)) {
        process.env.PATH = `${process.env.PATH};${powershellPath}`;
      }
    }

    for (const drive of drives) {
      try {
        const diskSpace = await checkDiskSpace(drive);
        results.push({
          drive: drive,
          free: (diskSpace.free / (1024 * 1024 * 1024)).toFixed(2) + ' GB',
          size: (diskSpace.size / (1024 * 1024 * 1024)).toFixed(2) + ' GB'
        });
      } catch (error) {
        /* Ignore if the drive does not exist */
      }
    }

    return results;
  }

  async startMonitoring() {
    // const instanceId = await this.getInstanceId()    Can only be invoked inside an EC2 instance
    const instanceId = ''
    const { organizationId, projectId, microserviceId, serviceKey } = userAccountService.getAccountInfo();

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
          instanceId,
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
      await new Promise(resolve => setTimeout(resolve, 60 * 1000));
    }
  }

  async getInstanceId() {
    try {
      const instanceId = await axiosClient.get(EC2_METADATA_URL);
      logger.trace(`Instance ID: ${instanceId}`);
    } catch (error) {
      logger.error('Error fetching instance ID:', error);
    }
  }

}

export const systemMetrics = new SystemMetrics();

