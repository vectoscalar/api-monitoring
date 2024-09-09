import mongoose, { Document, Schema } from 'mongoose';

export interface IProject extends Document {
  organizationId: mongoose.Types.ObjectId;
  name: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date | null;
}

const projectSchema = new Schema({
  organizationId: { type: Schema.Types.ObjectId, required: true },
  name: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  deletedAt: { type: Date, default: null }
},{
  timestamps: true
});

// Define and export Mongoose model
export const ProjectModel = mongoose.model<IProject>('Project', projectSchema);

