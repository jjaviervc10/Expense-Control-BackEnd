import { supabase } from "../supabase.js";

export const crearPresupuesto = async(req, res) => {
    const { montoLimite, fechaInicio, fechaFin, categoria } = req.body;
    const idUsuario = req.user.id; // 🔐 del JWT

    // 🔒 Validaciones básicas
    if (!montoLimite || !fechaInicio || !fechaFin || !categoria) {
        return res.status(400).json({
            ok: false,
            message: "Todos los campos son obligatorios: montoLimite, fechaInicio, fechaFin y categoria"
        });
    }

    if (new Date(fechaInicio) >= new Date(fechaFin)) {
        return res.status(400).json({
            ok: false,
            message: "fechaInicio debe ser menor que fechaFin"
        });
    }

    // 🔎 Validar que no exista presupuesto activo para el mismo usuario, rango y categoría
    const { data: existente } = await supabase
        .from("cPresupuesto")
        .select("id")
        .eq("idUsuario", idUsuario)
        .eq("categoria", categoria) // ✅ Filtramos por categoría
        .or(`fechaInicio.lte.${fechaFin},fechaFin.gte.${fechaInicio}`)
        .maybeSingle();

    if (existente) {
        return res.status(409).json({
            ok: false,
            message: "Ya existe un presupuesto activo en ese rango de fechas y categoría"
        });
    }

    // ✅ Insertar presupuesto
    const { data, error } = await supabase
        .from("cPresupuesto")
        .insert([{
            idUsuario,
            montoLimite,
            fechaInicio,
            fechaFin,
            categoria // ✅ Guardamos la categoría
        }])
        .select()
        .single();

    if (error) {
        return res.status(500).json({
            ok: false,
            message: "Error al crear presupuesto",
            error: error.message
        });
    }

    return res.json({
        ok: true,
        presupuesto: data
    });
};

export const obtenerPresupuestoActivo = async(req, res) => {
    const idUsuario = req.user.id;
    const { categoria } = req.query;

    if (!categoria) {
        return res.status(400).json({
            ok: false,
            message: "La categoría es obligatoria (diario, semanal, mensual)"
        });
    }

    const hoy = new Date().toISOString();

    const { data, error } = await supabase
        .from("cPresupuesto")
        .select("*")
        .eq("idUsuario", idUsuario)
        .eq("categoria", categoria)
        .lte("fechaInicio", hoy)
        .gte("fechaFin", hoy)
        .maybeSingle();

    if (error) {
        return res.status(500).json({
            ok: false,
            message: "Error al obtener presupuesto activo",
            error: error.message
        });
    }

    if (!data) {
        return res.status(404).json({
            ok: false,
            message: "No hay presupuesto activo para hoy"
        });
    }

    return res.json({
        ok: true,
        presupuesto: data
    });
};