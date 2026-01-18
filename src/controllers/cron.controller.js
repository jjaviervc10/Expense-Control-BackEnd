import { sendNotificationToUser, buildNotificationPayload, sendNotificationBroadcast } from "../services/push.service.js";

/**
 * POST /api/notifications/cron/send
 * Endpoint que Supabase Cron llamará automáticamente
 * Body: { "tipo": "recordatorio" | "resumen" | "motivacion" }
 * Header: Authorization: Bearer CRON_SECRET_TOKEN
 */
export const sendEngagementNotification = async(req, res) => {
    try {
        // Validar token de seguridad
        const token = req.headers.authorization ? .replace("Bearer ", "");
        if (token !== process.env.CRON_SECRET_TOKEN) {
            console.warn("⚠️ Intento de acceso no autorizado a cron endpoint");
            return res.status(401).json({
                ok: false,
                message: "Token no autorizado",
            });
        }

        const { tipo } = req.body;

        if (!tipo) {
            return res.status(400).json({
                ok: false,
                message: "tipo es obligatorio (recordatorio, resumen, motivacion)",
            });
        }

        let payload;

        switch (tipo) {
            case "recordatorio":
                payload = buildNotificationPayload({
                    title: "📝 Recordatorio",
                    body: "No olvides registrar tus gastos de hoy",
                    data: { action: "openGastos" },
                });
                break;

            case "resumen":
                payload = buildNotificationPayload({
                    title: "📊 Resumen de la semana",
                    body: "¡Llevas una buena racha! Revisa tu resumen semanal",
                    data: { action: "openDashboard" },
                });
                break;

            case "motivacion":
                const mensajes = [
                    "¡Llevas una buena racha! 🚀",
                    "Tu rendimiento financiero te está esperando 💪",
                    "¡Sigues adelante con tus metas! 🎯",
                    "¡Excelente control de gastos! ✨",
                ];
                const mensaje = mensajes[Math.floor(Math.random() * mensajes.length)];

                payload = buildNotificationPayload({
                    title: "💪 Motivación",
                    body: mensaje,
                    data: { action: "openDashboard" },
                });
                break;

            default:
                return res.status(400).json({
                    ok: false,
                    message: "Tipo de notificación inválido",
                });
        }

        // Enviar a todos los usuarios activos
        const { totalSent, totalFailed } = await sendNotificationBroadcast(payload);

        console.log(`✅ Notificación ${tipo} enviada a ${totalSent} usuarios`);

        return res.json({
            ok: true,
            message: `Notificación ${tipo} enviada`,
            totalSent,
            totalFailed,
            timestamp: new Date().toISOString(),
        });
    } catch (err) {
        console.error("Error en sendEngagementNotification:", err);
        return res.status(500).json({
            ok: false,
            message: "Error enviando notificación",
            error: err.message,
        });
    }
};