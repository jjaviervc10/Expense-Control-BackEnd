// Servicio para consumir OpenAI Vision API
import axios from 'axios';
class ReceiptVisionService {
  // Envía imagen y prompt, retorna texto crudo
  async extractTextFromImage(signedUrl) {
    const OPENAI_KEY = process.env.OPENAI_KEY;
    // Prompt determinista para tickets
    const prompt = `Eres un sistema de extracción de datos. Analiza el ticket y devuelve exclusivamente JSON válido. Campos requeridos: comercio, fecha (YYYY-MM-DD), total (number), moneda, items (lista con nombre y precio). Si un campo no existe, usa null. No inventes información. No incluyas texto adicional.`;

    try {
      const response = await axios.post(
        'https://api.openai.com/v1/vision/text-extract',
        {
          image_url: signedUrl,
          prompt,
        },
        {
          headers: {
            'Authorization': `Bearer ${OPENAI_KEY}`,
            'Content-Type': 'application/json',
          },
          timeout: 15000, // 15 segundos
        }
      );
      if (response.data && response.data.text) {
        return { rawText: response.data.text };
      }
      console.error('[receiptVision] Respuesta inesperada:', response.data);
      return { rawText: null };
    } catch (error) {
      console.error('[receiptVision] Error al llamar a OpenAI Vision:', error?.response?.data || error.message || error);
      return { rawText: null };
    }
  }
}

export default new ReceiptVisionService();
