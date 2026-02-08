// AudienceService: Obtiene usuarios activos con suscripción push
import { supabase } from '../supabase.js';

export async function getActivePushSubscriptions() {
  // Query lineal: join push_subscriptions con sUsuario, filtra usuarios activos
  const { data, error } = await supabase
    .from('push_subscriptions')
    .select('id, idusuario, subscription')
    .eq('idusuario', supabase.from('sUsuario').select('idUsuario').eq('activo', true));
  // Nota: Este query puede requerir ajuste según supabase-js
  if (error) {
    console.error('Error obteniendo suscripciones activas:', error);
    return [];
  }
  return data || [];
}
