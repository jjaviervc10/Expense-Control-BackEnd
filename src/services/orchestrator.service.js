// NotificationOrchestrator: Coordina audiencia, copy, envío y métricas
import { getActivePushSubscriptions } from './audience.service.js';
import { selectCopy } from './content.service.js';
import { sendBatchNotifications } from './dispatch.service.js';
export async function orchestrateNotification({ tipo, horario }) {
  const subscriptions = await getActivePushSubscriptions();
  const date = new Date().toISOString().slice(0, 10);
  let totalSent = 0;
  let totalFailed = 0;

  // Simulación de métricas por usuario (en real, consultar DB de gastos)
  const fakeMetrics = {
    gastosSemana: 12,
    diasHabito: 5,
    promedioDia: 50
  };

  for (const sub of subscriptions) {
    // Anti-fatiga: máximo 3 notificaciones por usuario/día
    const count = await getUserNotificationCount(sub.idusuario, tipo, date);
    if (count >= 3) {
      console.log(`[SKIP] Usuario ${sub.idusuario} superó límite anti-fatiga (${count})`);
      continue;
    }

    // Quiet hours: no enviar después de 21h
    const hour = new Date().getHours();
    if (hour > 21) {
      console.log(`[SKIP] Usuario ${sub.idusuario} fuera de horario permitido (${hour}h)`);
      continue;
    }

    // Si el usuario ya registró gastos hoy (simulado)
    // En real: consultar DB de gastos
    if (tipo === 'recordatorio' && fakeMetrics.gastosSemana > 0) {
      console.log(`[SKIP] Usuario ${sub.idusuario} ya registró gastos hoy (simulado)`);
      continue;
    }

    // Selección de copy y variante
    const copy = selectCopy(tipo, horario, sub.idusuario, fakeMetrics);
    const variante = copy;
    let title = 'Notificación';
    let action = 'openGastos';
    if (tipo === 'recordatorio') {
      title = '📝 Recordatorio';
      action = 'openGastos';
    } else if (tipo === 'motivacion') {
      title = '💪 Motivación';
      action = 'openDashboard';
    } else if (tipo === 'resumen') {
      title = '📊 Resumen de la semana';
      action = 'openDashboard';
    } else if (tipo === 'estacional') {
      title = '🎉 Campaña';
      action = 'openDashboard';
    }
    const payload = {
      notification: {
        title,
        body: copy,
        tag: tipo,
      },
      data: { action }
    };

    // Parsear la suscripción si es string
    let subscriptionObj = sub.subscription;
    if (typeof subscriptionObj === 'string') {
      try {
        subscriptionObj = JSON.parse(subscriptionObj);
      } catch (e) {
        console.error(`[ERROR] Usuario ${sub.idusuario} - Error parseando suscripción:`, e);
        totalFailed++;
        continue;
      }
    }

    // Enviar notificación
    console.log(`[SEND] Intentando notificar a usuario ${sub.idusuario}...`);
    const result = await sendBatchNotifications([{ ...sub, subscription: subscriptionObj }], payload);
    if (result[0]?.ok) {
      console.log(`[OK] Notificación enviada a usuario ${sub.idusuario}`);
      totalSent++;
      await logNotification({
        idusuario: sub.idusuario,
        tipo,
        horario,
        variante,
        enviado_at: new Date().toISOString()
      });
    } else {
      console.error(`[FAIL] Falló el envío a usuario ${sub.idusuario}:`, result[0]?.error);
      totalFailed++;
    }
  }
  return { totalSent, totalFailed };
}
