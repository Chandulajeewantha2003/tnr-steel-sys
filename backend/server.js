import express from "express";
import dotenv from "dotenv";
import { connectDB } from "./config/db.js";
import productRoutes from "./routes/product.route.js";
import stockRoutes from "./routes/stock.route.js";
import cors from "cors";
import router from "./routes/directbuyer.route.js";
import fs from "fs";
import "./models/directinvoice.model.js";
import MaterialRoutes from "./routes/material.route.js";
import supplierRoutes from "./routes/supplier.route.js";
import salesRoutes from "./routes/directsales.route.js";
import indirectsalesRoute from "./routes/indirectsales.route.js";
import returnRoutes from "./routes/directreturns.route.js";
import indirectreturnRoutes from "./routes/indirectreturns.route.js";
import productionRequestRoutes from "./routes/productionRequest.routes.js";
import employeeRoutes from "./routes/employee.route.js";
import attendanceRoutes from "./routes/attendance.route.js";
import userRoutes from "./routes/user.route.js";
import authRouter from "./routes/auth.route.js";
import salesRequestRoutes from "./routes/salesRequest.routes.js";
import indirectbuyerRoutes from "./routes/indirectbuyer.route.js";
import salesstockRoutes from "./routes/salesstock.route.js";
import stockRequestRoutes from "./routes/stockChangeRequest.route.js";
import materialRequestRoutes from "./routes/materialRequest.route.js";
import chatRoutes from "./routes/chat.route.js";
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json());
app.use(
    cors({
        origin: ["http://localhost:5173", "http://127.0.0.1:5173", "https://tnr-steel-sys-ten.vercel.app", process.env.FRONTEND_URL].filter(Boolean),
    })
);
app.get("/", (req, res) => {
    res.json({ success: true, message: "TNR Steel API is running" });
});

app.get("/api/health", async (req, res) => {
    try {
        await connectDB();
        res.json({ success: true, message: "Backend and MongoDB are connected" });
    } catch (error) {
        console.error("MongoDB health check failed:", error.message);
        res.status(503).json({ success: false, message: "Database connection unavailable" });
    }
});

app.use(async (req, res, next) => {
    try {
        await connectDB();
        next();
    } catch (error) {
        console.error("MongoDB connection failed:", error.message);
        res.status(503).json({ success: false, message: "Database connection unavailable" });
    }
});
app.use("/api/products", productRoutes);
app.use("/api/production-requests", productionRequestRoutes);
app.use("/api/sales-requests", salesRequestRoutes);
app.use("/api/employee", employeeRoutes);
app.use("/api/stocks", stockRoutes);
app.use("/api/salesstocks", salesstockRoutes);
app.use("/api/materials", MaterialRoutes);
app.use("/api/suppliers", supplierRoutes);
app.use("/api/attendance", attendanceRoutes);
app.use("/api/users", userRoutes);
app.use("/api/auth", authRouter);
app.use("/api/indirectbuyers", indirectbuyerRoutes);
app.use("/api/stock-change-requests", stockRequestRoutes);
app.use("/api/material-requests", materialRequestRoutes);
app.use("/api/stock-requests", salesRequestRoutes);
app.use("/api/chat", chatRoutes);

app.use("/buyers", router);
const dir = "./files";
if (!process.env.VERCEL && !fs.existsSync(dir)) {
    fs.mkdirSync(dir);
}
app.use("/files", express.static("files"));

//direct sales
app.use("/api/sales", salesRoutes);

//indirect sales
app.use("/api/indirectsales", indirectsalesRoute);

//directreturns

app.use("/api/returns", returnRoutes);

//indirectreturns

app.use("/api/indirectreturns", indirectreturnRoutes);
if (!process.env.VERCEL) {
    app.listen(PORT, () => {
        console.log("Server is running on http://localhost:" + PORT);
    });
}

export default app;
