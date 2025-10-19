//material.model.js
import mongoose from "mongoose";

const materialSchema = new mongoose.Schema(
  {
    invoice_id: {
      type: String,
      required: true,
    },
    material_name: {
      type: String,
      required: true,
    },
    supplier_name: {
      type: String,
      required: true,
    },
    material_quantity: {
      type: Number,
      required: true,
    },
    lot_price: {
      type: Number,
      required: true,
    },
  },
  {
    timestamps: true,
    collection: 'ingredients' // Keep old collection name to preserve existing data
  }
);

const Material = mongoose.model("Material", materialSchema);

export default Material;
