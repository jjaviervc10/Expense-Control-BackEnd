// src/services/email.service.js
import nodemailer from "nodemailer";
import fs from "fs";

const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    secure: false, // true solo si es 465
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

/**
 * Envía el PDF por correo
 */
export const enviarPdfPorEmail = async({
    to,
    subject,
    text,
    filePath,
}) => {
    await transporter.sendMail({
        from: `"Expense Control" <${process.env.EMAIL_USER}>`,
        to,
        subject,
        text,
        attachments: [{
            filename: "reporte-gastos.pdf",
            content: fs.createReadStream(filePath),
        }, ],
    });
};