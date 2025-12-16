// src/routes/admin.routes.js
import { Router } from "express";
import { verifyToken } from "../middlewares/verifyToken.js";
import { requireAdmin } from "../middlewares/requireAdmin.js";
import {
    listarUsuarios,
    adminActivarPagoUsuario,
    eliminarUsuario,
} from "../controllers/admin.controller.js";

const router = Router();

// Todas las rutas de admin usan JWT y rol admin
router.use(verifyToken, requireAdmin);

router.get("/usuarios", listarUsuarios);
router.post("/usuarios/activar-pago", adminActivarPagoUsuario);
router.delete("/usuarios/:idUsuario", eliminarUsuario);

export default router;