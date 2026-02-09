// src/controllers/auth.controller.js

import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import supabase from "../supabase.js";

// -----------------------------------------------------------
//  LOGIN
// -----------------------------------------------------------
export const loginUser = async(req, res) => {
    const { correo, password } = req.body;

    if (!correo || !password) {
        return res.status(400).json({
            ok: false,
            message: "Correo y contraseña son obligatorios",
        });
    }

    const { data: user, error } = await supabase
        .from("sUsuario")
        .select("idUsuario, usuario, nombreCompleto, correo, pass, fechaExpiracion, activo, rol")
        .eq("correo", correo)
        .single();

    if (error || !user) {
        return res.status(401).json({
            ok: false,
            message: "Credenciales incorrectas",
        });
    }

    const validPassword = bcrypt.compareSync(password, user.pass);
    if (!validPassword) {
        return res.status(400).json({
            ok: false,
            message: "Contraseña incorrecta",
        });
    }

    if (!user.activo) {
        return res.status(403).json({
            ok: false,
            message: "Tu prueba ha expirado o tu pago no está activo",
            requierePago: true,
            fechaExpiracion: user.fechaExpiracion,
        });
    }

    const token = jwt.sign({ id: user.idUsuario, correo: user.correo, rol: user.rol },
        process.env.JWT_SECRET, { expiresIn: "12h" }
    );

    return res.json({
        ok: true,
        message: "Login exitoso",
        user: {
            id: user.idUsuario,
            nombre: user.nombreCompleto,
            correo: user.correo,
            rol: user.rol,
            fechaExpiracion: user.fechaExpiracion,
        },
        token,
    });
};

// -----------------------------------------------------------
//  REGISTER (PRUEBA GRATIS POR TRIGGER)
// -----------------------------------------------------------
export const registerUser = async(req, res) => {
    const { usuario, correo, pass, nombreCompleto, telefono } = req.body;

    if (!usuario || !correo || !pass || !nombreCompleto) {
        return res.status(400).json({
            ok: false,
            message: "Todos los campos son obligatorios",
        });
    }

    const { data: existingUser } = await supabase
        .from("sUsuario")
        .select("idUsuario")
        .eq("correo", correo)
        .maybeSingle();

    if (existingUser) {
        return res.status(409).json({
            ok: false,
            message: "El correo ya está registrado",
        });
    }

    const hashedPassword = bcrypt.hashSync(pass, bcrypt.genSaltSync(10));

    const { data, error } = await supabase
        .from("sUsuario")
        .insert([{
            usuario,
            correo,
            pass: hashedPassword,
            nombreCompleto,
            telefono,
            rol: "usuario", // por defecto
            activo: true,
            fechaRegistro: new Date().toISOString(),
        }, ])
        .select()
        .single();

    if (error) {
        return res.status(500).json({
            ok: false,
            message: "Error al registrar usuario",
            error: error.message,
        });
    }

    return res.json({
        ok: true,
        message: "Usuario registrado correctamente (Prueba activa)",
        user: data,
    });
};

// -----------------------------------------------------------
//  ✅ ACTIVAR PAGO (ADMIN)
// -----------------------------------------------------------
export const activarPagoUsuario = async(req, res) => {
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

// -----------------------------------------------------------
//  ✅ LISTAR USUARIOS (ADMIN)
// -----------------------------------------------------------
export const getUsuariosAdmin = async(req, res) => {
    const { data, error } = await supabase
        .from("sUsuario")
        .select("idUsuario, usuario, nombreCompleto, correo, telefono, activo, fechaExpiracion, rol")
        .order("idUsuario", { ascending: true });

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

// -----------------------------------------------------------
//  ✅ ELIMINAR USUARIO (ADMIN)
// -----------------------------------------------------------
export const deleteUsuario = async(req, res) => {
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