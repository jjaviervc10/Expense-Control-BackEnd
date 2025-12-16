import express from "express"
import cors from "cors"
import dotenv from "dotenv"

//Cargar variables de entorno

dotenv.config();
const app = express();
//middlewares
app.use(cors());
app.use(express.json());

//Rutas

import authRoutes from "./routes/auth.routes.js";
app.use("/api/auth", authRoutes);

import adminRoutes from "./routes/admin.routes.js";
app.use("/api/admin", adminRoutes); // 👈 nuevo

import gastoRoutes from "./routes/gasto.routes.js";
app.use("/api/gastos", gastoRoutes);

import presupuestoRoutes from "./routes/presupuesto.routes.js"
app.use("/api/presupuesto", presupuestoRoutes);

import resetRoutes from "./routes/reset.routes.js"
app.use("/api/reset", resetRoutes)

//Puerto 
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
    console.log("Servidor backend escuchando en puerto", PORT);
});