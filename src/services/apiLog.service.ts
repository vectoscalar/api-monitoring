import { APILogDAO } from "../dao";
import { Types } from "mongoose";
import { AvergaResponseFilter, InvocationFilter } from "../types/index";

export class ApiLogService {
  private apiLogDAO: APILogDAO;

  constructor() {
    this.apiLogDAO = new APILogDAO();
  }

  async getLatestInvocations(
    endpointId: string,
    filter: InvocationFilter,
    limit: number,
    offset: number
  ) {
    let query: any = {};

    const { period, ipAddress } = filter;

    if (!endpointId) throw new Error("Endpoint ID must be provided");

    query.endpointId = endpointId;

    if (ipAddress) query.ipAddress = ipAddress;

    if (period) {
      const { startDate, endDate } = this.getPeriodDateRange(period);
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

  async getAverageResponseTime(
    endpointId: string,
    filter: AvergaResponseFilter
  ) {
    const { period } = filter;
    let query: any = {};

    if (!endpointId) throw new Error("Endpoint ID must be provided");

    query.endpointId = new Types.ObjectId(endpointId);

    if (period) {
      const { startDate, endDate } = this.getPeriodDateRange(period);
      query.timestamp = { $gte: startDate, $lte: endDate };
    }

    return await this.apiLogDAO.getAverageResponseTimeByFilters(query);
  }

  async getMinResponseTime(
    endpointId: string,
    timePeriod?: "daily" | "weekly" | "monthly" | "yearly"
  ) {
    let query: any = {
      endpointId: new Types.ObjectId(endpointId),
      isSuccessfull: true,
    };

    if (timePeriod) {
      const { startDate, endDate } = this.getPeriodDateRange(timePeriod);
      query.timestamp = { $gte: startDate, $lte: endDate };
    }

    return await this.apiLogDAO.getMinResponseTime(query);
  }

  async getMaxResponseTime(
    endpointId: string,
    timePeriod?: "daily" | "weekly" | "monthly" | "yearly"
  ) {
    let query: any = {
      endpointId: new Types.ObjectId(endpointId),
      isSuccessfull: true,
    };

    if (timePeriod) {
      const { startDate, endDate } = this.getPeriodDateRange(timePeriod);
      query.timestamp = { $gte: startDate, $lte: endDate };
    }

    return await this.apiLogDAO.getMaxResponseTime(query);
  }
}
