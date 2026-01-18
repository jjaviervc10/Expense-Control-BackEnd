import webpush from "web-push";
import { supabase } from "../supabase.js";

/**
 * Inicializa las claves VAPID para web-push
 */
export const initVapid = () => {
    const vapidPublicKey = process.env.VAPID_PUBLIC_KEY;
    const vapidPrivateKey = process.env.VAPID_PRIVATE_KEY;
    const emailUser = process.env.EMAIL_USER;

    if (!vapidPublicKey || !vapidPrivateKey || !emailUser) {
        console.error("❌ VAPID_PUBLIC_KEY o VAPID_PRIVATE_KEY no configurados");
        return false;
    }

    try {
        webpush.setVapidDetails(`mailto:${emailUser}`, vapidPublicKey, vapidPrivateKey);
        console.log("✅ VAPID inicializado correctamente");
        return true;
    } catch (err) {
        console.error("❌ Error inicializando VAPID:", err.message);
        return false;
    }
};

/**
 * Envía una notificación push a un dispositivo
 */
export const sendPushNotification = async(subscription, payload) => {
    try {
        if (!subscription || !subscription.endpoint) {
            return {
                ok: false,
                error: {
                    message: "Suscripción inválida: falta endpoint",
                    statusCode: 400,
                },
            };
        }

        await webpush.sendNotification(subscription, JSON.stringify(payload));
        return { ok: true };
    } catch (err) {
        return {
            ok: false,
            error: {
                statusCode: err.statusCode || 500,
                message: err.message,
            },
        };
    }
};

/**
 * Construye payload de notificación
 */
export const buildNotificationPayload = ({
    title,
    body,
    icon = "/logo.png",
    badge = "/badge.png",
    tag = "engagement",
    data = {},
}) => {
    return {
        notification: {
            title,
            body,
            icon,
            badge,
            tag,
        },
        data,
    };
};

/**
 * Envía notificación a un usuario específico
 */
export const sendNotificationToUser = async(userId, payload) => {
    try {
        const { data: subscriptions, error } = await supabase
            .from("push_subscriptions")
            .select("id, subscription")
            .eq("idUsuario", userId);

        if (error) {
            console.error("Error obteniendo suscripciones:", error);
            return { sent: 0, failed: 0 };
        }

        let sent = 0;
        let failed = 0;

        for (const record of subscriptions || []) {
            const subscription = record.subscription;

            const result = await sendPushNotification(subscription, payload);

            if (result.ok) {
                sent++;
            } else {
                failed++;
                if (result.error ? .statusCode === 410) {
                    await supabase
                        .from("push_subscriptions")
                        .delete()
                        .eq("id", record.id)
                        .catch(err => console.error("Error eliminando suscripción:", err));
                }
            }
        }

        return { sent, failed };
    } catch (err) {
        console.error("Error en sendNotificationToUser:", err);
        return { sent: 0, failed: 0 };
    }
};

/**
 * Envía notificación a todos los usuarios activos (broadcast)
 */
export const sendNotificationBroadcast = async(payload) => {
    try {
        const { data: usuarios, error: userError } = await supabase
            .from("sUsuario")
            .select("idUsuario")
            .eq("activo", true);

        if (userError) {
            console.error("Error obteniendo usuarios:", userError);
            return { totalSent: 0, totalFailed: 0 };
        }

        let totalSent = 0;
        let totalFailed = 0;

        for (const { idUsuario }
            of usuarios || []) {
            const { sent, failed } = await sendNotificationToUser(idUsuario, payload);
            totalSent += sent;
            totalFailed += failed;
        }

        return { totalSent, totalFailed };
    } catch (err) {
        console.error("Error en sendNotificationBroadcast:", err);
        return { totalSent: 0, totalFailed: 0 };
    }
};

/**
 * Obtiene la clave pública VAPID
 */
export const getPublicVapidKey = () => {
    return process.env.VAPID_PUBLIC_KEY || null;
};