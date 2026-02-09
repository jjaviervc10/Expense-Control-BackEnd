// Servicio para orquestar el flujo de procesamiento de tickets
export default class ReceiptController {
  // Recibe request del frontend, valida usuario y referencia de imagen
  async processReceipt(req, res) {
    try {
      console.log('[processReceipt] req.body:', req.body);
      console.log('[processReceipt] req.user:', req.user);
      const { imagePath } = req.body;
      // Permitir ambos: idUsuario (viejo) o id (nuevo)
      const userId = req.user?.idUsuario || req.user?.id;
      console.log('[processReceipt] userId extraído:', userId);
      if (!imagePath || !userId) {
        return res.status(400).json({ message: 'Faltan datos requeridos' });
      }


      // Validar y generar signed URL (import dinámico compatible con ES Modules)
      const storageService = (await import('../services/receiptStorage.service.js')).default || (await import('../services/receiptStorage.service.js'));
      const { signedUrl } = await storageService.validateAndSignUrl(imagePath);
      if (!signedUrl) {
        return res.status(400).json({ message: 'URL de imagen inválida' });
      }

      // Extraer texto con OpenAI Vision
      const visionService = (await import('../services/receiptVision.service.js')).default || (await import('../services/receiptVision.service.js'));
      const { rawText } = await visionService.extractTextFromImage(signedUrl);
      if (!rawText) {
        return res.status(502).json({ message: 'Error al extraer texto de imagen' });
      }

      // Parsear y clasificar productos
      const parserService = (await import('../services/receiptParser.service.js')).default || (await import('../services/receiptParser.service.js'));
      const { parsed } = await parserService.parseAndClassify(rawText);
      if (!parsed) {
        return res.status(502).json({ message: 'Error al parsear ticket' });
      }

      // Guardar registro y eliminar imagen
      const persistenceService = (await import('../services/receiptPersistence.service.js')).default || (await import('../services/receiptPersistence.service.js'));
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
