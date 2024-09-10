import mongoose, { Document, Schema } from 'mongoose';

export interface IValueWithUnit {
  value: string;
  unit: string;
}

export interface IMemoryUsage {
  memoryInUse: IValueWithUnit;
  heapTotal: IValueWithUnit;
  heapUsed: IValueWithUnit;
  external: IValueWithUnit;
  percentage: IValueWithUnit;
}

export interface IDiskUsage {
  drive: string;
  free: IValueWithUnit;
  size: IValueWithUnit;
  percentage: IValueWithUnit;
}

export interface ISystemMetrics extends Document {
  cpuUsage: number;
  memoryUsage: IMemoryUsage;
  diskUsage: IDiskUsage[];
  timestamp: Date;
  instanceId: string;
  microserviceId: mongoose.Types.ObjectId;
}

const valueWithUnitSchema = new Schema<IValueWithUnit>({
  value: { type: String, required: true },
  unit: { type: String, required: true }
}, { _id: false });

const memoryUsageSchema = new Schema<IMemoryUsage>({
  memoryInUse: { type: valueWithUnitSchema, required: true },
  heapTotal: { type: valueWithUnitSchema, required: true },
  heapUsed: { type: valueWithUnitSchema, required: true },
  external: { type: valueWithUnitSchema, required: true },
  percentage: { type: valueWithUnitSchema, required: true }
}, { _id: false });

const diskUsageSchema = new Schema<IDiskUsage>({
  drive: { type: String, required: true },
  free: { type: valueWithUnitSchema, required: true },
  size: { type: valueWithUnitSchema, required: true },
  percentage: { type: valueWithUnitSchema, required: true }
}, { _id: false });

const systemMetricsSchema = new Schema({
  cpuUsage: { type: valueWithUnitSchema, required: true },
  memoryUsage: { type: memoryUsageSchema, required: true },
  diskUsage: { type: [diskUsageSchema], required: true },
  timestamp: { type: Date, default: Date.now, required: true },
  instanceId: { type: String, required: true },
  microserviceId: { type: Schema.Types.ObjectId, required: true }
}, {
  timestamps: true
});

export const SystemMetricsModel = mongoose.model<ISystemMetrics>('SystemMetrics', systemMetricsSchema);
