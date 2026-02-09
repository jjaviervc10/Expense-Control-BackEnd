// src/controllers/admin.controller.js
import supabase from "../supabase.js";

// Lista TODOS los usuarios (luego puedes filtrar por rol, prueba, etc.)
export const listarUsuarios = async(req, res) => {
    const { data, error } = await supabase
        .from("sUsuario")
        .select("idUsuario, usuario, nombreCompleto, correo, activo, fechaExpiracion, ultimoPago, rol");

    if (error) {
        return res.status(500).json({
            ok: false,
            message: "Error al obtener usuarios",
            error: error.message,
        });
    }

    return res.json({
        ok: true,
        usuarios: data,
    });
};

// Activar pago y poner nueva fecha de expiración (30 días) + ultimoPago
export const adminActivarPagoUsuario = async(req, res) => {
    const { idUsuario } = req.body;

    if (!idUsuario) {
        return res.status(400).json({
            ok: false,
            message: "idUsuario es obligatorio",
        });
    }

    const nuevaFecha = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();

    const { data, error } = await supabase
        .from("sUsuario")
        .update({
            activo: true,
            fechaExpiracion: nuevaFecha,
            ultimoPago: new Date().toISOString(),
        })
        .eq("idUsuario", idUsuario)
        .select();

    if (error) {
        return res.status(500).json({
            ok: false,
            message: "Error al activar pago",
            error: error.message,
        });
    }

    if (!data || data.length === 0) {
        return res.status(404).json({
            ok: false,
            message: "Usuario no encontrado",
        });
    }

    return res.json({
        ok: true,
        message: "Pago activado correctamente",
        usuario: data[0],
    });
};

// Eliminar usuario
export const eliminarUsuario = async(req, res) => {
    const { idUsuario } = req.params;

    const { error } = await supabase
        .from("sUsuario")
        .delete()
        .eq("idUsuario", idUsuario);

    if (error) {
        return res.status(500).json({
            ok: false,
            message: "Error al eliminar usuario",
            error: error.message,
        });
    }

    return res.json({
        ok: true,
        message: "Usuario eliminado correctamente",
    });
};