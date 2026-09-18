import mongoose, { type InferSchemaType, type Model } from "mongoose";

const { Schema, model, models } = mongoose;

const AdminSchema = new Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    passwordHash: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

export type Admin = InferSchemaType<typeof AdminSchema>;

// Reuse the compiled model across hot reloads instead of redefining it,
// which would otherwise throw "Cannot overwrite `Admin` model once compiled".
export default (models.Admin as Model<Admin>) ?? model<Admin>("Admin", AdminSchema);
