import { clasificarItem } from '../helpers/categorias.js';
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

    // Clasifica cada item usando el helper
    if (Array.isArray(receiptData.items)) {
      receiptData.items = receiptData.items.map(item => {
        return { ...item, categoria: clasificarItem(item.nombre) };
      });
    }

    return { parsed: receiptData };
  }
}

export default new ReceiptParserService();
