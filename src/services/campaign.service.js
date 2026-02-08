// CampaignService: Determina si hay campaña estacional activa
export function getActiveCampaign(date = new Date()) {
  // Ejemplo simple: retorna campaña según mes
  const month = date.getMonth() + 1;
  if (month === 12) return 'diciembre';
  if (month === 1) return 'inicio_ano';
  if (month === 7 || month === 8) return 'verano';
  if (month === 3) return 'regreso_clases';
  if ([4,8,11].includes(month)) return 'fin_mes';
  return null;
}
