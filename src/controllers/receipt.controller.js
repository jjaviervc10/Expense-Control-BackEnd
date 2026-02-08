// Servicio para orquestar el flujo de procesamiento de tickets
class ReceiptController {
  // Recibe request del frontend, valida usuario y referencia de imagen
  async processReceipt(req, res) {
    try {
      const { imagePath } = req.body;
      const userId = req.user?.idUsuario;
      if (!imagePath || !userId) {
        return res.status(400).json({ message: 'Faltan datos requeridos' });
      }

      // Validar y generar signed URL
      const storageService = require('../services/receiptStorage.service');
      const { signedUrl } = await storageService.validateAndSignUrl(imagePath);
      if (!signedUrl) {
        return res.status(400).json({ message: 'URL de imagen inválida' });
      }

      // Extraer texto con OpenAI Vision
      const visionService = require('../services/receiptVision.service');
      const { rawText } = await visionService.extractTextFromImage(signedUrl);
      if (!rawText) {
        return res.status(502).json({ message: 'Error al extraer texto de imagen' });
      }

      // Parsear y clasificar productos
      const parserService = require('../services/receiptParser.service');
      const { parsed } = await parserService.parseAndClassify(rawText);
      if (!parsed) {
        return res.status(502).json({ message: 'Error al parsear ticket' });
      }

      // Guardar registro y eliminar imagen
      const persistenceService = require('../services/receiptPersistence.service');
      const { success } = await persistenceService.persistAndCleanup(parsed, userId, imagePath);
      if (!success) {
        return res.status(500).json({ message: 'Error al guardar ticket o eliminar imagen' });
      }

      // Responder al frontend con datos procesados
      return res.status(200).json({ message: 'Ticket procesado exitosamente', data: parsed });
    } catch (error) {
      return res.status(500).json({ message: 'Error interno', error: error.message });
    }
  }
}

module.exports = new ReceiptController();
