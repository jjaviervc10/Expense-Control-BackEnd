// src/routes/gasto.routes.js
import { Router } from "express";
import { verifyToken } from "../middlewares/verifyToken.js";
import { crearGasto, obtenerGastosPorTipo } from "../controllers/gasto.controller.js";

const router = Router();
import { marcarFavorito, obtenerFavoritos, registrarGastoFavorito } from "../controllers/gasto.controller.js";

router.post("/", verifyToken, crearGasto);
router.post("/favorito", verifyToken, marcarFavorito);
router.get("/favoritos", verifyToken, obtenerFavoritos);
router.post("/registrar-favorito", verifyToken, registrarGastoFavorito);

router.get("/list", verifyToken, obtenerGastosPorTipo);



export default router;