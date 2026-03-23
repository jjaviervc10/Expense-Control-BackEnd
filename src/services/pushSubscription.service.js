// pushSubscription.service.js
// Lógica de negocio para notificaciones push alineada a la estructura de producción
import { saveSubscription } from '../repositories/push.repository.js';

/**
 * Registra o actualiza una suscripción push
 * Valida datos y delega a repository (upsert)
 */
export async function registerPushSubscription({ idusuario, subscription, device_type }) {
  // Validación estricta
  if (!idusuario || typeof idusuario !== 'number') throw new Error('idusuario inválido');
  if (!subscription || typeof subscription.endpoint !== 'string' || !subscription.endpoint) {
    throw new Error('subscription.endpoint inválido');
  }
  if (!subscription.keys || !subscription.keys.auth || !subscription.keys.p256dh) {
    throw new Error('subscription.keys incompletos');
  }
  if (!device_type) throw new Error('device_type requerido');
  // Guarda o actualiza
  return saveSubscription({ idusuario, subscription, device_type });
}
