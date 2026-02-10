// Servicio para guardar registro y eliminar imagen tras procesamiento
import supabase from '../supabase.js';

class ReceiptPersistenceService {
  // Guarda registro, crea gastos, elimina imagen y actualiza campos
  async persistAndCleanup(parsedReceipt, userId, imagePath) {
    try {
      // 1️⃣ Guardar recibo
      const { data: receipt, error } = await supabase
        .from('receipts')
        .insert({
          idusuario: userId,
          total: parsedReceipt.total,
          moneda: parsedReceipt.moneda,
          comercio: parsedReceipt.comercio,
          fecha: parsedReceipt.fecha,
          image_path: imagePath,
          raw_data: parsedReceipt
        })
        .select()
        .single();
      if (error) throw error;

      // 2️⃣ Guardar items
      if (Array.isArray(parsedReceipt.items)) {
        const items = parsedReceipt.items.map(item => ({
          receipt_id: receipt.id,
          nombre: item.nombre,
          precio: item.precio,
          categoria: item.categoria || null
        }));
        const { error: itemsError } = await supabase.from('receipt_items').insert(items);
        if (itemsError) throw itemsError;
      }

      // 3️⃣ Eliminar imagen de Supabase Storage
      try {
        await supabase.storage.from('receipts').remove([imagePath]);
      } catch (err) {
        console.error('[receiptPersistence] Error al eliminar imagen de Supabase Storage:', err);
      }

      return { success: true };
    } catch (error) {
      console.error('[receiptPersistence] Error inesperado:', error);
      return { success: false };
    }
  }
}

export default new ReceiptPersistenceService();
