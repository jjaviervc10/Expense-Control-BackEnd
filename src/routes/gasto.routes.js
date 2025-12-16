// src/routes/gasto.routes.js
import { Router } from "express";
import { verifyToken } from "../middlewares/verifyToken.js";
import { crearGasto, obtenerGastosPorTipo } from "../controllers/gasto.controller.js";

const router = Router();

router.post("/", verifyToken, crearGasto);

router.get("/list", verifyToken, obtenerGastosPorTipo);



export default router;