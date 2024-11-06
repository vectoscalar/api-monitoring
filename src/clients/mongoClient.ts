import mongoose, { ConnectOptions, MongooseOptions } from "mongoose";
import * as dbModels from "../models";

import { logger, axiosClient } from "../common/services";
import {
  DEFAULT_MONGO_URL,
  BASE_URL_SAAS,
  USER_ACCOUNT_INFO_ENDPOINT,
} from "../common/constant";
import { UserAccountService } from "../services";

export namespace APIMonitorMongooseClient {
  export let connection: mongoose.Connection | null = null;
  export let models: any = {};

  async function getServiceDetailsByKey(serviceApiKey) {
    const serviceInfo = await axiosClient.get(
      BASE_URL_SAAS + USER_ACCOUNT_INFO_ENDPOINT,
      { apikey: serviceApiKey }
    );
    return serviceInfo.data.data;
  }

  export async function initConnection({ serviceApiKey, accountInfo }: any) {
    try {
      logger.trace(
        `APIMonitorMongooseClient init connection start:: ${new Date()}`
      );
      let mongoUrl: string | null = null;

      if (!serviceApiKey && !(accountInfo || accountInfo.mongoUrl)) {
        throw new Error("pls provide either service api key or account info");
      }

      // NOTE::instead of making network call initializing the mongo url  to save network cost comment. remove  this condition for external use
      // if (serviceApiKey) mongoUrl = DEFAULT_MONGO_URL;
      if (serviceApiKey) {
        // fetching mongo url from monitor tool saas endpoint
        const {
          organizationId,
          projectId,
          microserviceId,
          mongoUrl: userMongoURL,
        } = await getServiceDetailsByKey(serviceApiKey);
        mongoUrl = userMongoURL;
        UserAccountService.setAccountInfo({
          organizationId,
          projectId,
          microserviceId,
          serviceApiKey,
        });
      }
      else if (accountInfo.mongoUrl) {
        // initialing mongo url provided by user
        mongoUrl = accountInfo.mongoUrl;
      }

      connection = await mongoose
        .createConnection(mongoUrl!, {
          serverSelectionTimeoutMS: 3000,
        })
        .asPromise();

      logger.trace(
        `APIMonitorMongooseClient :: Connected to MongoDB ${new Date()}`
      );

      // Initialize all models
      await Promise.all(
        Object.keys(dbModels).map(async (dbModel) => {
          models[dbModel] = await dbModels[dbModel](connection);
        })
      );

      logger.trace(
        `APIMonitorMongooseClient init connection completed: ${new Date()}`
      );
    } catch (err) {
      logger.error("Unable to connect to MongoDB:", err);
      throw err;
    }
  }

  export function getConnection(): mongoose.Connection {
    if (!connection) {
      throw new Error(
        "MongoDB connection has not been initialized. Please call init first."
      );
    }
    return connection;
  }

  export async function close(): Promise<void> {
    if (connection) {
      await connection.close();
      connection = null;
      logger.trace("Disconnected from MongoDB");
    }
  }
}
