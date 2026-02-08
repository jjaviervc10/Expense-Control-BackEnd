// MetricsService: Registra envíos en notifications_log y consulta anti-fatiga
import { supabase } from '../supabase.js';

export async function logNotification({ idusuario, tipo, horario, variante, enviado_at }) {
  await supabase.from('notifications_log').insert([
    { idusuario, tipo, horario, variante, enviado_at }
  ]);
}

export async function getUserNotificationCount(idusuario, tipo, date) {
  // Cuenta notificaciones enviadas por usuario/tipo en el día
  const { data, error } = await supabase
    .from('notifications_log')
    .select('id')
    .eq('idusuario', idusuario)
    .eq('tipo', tipo)
    .gte('enviado_at', `${date}T00:00:00Z`)
    .lte('enviado_at', `${date}T23:59:59Z`);
  if (error) {
    console.error('Error consultando anti-fatiga:', error);
    return 0;
  }
  return data.length;
}
