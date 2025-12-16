import { Router } from "express";
import { verifyToken } from "../middlewares/verifyToken.js";
import { resetUsuario, generarPdf, enviarPdfEmail } from "../controllers/reset.controller.js";
const router = Router();
// Generar PDF
router.post("/pdf", verifyToken, generarPdf);
router.post("/email", verifyToken, enviarPdfEmail);
router.post("/", verifyToken, resetUsuario);
export default router;