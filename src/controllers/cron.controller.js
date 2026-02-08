import { orchestrateNotification } from '../services/orchestrator.service.js';
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
        const token = req.headers.authorization && req.headers.authorization.replace("Bearer ", "");
        if (token !== process.env.CRON_SECRET_TOKEN) {
            console.warn("⚠️ Intento de acceso no autorizado a cron endpoint");
            return res.status(401).json({
                ok: false,
                message: "Token no autorizado",
            });
        }

        const { tipo, slot } = req.body;
        const now = new Date();
        // Derivar slot si no viene en body
        const hour = now.getHours();
        let horario = slot;
        if (!horario) {
            if (hour >= 9 && hour < 12) horario = "9am";
            else if (hour >= 12 && hour < 15) horario = "12pm";
            else if (hour >= 15 && hour < 18) horario = "3pm";
            else if (hour >= 18 && hour < 21) horario = "6pm";
            else horario = "9pm";
        }

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
            case "estacional":
                payload = buildNotificationPayload({
                    title: "🎉 Campaña",
                    body: "¡Disfruta de nuestra campaña estacional!",
                    data: { action: "openDashboard" },
                });
                break;
            default:
                return res.status(400).json({
                    ok: false,
                    message: "Tipo de notificación inválido",
                });
        }

        // Orquestar notificación
        console.log(`Cron autorizado | tipo: ${tipo} | horario: ${horario}`);
        const { totalSent, totalFailed } = await orchestrateNotification({ tipo, horario });
        console.log(`✅ Notificación ${tipo} enviada a ${totalSent} usuarios (fallidos: ${totalFailed})`);

        return res.json({
            ok: true,
            tipo,
            horario,
            usuarios_notificados: totalSent,
            usuarios_fallidos: totalFailed,
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