import express from "express";
import {
  addMaterial,
  deleteMaterial,
  getAllMaterial,
  getMaterialById,
} from "../controllers/material.controller.js";

const router = express.Router();

router.post("/", addMaterial);
router.get("/:id", getMaterialById);
router.get("/", getAllMaterial);
router.delete("/:id", deleteMaterial);

export default router;
