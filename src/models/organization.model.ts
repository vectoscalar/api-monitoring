import mongoose, { Document, Schema } from 'mongoose';

export interface IOrganization extends Document {
  name: string;
  city?: string;
  state?: string;
  pincode?: string;
  gst?: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date | null;
}

const organizationSchema = new Schema({
  name: { type: String, required: true },
  city: { type: String },
  state: { type: String },
  pincode: { type: String },
  gst: { type: String },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  deletedAt: { type: Date, default: null }
});

export const OrganizationModel = mongoose.model<IOrganization>('Organization', organizationSchema);

