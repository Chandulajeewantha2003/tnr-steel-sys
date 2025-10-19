import Material from "../models/material.model.js";
import mongoose from "mongoose";

// Add Stock to System
export const addMaterial = async (req, res) => {
  const material = req.body;

  if (
    !material.invoice_id ||
    !material.material_name ||
    !material.supplier_name ||
    !material.material_quantity ||
    !material.lot_price
  ) {
    console.log("Missing fields:", material);
    return res
      .status(400)
      .json({ success: false, message: "Please provide all details" });
  }

  const newMaterial = new Material(material);

  try {
    await newMaterial.save();
    res.status(201).json({ success: true, data: newMaterial });
  } catch (error) {
    console.error("Error in create stock", error.message);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

// Get All Stocks
export const getAllMaterial = async (req, res) => {
  try {
    const materials = await Material.find({});
    res.status(200).json({ success: true, data: materials });
  } catch (error) {
    console.log("error in fetching stocks", error.message);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

// Get stock by ID
export const getMaterialById = async (req, res) => {
  const { id } = req.params;

  try {
    const material = await Material.findById(id);
    res.status(200).json({ success: true, data: material });
  } catch (error) {
    console.log("error in fetching stock", error.message);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

// Update Stock

// Delete stock
export const deleteMaterial = async (req, res) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res
      .status(400)
      .json({ success: false, message: "Invalid material ID" });
  }

  try {
    await Material.findByIdAndDelete(id);
    res.status(200).json({ success: true, message: "Material Deleted" });
  } catch (error) {
    console.log("error in deleting stock", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};
