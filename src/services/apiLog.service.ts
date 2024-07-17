import { APILogDAO } from "../dao";
import { BaseService } from "../common/services/index";
import { ObjectId } from "mongodb";
import { AvergaResponseFilter, InvocationFilter, PERIOD_FILTER } from "../types/index";

export class ApiLogService extends BaseService {
  private apiLogDAO: APILogDAO;

  constructor() {
    super();
    this.apiLogDAO = new APILogDAO();
  }

  async getLatestInvocations(
    filter: InvocationFilter,
    limit: number,
    offset: number
  ) {

    let query: any = {};

    if (filter.endpointId) {
      query.endpointId = filter.endpointId;
    } else if (filter.microserviceId) {
      query.microserviceId = filter.microserviceId;
    } else if (filter.projectId) {
      query.projectId = filter.projectId;
    } else if (filter.organizationId) {
      query.organizationId = filter.organizationId;
    }

    if (filter.ipAddress) query.ipAddress = filter.ipAddress;

    if (filter.period) {
      const { startDate, endDate } = this.getPeriodDateRange(filter.period);
      query.timestamp = { $gte: startDate, $lte: endDate };
    }

    const { invocations, totalCount } =
      await this.apiLogDAO.getLatestInvocations(query, limit, offset);

    return { invocations, totalCount };
  }

  private getPeriodDateRange(period: string): {
    startDate: Date;
    endDate: Date;
  } {
    const now = new Date();
    let startDate: Date;
    let endDate: Date = now;

    switch (period) {
      case "daily":
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        break;
      case "weekly":
        const startOfWeek = now.getDate() - now.getDay(); // Start of the current week (Sunday)
        startDate = new Date(now.getFullYear(), now.getMonth(), startOfWeek);
        break;
      case "monthly":
        startDate = new Date(now.getFullYear(), now.getMonth(), 1); // Start of the current month
        break;
      case "yearly":
        startDate = new Date(now.getFullYear(), 0, 1); // Start of the current year
        break;
      default:
        throw new Error("Invalid period filter");
    }

    return { startDate, endDate };
  }

  async getAverageResponseTime(filter: AvergaResponseFilter) {
    const { endpointId, microserviceId, projectId, organizationId, period } =
      filter;
    let query: any = {};

    if (endpointId) {
      query.endpointId = new ObjectId(endpointId);
    } else if (microserviceId) {
      query.microserviceId = new ObjectId(microserviceId);
    } else if (projectId) {
      query.projectId = new ObjectId(projectId);
    } else if (organizationId) {
      query.organizationId = new ObjectId(organizationId);
    }

    if (period) {
      const { startDate, endDate } = this.getPeriodDateRange(period);
      query.timestamp = { $gte: startDate, $lte: endDate };
    }


    return await this.apiLogDAO.getAverageResponseTimeByFilters(query);
  }

  async getMinResponseTime(endpointId: string, timePeriod?: 'daily' | 'weekly' | 'monthly' | 'yearly') {

    let query: any = { endpointId : new ObjectId(endpointId)};

    if (timePeriod) {
      const { startDate, endDate } = this.getPeriodDateRange(timePeriod);
      query.timestamp = { $gte: startDate, $lte: endDate };
    }

    return await this.apiLogDAO.getMinResponseTime(query);
  }

  async getMaxResponseTime(endpointId: string, timePeriod?: 'daily' | 'weekly' | 'monthly' | 'yearly',) {

    let query: any = { endpointId : new ObjectId(endpointId)};

    if (timePeriod) {
      const { startDate, endDate } = this.getPeriodDateRange(timePeriod);
      query.timestamp = { $gte: startDate, $lte: endDate };
    }

    return await this.apiLogDAO.getMaxResponseTime(query);
  }
}
