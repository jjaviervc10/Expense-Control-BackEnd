// push.repository.js
// Acceso a Supabase para push_subscriptions alineado a la estructura y constraints
import supabase from '../supabase.js';

/**
 * Guarda o actualiza una suscripción push (UPSERT)
 * - Si existe (idusuario + endpoint): actualiza device_type, updated_at
 * - Si no existe: inserta nueva
 * - Valida que subscription tenga endpoint válido
 */
export async function saveSubscription({ idusuario, subscription, device_type }) {
  if (!subscription || typeof subscription.endpoint !== 'string' || !subscription.endpoint) {
    throw new Error('subscription.endpoint inválido');
  }
  if (!subscription.keys || !subscription.keys.auth || !subscription.keys.p256dh) {
    throw new Error('subscription.keys incompletos');
  }
  // UPSERT usando RPC o query raw (Supabase no soporta ON CONFLICT directo en JS)
  // Aquí usamos una lógica de upsert manual
  const { data: existing, error: findError } = await supabase
    .from('push_subscriptions')
    .select('id')
    .eq('idusuario', idusuario)
    .eq('subscription->>endpoint', subscription.endpoint)
    .maybeSingle();

  if (findError) throw findError;

  if (existing) {
    // Actualiza device_type y updated_at
    const { error: updateError } = await supabase
      .from('push_subscriptions')
      .update({ subscription, device_type, updated_at: new Date().toISOString() })
      .eq('id', existing.id);
    if (updateError) throw updateError;
    return { updated: true };
  } else {
    const { error: insertError } = await supabase
      .from('push_subscriptions')
      .insert([{ idusuario, subscription, device_type }]);
    if (insertError) throw insertError;
    return { inserted: true };
  }
}

/**
 * Elimina una suscripción por endpoint
 */
export async function deleteSubscriptionByEndpoint(endpoint) {
  if (!endpoint) return;
  await supabase
    .from('push_subscriptions')
    .delete()
    .eq('subscription->>endpoint', endpoint);
}

/**
 * Actualiza last_success para un endpoint
 */
export async function markSuccess(endpoint) {
  await supabase
    .from('push_subscriptions')
    .update({ last_success: new Date().toISOString(), last_error: null })
    .eq('subscription->>endpoint', endpoint);
}

/**
 * Actualiza last_error para un endpoint
 */
export async function markError(endpoint, error) {
  await supabase
    .from('push_subscriptions')
    .update({ last_error: error, updated_at: new Date().toISOString() })
    .eq('subscription->>endpoint', endpoint);
}

/**
 * Obtiene todas las suscripciones de un usuario (paginado)
 */
export async function getUserSubscriptions(idusuario, limit = 1000, offset = 0) {
  const { data, error } = await supabase
    .from('push_subscriptions')
    .select('*')
    .eq('idusuario', idusuario)
    .range(offset, offset + limit - 1);
  if (error) throw error;
  return data || [];
}
