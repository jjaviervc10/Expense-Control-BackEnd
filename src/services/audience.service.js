// AudienceService: Obtiene usuarios activos con suscripción push
import supabase from '../supabase.js';

export async function getActivePushSubscriptions() {
  // 1. Obtén los idUsuario activos
  const { data: usuarios, error: errorUsuarios } = await supabase
    .from('sUsuario')
    .select('idUsuario')
    .eq('activo', true);

  if (errorUsuarios) {
    console.error('Error obteniendo usuarios activos:', errorUsuarios);
    return [];
  }
  const ids = usuarios.map(u => u.idUsuario);
  if (ids.length === 0) return [];

  // 2. Obtén las suscripciones de esos usuarios
  const { data, error } = await supabase
    .from('push_subscriptions')
    .select('id, idusuario, subscription')
    .in('idusuario', ids);
  if (error) {
    console.error('Error obteniendo suscripciones activas:', error);
    return [];
  }
  return data || [];
}
