import mongoose, { Document, Schema, Connection } from "mongoose";

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

const organizationSchema = new Schema<IOrganization>(
  {
    name: { type: String, required: true },
    city: { type: String },
    state: { type: String },
    pincode: { type: String },
    gst: { type: String },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
    deletedAt: { type: Date, default: null },
  },
  {
    timestamps: true, // Automatically adds createdAt and updatedAt fields
  }
);

export const OrganizationModel = async (connection: Connection) => {
  const model = connection.model<IOrganization>(
    "Organization",
    organizationSchema
  );
  await model.init();
  return model;
};
