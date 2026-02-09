// Servicio para validación de imagen y generación de signed URL
class ReceiptStorageService {
  // Valida formato y genera signed URL
  async validateAndSignUrl(imagePath) {
    // Validar formato de imagen
    const allowedExtensions = ['jpg', 'jpeg', 'png', 'webp'];
    const ext = imagePath.split('.').pop().toLowerCase();
    if (!allowedExtensions.includes(ext)) {
      return { signedUrl: null };
    }

    // Generar signed URL usando Supabase Storage
    const { createClient } = require('@supabase/supabase-js');
    const SUPABASE_URL = process.env.SUPABASE_URL;
    const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;
    const BUCKET = 'receipts';
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

    // Generar signed URL válido por 5 minutos
    const { data, error } = await supabase.storage
      .from(BUCKET)
      .createSignedUrl(imagePath, 300);
    if (error || !data?.signedUrl) {
      return { signedUrl: null };
    }
    return { signedUrl: data.signedUrl };
  }
}

export default new ReceiptStorageService();
