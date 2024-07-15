import mongoose, { Document, Model, PopulateOptions, QueryOptions, UpdateQuery } from 'mongoose';


// Base DAO class implementing the interface
abstract class BaseDAO {
  protected readonly model;

  constructor(model) {
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

  async find(query?: any, options?: QueryOptions, populate?: PopulateOptions | PopulateOptions[]) {
    let findQuery = this.model.find(query, null, options);
    if (populate) {
      findQuery = findQuery.populate(populate);
    }
    return findQuery.exec();
  }

  async update(id: string, update, options?: QueryOptions) {
    return this.model.findByIdAndUpdate(id, update, {
      new: true,
      ...options,
    }).exec();
  }

  async delete(id: string) {
    await this.model.findByIdAndDelete(id).exec();
  }
}

export default BaseDAO;
