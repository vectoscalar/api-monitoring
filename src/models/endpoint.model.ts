import mongoose, { Connection, Document, Schema } from "mongoose";

export interface IEndpoint extends Document {
  microserviceId: mongoose.Types.ObjectId;
  url: string;
  version: string;
  method: string;
  totalResponseTime: number;
  totalInvocationCount: number;
  description: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date | null;
}

const endpointSchema = new Schema(
  {
    microserviceId: { type: Schema.Types.ObjectId, required: true }, // Corrected type here
    url: { type: String, required: true },
    method: { type: String, required: true },
    totalResponseTime: { type: Number, default: 0 },
    totalInvocationCount: { type: Number, default: 0 },
    description: { type: String },
    isRouteAvailable: { type: Boolean, default: true },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
    deletedAt: { type: Date, default: null },
  },
  {
    timestamps: true,
  }
);

endpointSchema.index({ microserviceId: 1, url: 1 });

export const EndpointModel = async (connection: Connection) => {
  const model = connection.model<IEndpoint>("Endpoint", endpointSchema);
  await model.init();
  return model;
};
