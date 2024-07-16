import mongoose, { Document, Schema } from 'mongoose';

export interface IMicroservice extends Document {
  projectId: mongoose.Types.ObjectId;
  apiKey: mongoose.Types.ObjectId;
  name: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date | null;
}

const microserviceSchema = new Schema({
  projectId: { type: Schema.Types.ObjectId, required: true },
  apiKey: { type: Schema.Types.ObjectId, required: true },
  name: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  deletedAt: { type: Date, default: null }
});

export const MicroserviceModel = mongoose.model<IMicroservice>('Microservice', microserviceSchema);

