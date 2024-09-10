import mongoose, { Document, Schema, Connection } from "mongoose";

export interface IAPILog extends Document {
  endpointId: mongoose.Types.ObjectId;
  microserviceId: mongoose.Types.ObjectId;
  projectId: mongoose.Types.ObjectId;
  organizationId: mongoose.Types.ObjectId;
  timestamp: Date;
  responseTime: number;
  isSuccessfull: boolean;
  statusCode: number;
  errorMessage?: string;
  ipAddress: string;
  createdAt: Date;
}

const apiLogSchema = new Schema(
  {
    url: { type: String, required: true },
    endpointId: { type: Schema.Types.ObjectId, required: true },
    microserviceId: { type: Schema.Types.ObjectId, required: true },
    projectId: { type: Schema.Types.ObjectId, required: true },
    organizationId: { type: Schema.Types.ObjectId, required: true },
    timestamp: { type: Date, default: Date.now },
    responseTime: { type: Number, required: true },
    isSuccessfull: { type: Boolean, required: true },
    statusCode: { type: Number },
    ipAddress: { type: String, required: true },
    startTime: { type: Date, required: true },
    endTime: { type: Date, required: true },
    elapsedTime: { type: Number, required: true },
    requestHeaderSize: { type: Number, required: true },
    requestBodySize: { type: Number, required: true },
    responseSize: { type: Number, required: true },
    responseBody: { type: JSON, require: true },
    errorDetails: { type: String },
  },
  {
    timestamps: true,
  }
);

apiLogSchema.index({ endpointId: 1, timestamp: -1 });
apiLogSchema.index({ ipAddress: 1 });

export const APILogModel = async (connection: Connection) => {
  const model = connection.model<IAPILog>("APILog", apiLogSchema);
  await model.init();
  return model;
};
