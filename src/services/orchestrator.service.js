// NotificationOrchestrator: Coordina audiencia, copy, envío y métricas
import { getActivePushSubscriptions } from './audience.service.js';
import { selectCopy } from './content.service.js';
import { sendBatchNotifications } from './dispatch.service.js';
export async function orchestrateNotification({ tipo, horario }) {
  const subscriptions = await getActivePushSubscriptions();
  console.log('[DEBUG] Subscripciones obtenidas:', subscriptions);
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
    console.log('[DEBUG] Procesando suscripción:', sub);
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

    // Payload simple para pruebas
    const payload = {
      notification: {
        title: '🔔 Prueba de notificación',
        body: '¡Tu backend puede enviar push correctamente!',
        tag: 'test',
      },
      data: { action: 'openGastos' }
    };

    // Enviar notificación
    console.log(`[SEND] Enviando a usuario ${sub.idusuario}...`);
    const result = await sendBatchNotifications([{ ...sub, subscription: subscriptionObj }], payload);
    console.log('[DEBUG] Resultado de sendBatchNotifications:', result);
    if (result[0]?.ok) {
      console.log(`[OK] Notificación enviada a usuario ${sub.idusuario}`);
      totalSent++;
      // Puedes registrar en logNotification si quieres
    } else {
      console.error(`[FAIL] Falló el envío a usuario ${sub.idusuario}:`, result[0]?.error);
      totalFailed++;
    }
  }
  return { totalSent, totalFailed };
}
