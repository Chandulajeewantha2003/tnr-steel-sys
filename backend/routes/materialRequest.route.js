import express from "express";
import {
  addMaterialRequest,
  updateMaterialRequest,
  getAllMaterialRequests,
  deleteMaterialRequest,
} from "../controllers/materialRequest.controller.js";

const router = express.Router();

router.post("/", addMaterialRequest);
router.get("/", getAllMaterialRequests);
router.patch("/:id", updateMaterialRequest);
router.delete("/:id", deleteMaterialRequest);

export default router;
