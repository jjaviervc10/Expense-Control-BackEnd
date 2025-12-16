import { Router } from "express";
import { verifyToken } from "../middlewares/verifyToken.js";
import { crearPresupuesto } from "../controllers/presupuesto.controller.js";
import { obtenerPresupuestoActivo } from "../controllers/presupuesto.controller.js";

const router = Router();
router.post("/", verifyToken, crearPresupuesto);


router.get("/activo", verifyToken, obtenerPresupuestoActivo);

export default router;