// Servicio para guardar registro y eliminar imagen tras procesamiento
import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';
import db from '../../supabase.js';
class ReceiptPersistenceService {
  // Guarda registro, crea gastos, elimina imagen y actualiza campos
  async persistAndCleanup(parsedReceipt, userId, imagePath) {
    const SUPABASE_URL = process.env.SUPABASE_URL;
    const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;
    const BUCKET = 'receipts';
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

    try {
      // Evitar duplicados: hash por imagen + usuario
      const hash = crypto.createHash('sha256').update(imagePath + userId).digest('hex');
      const exists = await db.query('SELECT id FROM receipt_scans WHERE idusuario = $1 AND image_path = $2', [userId, imagePath]);
      if (exists.rows.length > 0) {
        return { success: false };
      }

      // Guardar registro en receipt_scans
      await db.query(
        'INSERT INTO receipt_scans (idusuario, image_path, status, extracted, created_at, processed_at, image_deleted) VALUES ($1, $2, $3, $4, now(), now(), $5)',
        [userId, imagePath, 'processed', parsedReceipt, true]
      );

      // Crear gastos asociados (ejemplo básico)
      if (Array.isArray(parsedReceipt.items)) {
        for (const item of parsedReceipt.items) {
          await db.query(
            'INSERT INTO gastos (idusuario, nombre, precio, categoria, fecha, created_at) VALUES ($1, $2, $3, $4, $5, now())',
            [userId, item.nombre, item.precio, item.categoria, parsedReceipt.fecha]
          );
        }
      }

      // Eliminar imagen de Supabase Storage
      await supabase.storage.from(BUCKET).remove([imagePath]);

      // Actualizar registro: image_path a null, image_deleted a true
      await db.query('UPDATE receipt_scans SET image_path = null, image_deleted = true WHERE idusuario = $1 AND image_path = $2', [userId, imagePath]);

      return { success: true };
    } catch (error) {
      return { success: false };
    }
  }
}

export default new ReceiptPersistenceService();
