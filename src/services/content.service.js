// ContentService: Selecciona el copy adecuado según tipo, horario y variante

const copyBySlot = {
  '9am': [
    'Buenos días ☀️ recuerda registrar tus gastos',
    '¡Arranca tu día registrando tus gastos!'
  ],
  '12pm': [
    '¿Cómo vas hoy con tus gastos?',
    'Hora de revisar tus gastos del mediodía'
  ],
  '3pm': [
    'Revisa si te falta algún gasto por registrar',
    '¿Olvidaste algún gasto? Es momento de registrarlo'
  ],
  '6pm': [
    'Último empujón del día 💪',
    'Antes de cenar, revisa tus gastos'
  ],
  '9pm': [
    'Antes de dormir, revisa tus gastos de hoy 🌙',
    'Cierra el día con tus gastos registrados'
  ]
};

const motivationalPool = [
  '¡Llevas una buena racha! 🚀',
  'Tu rendimiento financiero te está esperando 💪',
  '¡Sigues adelante con tus metas! 🎯',
  '¡Excelente control de gastos! ✨',
  '¡No te detengas, tu hábito está creciendo!'
];

const seasonalCampaigns = {
  'verano': '¡Aprovecha el verano para ahorrar y disfrutar!',
  'diciembre': '¡Cierra el año con tus gastos bajo control!',
  'regreso_clases': '¡Prepara tu presupuesto para el regreso a clases!',
  'fin_mes': '¡Revisa tu resumen de fin de mes!',
  'inicio_ano': '¡Empieza el año con buenos hábitos financieros!'
};

export function selectCopy(tipo, horario, idusuario, metrics = {}, campaign = null) {
  const date = new Date().toISOString().slice(0, 10);
  if (tipo === 'motivacion') {
    // Motivacional: pool, rotación A/B
    const hash = Math.abs(hashCode(`${idusuario}-${date}-motivacion`));
    const variantIndex = hash % motivationalPool.length;
    return motivationalPool[variantIndex];
  }
  if (tipo === 'resumen') {
    // Resumen: personalizado con métricas
    return `Esta semana registraste ${metrics.gastosSemana || 0} gastos en ${metrics.diasHabito || 0} días. Promedio diario: $${metrics.promedioDia || 0}`;
  }
  if (tipo === 'estacional' && campaign && seasonalCampaigns[campaign]) {
    return seasonalCampaigns[campaign];
  }
  // Recordatorio por slot
  const variants = copyBySlot[horario] || copyBySlot['9pm'];
  const hash = Math.abs(hashCode(`${idusuario}-${date}-${horario}`));
  const variantIndex = hash % variants.length;
  return variants[variantIndex];
}

function hashCode(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash) + str.charCodeAt(i);
    hash |= 0;
  }
  return hash;
}
