import mongoose, { type InferSchemaType, type Model } from "mongoose";

const { Schema, model, models } = mongoose;

const LeadSchema = new Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    answers: {
      type: [Schema.Types.Mixed],
      required: true,
      default: [],
    },
    result: {
      type: String,
      required: true,
    },
    resultType: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

export type Lead = InferSchemaType<typeof LeadSchema>;

// Reuse the compiled model across hot reloads instead of redefining it,
// which would otherwise throw "Cannot overwrite `Lead` model once compiled".
export default (models.Lead as Model<Lead>) ?? model<Lead>("Lead", LeadSchema);
