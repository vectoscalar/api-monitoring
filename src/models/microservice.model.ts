import mongoose, { Document, Schema, Connection } from "mongoose";

export interface IMicroservice extends Document {
  projectId: mongoose.Types.ObjectId;
  apiKey?: mongoose.Types.ObjectId;
  name: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date | null;
}

const microserviceSchema = new Schema({
  projectId: { type: Schema.Types.ObjectId, required: true },
  apiKey: { type: Schema.Types.ObjectId },
  name: { type: String, required: true },
  envType: {
    type: String,
    enum: ["SERVER", "SERVERLESS"],
    default: null,
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  deletedAt: { type: Date, default: null },
});

export const MicroserviceModel = async (connection: Connection) => {
  const model = connection.model<IMicroservice>(
    "Microservice",
    microserviceSchema
  );
  await model.init();
  return model;
};
