import mongoose, { Document, Schema } from 'mongoose';

export interface IInstance extends Document {
  id: string;
  microserviceId: mongoose.Types.ObjectId;
}

const instanceSchema = new Schema<IInstance>({
  id: { type: String, required: true },
  microserviceId: { type: Schema.Types.ObjectId, required: true }
}, {
  timestamps: true
});

export const InstanceModel = mongoose.model<IInstance>('Instance', instanceSchema);
