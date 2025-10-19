import MaterialRequest from "../models/materialRequest.model.js";
import mongoose from "mongoose";

export const addMaterialRequest = async (req, res) => {
  const { material_id, request_quantity } = req.body;

  if (!material_id || !request_quantity) {
    return res
      .status(400)
      .json({ success: false, message: "Please provide all details" });
  }

  const newRequest = new MaterialRequest({
    material_id,
    request_quantity,
    status: "pending",
  });

  try {
    await newRequest.save();
    res.status(201).json({ success: true, data: newRequest });
  } catch (error) {
    console.error("Error in creating material request:", error.message);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

export const getAllMaterialRequests = async (req, res) => {
  try {
    const requests = await MaterialRequest.find({}).populate("material_id");
    res.status(200).json({ success: true, data: requests });
  } catch (error) {
    console.error("Error fetching material requests:", error.message);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

export const updateMaterialRequest = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res
      .status(400)
      .json({ success: false, message: "Invalid request ID" });
  }

  if (!["approved", "rejected"].includes(status)) {
    return res.status(400).json({ success: false, message: "Invalid status" });
  }

  try {
    const updatedRequest = await MaterialRequest.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    ).populate("material_id");
    if (!updatedRequest) {
      return res
        .status(404)
        .json({ success: false, message: "Request not found" });
    }
    res.status(200).json({ success: true, data: updatedRequest });
  } catch (error) {
    console.error("Error updating material request:", error.message);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

export const deleteMaterialRequest = async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res
      .status(400)
      .json({ success: false, message: "Invalid request ID" });
  }

  try {
    const request = await MaterialRequest.findById(id);

    if (!request) {
      return res
        .status(404)
        .json({ success: false, message: "Request not found" });
    }

    if (request.status !== "pending") {
      return res
        .status(400)
        .json({
          success: false,
          message: "Only pending requests can be deleted",
        });
    }

    await MaterialRequest.findByIdAndDelete(id);
    res
      .status(200)
      .json({ success: true, message: "Request deleted successfully" });
  } catch (error) {
    console.error("Error deleting material request:", error.message);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};
