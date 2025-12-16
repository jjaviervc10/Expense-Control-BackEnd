// src/middlewares/verifyToken.js
import jwt from "jsonwebtoken";

export const verifyToken = (req, res, next) => {
    const header = req.headers["authorization"]; // "Bearer <token>"
    const token = header ? header.split(" ")[1] : null; // 👈 sin ?. para evitar error de sintaxis

    console.log("JWT_SECRET (verify):", process.env.JWT_SECRET);
    console.log("Authorization header:", req.headers.authorization);


    if (!token) {
        return res.status(401).json({
            ok: false,
            message: "Token no proporcionado",
        });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded; // { id, correo, rol }
        next();
    } catch (error) {
        return res.status(401).json({
            ok: false,
            message: "Token inválido o expirado",
        });
    }
};