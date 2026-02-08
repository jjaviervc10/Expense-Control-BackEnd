import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { initVapid } from "./services/push.service.js";

dotenv.config();
const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Log de acceso para cada petición entrante
app.use((req, res, next) => {
    console.log(`[ACCESS] ${req.method} ${req.originalUrl} - ${new Date().toISOString()}`);
    next();
});

// ✅ Inicializar VAPID para web-push
const vapidOk = initVapid();
if (!vapidOk) {
    console.warn("⚠️ Advertencia: Notificaciones push no están configuradas");
}

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

import notificationRoutes from "./routes/notifications.route.js";
app.use("/api/notifications", notificationRoutes);

import receiptRoutes from "./routes/receipt.routes.js";
app.use("/api/receipt", receiptRoutes);

// Puerto
const PORT = process.env.PORT;
app.listen(PORT, () => {
    console.log("Servidor backend escuchando en puerto", PORT);
});


// Manejo global de errores para evitar caídas inesperadas
process.on('uncaughtException', err => {
    console.error('Uncaught Exception:', err);
});
process.on('unhandledRejection', err => {
    console.error('Unhandled Rejection:', err);
});

// --- POLLING DE NOTIFICACIONES ---
import "./pollingNotificationEvents.js";