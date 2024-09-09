import mongoose, { ConnectOptions, MongooseOptions } from "mongoose";
import * as dbModels from "../models";

import { logger } from "../common/services";

export namespace APIMonitorMongooseClient {
  export let connection: mongoose.Connection | null = null;

  export async function init(mongoUrl: string) {
    try {
      await mongoose.connect(mongoUrl, {
        maxPoolSize: 10,
        minPoolSize: 5,
      });

      connection = mongoose.connection;
      logger.trace("Connected to MongoDB");

      // Initialize all models
      Object.values(dbModels).forEach((model: any) => model.init());
    } catch (error) {
      logger.error("Unable to connect to MongoDB:", error);
      throw error;
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
