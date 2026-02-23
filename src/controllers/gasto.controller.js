// src/controllers/gasto.controller.js
// Endpoint para marcar/desmarcar gasto como favorito
export const marcarFavorito = async(req, res) => {
    const { idGasto, favorito } = req.body;
    const idUsuario = req.user.id;
    if (!idGasto || typeof favorito !== "boolean") {
        return res.status(400).json({ ok: false, message: "Datos incompletos" });
    }
    const { error } = await supabase
        .from("cGasto")
        .update({ favorito })
        .eq("idGasto", idGasto)
        .eq("idUsuario", idUsuario);
    if (error) {
        return res.status(500).json({ ok: false, message: "Error al actualizar favorito", error: error.message });
    }
    return res.json({ ok: true, message: "Favorito actualizado" });
};

// Endpoint para consultar gastos favoritos
export const obtenerFavoritos = async(req, res) => {
    const idUsuario = req.user.id;
    const { data, error } = await supabase
        .from("cGasto")
        .select("*")
        .eq("idUsuario", idUsuario)
        .eq("favorito", true)
        .eq("activo", true);
    if (error) {
        return res.status(500).json({ ok: false, message: "Error al obtener favoritos", error: error.message });
    }
    return res.json({ ok: true, favoritos: data });
};

// Endpoint para registrar gasto favorito (crear nuevo gasto basado en uno favorito)
export const registrarGastoFavorito = async(req, res) => {
    const { idGasto } = req.body;
    const idUsuario = req.user.id;
    if (!idGasto) {
        return res.status(400).json({ ok: false, message: "Datos incompletos" });
    }
    // Obtener gasto favorito
    const { data: favorito, error: errorFav } = await supabase
        .from("cGasto")
        .select("categoria, monto, tipo")
        .eq("idGasto", idGasto)
        .eq("idUsuario", idUsuario)
        .eq("favorito", true)
        .single();
    if (errorFav || !favorito) {
        return res.status(404).json({ ok: false, message: "Favorito no encontrado", error: errorFav?.message });
    }
    // Crear nuevo gasto basado en favorito
    const { data, error } = await supabase
        .from("cGasto")
        .insert([{ ...favorito, idUsuario, fecha: new Date().toISOString(), activo: true, favorito: false }])
        .select()
        .single();
    if (error) {
        return res.status(500).json({ ok: false, message: "Error al registrar gasto favorito", error: error.message });
    }
    return res.json({ ok: true, gasto: data });
};
import supabase from "../supabase.js";

/* ==========================
   MAPA DE CATEGORÍAS
========================== */
const CATEGORIAS = {
    "1": "Ahorro",
    "2": "Comida",
    "3": "Casa",
    "4": "Gastos Varios",
    "5": "Ocio",
    "6": "Salud",
    "7": "Suscripciones",
    "8": "Ropa",
    "9": "Productos"
};

export const crearGasto = async(req, res) => {
    const { tipo, categoria, monto, fecha } = req.body;
    const idUsuario = req.user.id;

    if (!tipo || !categoria || !monto) {
        return res.status(400).json({
            ok: false,
            message: "Datos incompletos"
        });
    }

    // 🔁 Convertir ID → nombre
    const categoriaNombre = CATEGORIAS[categoria];
    if (!categoriaNombre) {
        return res.status(400).json({
            ok: false,
            message: "Categoría inválida"
        });
    }

    const { data, error } = await supabase
        .from("cGasto")
        .insert([{
            tipo,
            categoria: categoriaNombre, // ✅ SE GUARDA EL NOMBRE
            monto,
            fecha: fecha || new Date().toISOString(),
            idUsuario,
            activo: true
        }])
        .select()
        .single();

    if (error) {
        return res.status(500).json({
            ok: false,
            message: "Error al guardar gasto",
            error: error.message
        });
    }

    return res.json({
        ok: true,
        gasto: data
    });
};

export const obtenerGastosPorTipo = async(req, res) => {
    const idUsuario = req.user.id;
    const { tipo } = req.query;

    if (!tipo) {
        return res.status(400).json({
            ok: false,
            message: "Tipo de reporte requerido (diario, semanal, mensual)"
        });
    }

    const { data, error } = await supabase
        .from("cGasto")
        .select("*")
        .eq("idUsuario", idUsuario)
        .eq("tipo", tipo)
        .eq("activo", true);

    if (error) {
        return res.status(500).json({
            ok: false,
            message: "Error al obtener gastos",
            error: error.message
        });
    }

    return res.json({
        ok: true,
        gastos: data
    });
};