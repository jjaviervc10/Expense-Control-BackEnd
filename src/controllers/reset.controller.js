// src/controllers/reset.controller.js
import { supabase } from "../supabase.js";
import { generarPdfGastos } from "../services/pdf.service.js";
import { enviarPdfPorEmail } from "../services/email.service.js";

import fs from "fs";

/**
 * 🔁 RESET DE PERIODO
 */
export const resetUsuario = async(req, res) => {
    const idUsuario = req.user.id;
    const { categoria } = req.body;

    if (!categoria) {
        return res.status(400).json({
            ok: false,
            message: "categoria es obligatoria",
        });
    }

    const tipo = categoria.toLowerCase();

    if (!["diario", "semanal", "mensual"].includes(tipo)) {
        return res.status(400).json({
            ok: false,
            message: "categoria inválida",
        });
    }

    // Obtener gastos antes de borrar
    const { data: gastos } = await supabase
        .from("cGasto")
        .select("idGasto")
        .eq("idUsuario", idUsuario)
        .eq("tipo", tipo);

    // Borrar gastos
    await supabase
        .from("cGasto")
        .delete()
        .eq("idUsuario", idUsuario)
        .eq("tipo", tipo);

    // Borrar presupuesto
    await supabase
        .from("cPresupuesto")
        .delete()
        .eq("idUsuario", idUsuario)
        .eq("categoria", tipo);

    return res.json({
        ok: true,
        message: `Periodo ${tipo} reiniciado correctamente`,
        gastosEliminados: gastos ? gastos.length : 0
    });
};

/**
 * 📄 GENERAR PDF
 */
export const generarPdf = async(req, res) => {
    const idUsuario = req.user.id;
    const { categoria } = req.body;

    if (!categoria) {
        return res.status(400).json({
            ok: false,
            message: "categoria es obligatoria",
        });
    }

    const tipo = categoria.toLowerCase();

    const { data: gastos, error } = await supabase
        .from("cGasto")
        .select("categoria, monto, fecha")
        .eq("idUsuario", idUsuario)
        .eq("tipo", tipo);

    if (error) {
        return res.status(500).json({
            ok: false,
            message: "Error al obtener gastos",
        });
    }

    // Generar PDF
    const filePath = await generarPdfGastos(
        req.user.correo,
        tipo,
        gastos
    );

    // Descargar y luego eliminar
    res.download(filePath, (err) => {
        if (err) console.error("Error al descargar PDF:", err);
        fs.unlink(filePath, () => {});
    });
};

export const enviarPdfEmail = async(req, res) => {
    const idUsuario = req.user.id;
    const correo = req.user.correo;
    const { categoria } = req.body;

    if (!categoria) {
        return res.status(400).json({
            ok: false,
            message: "categoria es obligatoria",
        });
    }

    const tipo = categoria.toLowerCase();

    const { data: gastos } = await supabase
        .from("cGasto")
        .select("categoria, monto, fecha")
        .eq("idUsuario", idUsuario)
        .eq("tipo", tipo);

    const filePath = await generarPdfGastos(
        correo,
        tipo,
        gastos
    );

    await enviarPdfPorEmail({
        to: correo,
        subject: "📄 Reporte de gastos",
        text: `Adjunto encontrarás tu reporte de gastos (${tipo}).`,
        filePath,
    });

    // Limpieza
    fs.unlink(filePath, () => {});

    return res.json({
        ok: true,
        message: "PDF enviado correctamente por correo",
    });
};