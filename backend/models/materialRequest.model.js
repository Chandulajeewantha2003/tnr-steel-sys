import mongoose from "mongoose";

const materialRequestSchema = new mongoose.Schema(
  {
    material_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Material",
      required: true,
    },
    request_quantity: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
  },
  {
    timestamps: true,
    collection: 'ingredientrequests' // Keep old collection name to preserve existing data
  }
);

const MaterialRequest = mongoose.model(
  "MaterialRequest",
  materialRequestSchema
);

export default MaterialRequest;
