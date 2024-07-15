import mongoose from 'mongoose';
import dbModels from '../models'

export namespace MongooseClient {
  export let connection: mongoose.Connection | null = null;

  export async function init() {
    const mongoUrl = 'INSERT_DB_URL'


    try {
      await mongoose.connect(mongoUrl);
      connection = mongoose.connection;
      console.info('Connected to MongoDB');

      // Initialize all models
      Object.values(dbModels).forEach(model => model.init());

    } catch (error) {
      console.error('Unable to connect to MongoDB:', error);
      throw error;
    }
  }

  export function getConnection(): mongoose.Connection {
    if (!connection) {
      throw new Error('MongoDB connection has not been initialized. Please call init first.');
    }
    return connection;
  }

  export async function close(): Promise<void> {
    if (connection) {
      await connection.close();
      connection = null;
      console.info('Disconnected from MongoDB');
    }
  }
}

