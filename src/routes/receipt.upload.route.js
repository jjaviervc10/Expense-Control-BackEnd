import express from "express";
import multer from "multer";
import { createClient } from "@supabase/supabase-js";

const router = express.Router();
const upload = multer(); // memory storage

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// POST /api/receipt/upload
router.post("/upload", upload.single("file"), async (req, res) => {
  try {
    console.log("[UPLOAD] req.file:", req.file);
    console.log("[UPLOAD] req.body:", req.body);
    const userId = req.user?.idUsuario || req.body.userId || "anon";
    if (!req.file) {
      return res.status(400).json({ message: "No se recibió archivo" });
    }
    const fileBuffer = req.file.buffer;
    const originalName = req.file.originalname;
    const ext = originalName.split(".").pop();
    const fileName = `${userId}_${Date.now()}_${originalName}`;
    const filePath = `user_${userId}/${fileName}`;

    // Subir a Supabase Storage (bucket privado)
    const { error: uploadError } = await supabase.storage
      .from("receipts")
      .upload(filePath, fileBuffer, {
        contentType: req.file.mimetype,
        upsert: false,
      });
    if (uploadError) {
      return res.status(500).json({ message: "Error subiendo a Supabase", error: uploadError.message });
    }

    // Generar signed URL (24h)
    const { data: signed, error: signError } = await supabase.storage
      .from("receipts")
      .createSignedUrl(filePath, 60 * 60 * 24);
    if (signError) {
      return res.status(500).json({ message: "Error generando signed URL", error: signError.message });
    }

    return res.status(200).json({ imageUrl: signed.signedUrl, filePath });
  } catch (err) {
    return res.status(500).json({ message: "Error interno", error: err.message });
  }
});

export default router;
