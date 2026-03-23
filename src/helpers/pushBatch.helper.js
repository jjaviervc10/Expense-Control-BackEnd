// pushBatch.helper.js
// Paginación y envío paralelo de notificaciones push
import { getUserSubscriptions } from '../repositories/push.repository.js';
import { sendNotificationsBatch } from '../services/push.dispatch.service.js';

/**
 * Envía notificaciones a todos los endpoints de un usuario, paginando
 */
export async function notifyUserInBatches(idusuario, payload, batchSize = 500, concurrency = 10) {
  let offset = 0;
  while (true) {
    const subs = await getUserSubscriptions(idusuario, batchSize, offset);
    if (!subs.length) break;
    await sendNotificationsBatch(subs, payload, concurrency);
    offset += batchSize;
  }
}
