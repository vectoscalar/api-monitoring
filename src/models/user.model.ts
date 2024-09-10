import mongoose, { Schema, Document, Connection } from "mongoose";

// (optional but recommended for type safety)
interface IUser extends Document {
  username: string;
  email: string;
  age: number;
  createdAt: Date;
}

const UserSchema: Schema<IUser> = new Schema({
  username: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  age: { type: Number, default: 18 },
  createdAt: { type: Date, default: Date.now },
});

/* Create and export model based on schema */

export const UserModel = async (connection: Connection) => {
  const model = connection.model<IUser>("user", UserSchema);
  await model.init();
  return model;
};
