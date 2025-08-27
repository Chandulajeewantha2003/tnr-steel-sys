//stock.model.js
import mongoose from "mongoose";

const ingredientSchema = new mongoose.Schema(
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
  }
);

const Ingredient = mongoose.model("Ingredient", ingredientSchema);

export default Ingredient;
