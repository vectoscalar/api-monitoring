import mongoose, { Connection, Document, Schema } from 'mongoose';

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

export const InstanceModel = async (connection: Connection) => {
  const model = connection.model<IInstance>(
    "Instance",
    instanceSchema
  );
  await model.init();
  return model;
};
