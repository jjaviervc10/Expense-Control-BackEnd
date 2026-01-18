import { supabase } from "../supabase.js";
import { getPublicVapidKey } from "../services/push.service.js";

/**
 * GET /api/notifications/public-key
 * Obtiene la clave pública VAPID para que el frontend se suscriba
 */
export const getVapidPublicKey = (req, res) => {
    const key = getPublicVapidKey();

    if (!key) {
        return res.status(500).json({
            ok: false,
            message: "Clave VAPID no configurada",
        });
    }

    return res.json({
        ok: true,
        publicKey: key,
    });
};

/**
 * POST /api/notifications/subscribe
 * Usuario se suscribe a notificaciones push
 * Body: { endpoint, keys: { p256dh, auth } }
 */
export const subscribe = async(req, res) => {
    try {
        const idUsuario = req.user.id;
        const { endpoint, keys } = req.body;

        if (!endpoint || !keys || !keys.auth || !keys.p256dh) {
            return res.status(400).json({
                ok: false,
                message: "Suscripción inválida: falta endpoint o keys",
            });
        }

        const subscriptionObject = {
            endpoint,
            keys,
        };

        const { data, error } = await supabase
            .from("push_subscriptions")
            .insert([{
                idUsuario,
                subscription: subscriptionObject,
            }, ])
            .select();

        if (error) {
            console.error("Error al guardar suscripción:", error);
            return res.status(500).json({
                ok: false,
                message: "Error al registrar suscripción",
                error: error.message,
            });
        }

        return res.json({
            ok: true,
            message: "¡Te has suscrito a notificaciones!",
        });
    } catch (err) {
        console.error("Error en subscribe:", err);
        return res.status(500).json({
            ok: false,
            message: "Error procesando suscripción",
        });
    }
};

/**
 * POST /api/notifications/unsubscribe
 * Usuario se desuscribe de notificaciones push
 * Body: { endpoint }
 */
export const unsubscribe = async(req, res) => {
    try {
        const { endpoint } = req.body;

        if (!endpoint) {
            return res.status(400).json({
                ok: false,
                message: "endpoint es obligatorio",
            });
        }

        const { error } = await supabase
            .from("push_subscriptions")
            .delete()
            .eq("subscription->>'endpoint'", endpoint);

        if (error) {
            console.error("Error al desuscribirse:", error);
            return res.status(500).json({
                ok: false,
                message: "Error al desuscribirse",
                error: error.message,
            });
        }

        return res.json({
            ok: true,
            message: "Te has desuscrito de notificaciones",
        });
    } catch (err) {
        console.error("Error en unsubscribe:", err);
        return res.status(500).json({
            ok: false,
            message: "Error procesando desuscripción",
        });
    }
};