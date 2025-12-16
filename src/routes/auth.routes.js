import { Router } from "express"
import { loginUser, registerUser } from "../controllers/auth.controller.js";
import { activarPagoUsuario } from "../controllers/auth.controller.js";


const router = Router();
router.post("/login", loginUser);
router.post("/register", registerUser);

router.post("/activar-pago", activarPagoUsuario);

export default router;