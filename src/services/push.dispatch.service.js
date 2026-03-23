// push.dispatch.service.js
// Envío robusto de notificaciones push con retry, limpieza y tracking
import webpush from 'web-push';
import pLimit from 'p-limit';
import { deleteSubscriptionByEndpoint, markSuccess, markError } from '../repositories/push.repository.js';
import logger from '../utils/logger.js';

const RETRYABLE_STATUS = [429, 500, 502, 503, 504];
const FATAL_STATUS = [403, 404, 410];

/**
 * Envía una notificación a una suscripción con retry/backoff y limpieza
 */
export async function sendNotificationWithRetry({ subscription, idusuario }, payload, maxRetries = 3) {
  let attempt = 0;
  let lastError = null;
  while (attempt < maxRetries) {
    try {
      await webpush.sendNotification(subscription, JSON.stringify(payload));
      await markSuccess(subscription.endpoint);
      logger.info({ endpoint: subscription.endpoint, idusuario, attempt, status: 'success' }, 'Push sent');
      return { ok: true };
    } catch (err) {
      lastError = err;
      const statusCode = err.statusCode;
      logger.warn({ endpoint: subscription.endpoint, idusuario, attempt, statusCode, error: err.message }, 'Push failed');
      if (FATAL_STATUS.includes(statusCode)) {
        await deleteSubscriptionByEndpoint(subscription.endpoint);
        logger.info({ endpoint: subscription.endpoint, idusuario, statusCode }, 'Endpoint deleted');
        return { ok: false, deleted: true };
      }
      if (!RETRYABLE_STATUS.includes(statusCode)) break;
      await new Promise(r => setTimeout(r, 500 * (attempt + 1)));
      attempt++;
    }
  }
  await markError(subscription.endpoint, lastError ? `${lastError.statusCode || ''} ${lastError.message}` : 'Unknown error');
  return { ok: false, error: lastError };
}

/**
 * Envía notificaciones a múltiples suscripciones en paralelo (con límite)
 */
export async function sendNotificationsBatch(subscriptions, payload, concurrency = 10) {
  const limit = pLimit(concurrency);
  return Promise.all(subscriptions.map(sub =>
    limit(() => sendNotificationWithRetry(sub, payload))
  ));
}
