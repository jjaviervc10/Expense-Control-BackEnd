// src/middlewares/requireAdmin.js
export const requireAdmin = (req, res, next) => {
    // verifyToken ya debió rellenar req.user
    if (!req.user || req.user.rol !== "admin") {
        return res.status(403).json({
            ok: false,
            message: "Acceso solo para administradores",
        });
    }
    next();
};