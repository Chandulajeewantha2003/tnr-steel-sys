import express from "express";
import {
  addStock,
  getAllStock,
  getStockById,
  issueStock,
  sellStock, // Keeping deprecated endpoint as-is
} from "../controllers/stock.controller.js";

const router = express.Router();

router.post("/", addStock);
router.get("/", getAllStock);
router.get("/:id", getStockById);
router.put("/issue", issueStock);
router.post("/sell", sellStock); // Deprecated endpoint

export default router;
