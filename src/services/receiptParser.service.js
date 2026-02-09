// Servicio para parsing y clasificación de productos
class ReceiptParserService {
  // Convierte texto crudo a JSON estructurado y clasifica productos
  async parseAndClassify(rawText) {
    // Intenta parsear el texto a JSON
    let receiptData;
    try {
      receiptData = JSON.parse(rawText);
    } catch (e) {
      return { parsed: null };
    }

    // Clasificación de productos
    const categorias = {
      'Ahorro': ['ahorro', 'deposito', 'inversion'],
      'Comida': ['cafe', 'pan', 'restaurante', 'comida', 'hamburguesa', 'pizza', 'bebida'],
      'Casa': ['renta', 'luz', 'agua', 'gas', 'mantenimiento', 'hogar'],
      'Gastos Varios': ['papeleria', 'miscelaneo', 'varios', 'otros'],
      'Ocio': ['cine', 'juego', 'ocio', 'entretenimiento', 'bar'],
      'Salud': ['medicamento', 'farmacia', 'doctor', 'salud', 'consulta'],
      'Suscripciones': ['netflix', 'spotify', 'suscripcion', 'amazon', 'disney']
    };

    // Clasifica cada item
    if (Array.isArray(receiptData.items)) {
      receiptData.items = receiptData.items.map(item => {
        let categoria = 'Gastos Varios';
        for (const [cat, keywords] of Object.entries(categorias)) {
          if (keywords.some(k => item.nombre.toLowerCase().includes(k))) {
            categoria = cat;
            break;
          }
        }
        return { ...item, categoria };
      });
    }

    return { parsed: receiptData };
  }
}

export default new ReceiptParserService();
