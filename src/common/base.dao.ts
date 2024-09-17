import mongoose, {
  Document,
  Model,
  PopulateOptions,
  QueryOptions,
  UpdateQuery,
} from "mongoose";

import { logger } from "../common/services/logger.service";

// Base DAO class implementing the interface
abstract class BaseDAO {
  protected readonly model;

  constructor(model: any) {
    this.model = model;
  }

  async create(data: any) {
    return this.model.create(data);
  }

  async findById(id: string, populate?: PopulateOptions | PopulateOptions[]) {
    let query = this.model.findById(id);
    if (populate) {
      query = query.populate(populate);
    }
    return query.exec();
  }

  async findOne(query: any, populate?: PopulateOptions | PopulateOptions[]) {
    let findOneQuery = this.model.findOne(query);
    if (populate) {
      findOneQuery = findOneQuery.populate(populate);
    }
    return findOneQuery.exec();
  }

  async find(
    query?: any,
    options?: QueryOptions,
    populate?: PopulateOptions | PopulateOptions[]
  ) {
    let findQuery = this.model.find(query, null, options);
    if (populate) {
      findQuery = findQuery.populate(populate);
    }
    return findQuery.exec();
  }

  async update(id: string, update: any, options?: QueryOptions) {
    return this.model
      .findByIdAndUpdate(id, update, {
        new: true,
        ...options,
      })
      .exec();
  }
  async updateOne(filter, update, options = {}) {
    return this.model.updateOne(filter, update, options);
  }

  async delete(id: string) {
    await this.model.findByIdAndDelete(id).exec();
  }

  async upsert(query: any, update: any, options: any): Promise<any> {
    return this.model.findOneAndUpdate(query, update, options);
  }

  async bulkWrite(operations: any) {
    return this.model.bulkWrite(operations);
  }

  async insertMany(data: any[], options: any = {}) {
    return this.model.insertMany(data, options);
  }
}

export default BaseDAO;
