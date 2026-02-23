// NotificationOrchestrator: Coordina audiencia, copy, envío y métricas
import { getActivePushSubscriptions } from './audience.service.js';
import { selectCopy } from './content.service.js';
import { sendBatchNotifications } from './dispatch.service.js';
import { getUserNotificationCount, logNotification } from './metrics.service.js';
import { getActiveCampaign } from './campaign.service.js';
export async function orchestrateNotification({ tipo, horario }) {
  const subscriptions = await getActivePushSubscriptions();
  console.log('[DEBUG] Subscripciones obtenidas:', subscriptions.length);
  const date = new Date().toISOString().slice(0, 10);
  let totalSent = 0;
  let totalFailed = 0;
  const campaign = getActiveCampaign();

  // Simulación de métricas por usuario (en real, consultar DB de gastos)
  // TODO: Integrar con DB real de métricas si está disponible
  const fakeMetrics = {
    gastosSemana: 12, // Restaurar validación original
    diasHabito: 5,
    promedioDia: 50
  };

  // Envío por lote con concurrencia limitada
  const batch = [];
  for (const sub of subscriptions) {
    // Anti-fatiga: máximo 5 notificaciones por usuario/día (más flexible)
    const count = await getUserNotificationCount(sub.idusuario, tipo, date);
    if (count >= 5) {
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
    // TEST: Desactivado SKIP por gastosSemana para forzar envío
    // if (tipo === 'recordatorio' && fakeMetrics.gastosSemana > 0) {
    //   console.log(`[SKIP] Usuario ${sub.idusuario} ya registró gastos hoy (simulado)`);
    //   continue;
    // }

    // Selección de copy y variante
    const copy = selectCopy(tipo, horario, sub.idusuario, fakeMetrics, campaign);
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

    // Validar y parsear suscripción
    let subscriptionObj = sub.subscription;
    if (typeof subscriptionObj === 'string') {
      try {
        subscriptionObj = JSON.parse(subscriptionObj);
      } catch (e) {
        console.error('[ERROR] Parseo de suscripción fallido:', e);
        totalFailed++;
        continue;
      }
    }
    if (!subscriptionObj || !subscriptionObj.endpoint) {
      console.error('[ERROR] Suscripción sin endpoint:', subscriptionObj);
      totalFailed++;
      continue;
    }

    batch.push({ ...sub, subscription: subscriptionObj, payload, copy, horario, variante: copy });
  }

  // Enviar por lotes con concurrencia limitada
  const results = await sendBatchNotifications(
    batch.map(b => ({ ...b, subscription: b.subscription })),
    null, // payload individual por usuario
    20 // concurrencia
  );

  // Procesar resultados y registrar métricas
  for (let i = 0; i < batch.length; i++) {
    const sub = batch[i];
    const result = results[i];
    if (result?.ok) {
      totalSent++;
      await logNotification({
        idusuario: sub.idusuario,
        tipo,
        horario: sub.horario,
        variante: sub.variante,
        enviado_at: new Date().toISOString()
      });
    } else {
      totalFailed++;
      // Limpieza de suscripción inválida si error 410
      if (result?.error?.statusCode === 410) {
        // TODO: Eliminar suscripción inválida de la base de datos
        console.log(`[CLEANUP] Eliminar suscripción inválida para usuario ${sub.idusuario}`);
      }
    }
  }
  return { totalSent, totalFailed };
}
