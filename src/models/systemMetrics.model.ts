import mongoose, { Document, Schema } from 'mongoose';

export interface IMemoryUsage {
  rss: string;
  heapTotal: string;
  heapUsed: string;
  external: string;
}

export interface IDiskUsage {
  drive: string;
  free: string;
  size: string;
}

export interface ISystemMetrics extends Document {
  cpuUsage: number;
  memoryUsage: IMemoryUsage;
  diskUsage: IDiskUsage[];
  timestamp: Date;
  instanceId: string;
  microserviceId: mongoose.Types.ObjectId;
}

const memoryUsageSchema = new Schema<IMemoryUsage>({
  rss: { type: String, required: true },
  heapTotal: { type: String, required: true },
  heapUsed: { type: String, required: true },
  external: { type: String, required: true }
}, { _id: false });

const diskUsageSchema = new Schema<IDiskUsage>({
  drive: { type: String, required: true },
  free: { type: String, required: true },
  size: { type: String, required: true }
}, { _id: false });

const systemMetricsSchema = new Schema({
  cpuUsage: { type: String, required: true },
  memoryUsage: { type: memoryUsageSchema, required: true },
  diskUsage: { type: [diskUsageSchema], required: true },
  timestamp: { type: Date, default: Date.now, required: true },
  instanceId: { type: String, required: true },
  // instanceId: { type: String, default: null },
  microserviceId: { type: Schema.Types.ObjectId, required: true }
}, {
  timestamps: true
});

export const SystemMetricsModel = mongoose.model<ISystemMetrics>('SystemMetrics', systemMetricsSchema);
