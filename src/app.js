import express from "express";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();
const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// 👉 RUTA RAÍZ (SOLUCIÓN AL 502)
app.get("/", (req, res) => {
    res.status(200).json({
        ok: true,
        message: "Expense Control Backend is running 🚀"
    });
});

// 👉 HEALTH CHECK (MUY RECOMENDADO)
app.get("/api/health", (req, res) => {
    res.status(200).json({ status: "ok" });
});

// Rutas
import authRoutes from "./routes/auth.routes.js";
app.use("/api/auth", authRoutes);

import adminRoutes from "./routes/admin.routes.js";
app.use("/api/admin", adminRoutes);

import gastoRoutes from "./routes/gasto.routes.js";
app.use("/api/gastos", gastoRoutes);

import presupuestoRoutes from "./routes/presupuesto.routes.js";
app.use("/api/presupuesto", presupuestoRoutes);

import resetRoutes from "./routes/reset.routes.js";
app.use("/api/reset", resetRoutes);

// Puerto
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
    console.log("Servidor backend escuchando en puerto", PORT);
});