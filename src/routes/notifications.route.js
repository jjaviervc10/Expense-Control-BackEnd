import { Router } from "express";
import { verifyToken } from "../middlewares/verifyToken.js";
import {
	getVapidPublicKey,
	subscribe,
	unsubscribe,
} from "../controllers/notifications.controller.js";
import { sendEngagementNotification } from "../controllers/cron.controller.js";

const router = Router();

/**
 * GET /api/notifications/public-key
 * Obtiene clave pública para que frontend se suscriba
 * No requiere autenticación
 */
router.get("/public-key", getVapidPublicKey);

/**
 * POST /api/notifications/subscribe
 * Usuario se suscribe a notificaciones
 * Requiere JWT autenticado
 */
router.post("/subscribe", verifyToken, subscribe);

/**
 * POST /api/notifications/unsubscribe
 * Usuario se desuscribe de notificaciones
 * Requiere JWT autenticado
 */
router.post("/unsubscribe", verifyToken, unsubscribe);

/**
 * POST /api/notifications/cron/send
 * Endpoint que Supabase Cron llamará
 * Requiere token secreto en header Authorization
 */
router.post("/cron/send", sendEngagementNotification);

export default router;
