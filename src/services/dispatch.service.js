// DispatchService: Envío por lote con concurrencia limitada
import pLimit from 'p-limit';
import { sendPushNotification } from './push.service.js';

export async function sendBatchNotifications(subscriptions, payload, concurrency = 10) {
  const limit = pLimit(concurrency);
  const results = await Promise.all(
    subscriptions.map(sub =>
      limit(() => sendPushNotification(sub.subscription, payload))
    )
  );
  return results;
}
