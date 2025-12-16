// src/services/pdf.service.js
import PdfPrinter from "pdfmake";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

// Resolver __dirname en ES Modules
const __filename = fileURLToPath(
    import.meta.url);
const __dirname = path.dirname(__filename);

// Fuentes locales
const fonts = {
    Roboto: {
        normal: path.join(__dirname, "../fonts/Roboto-Regular.ttf"),
        bold: path.join(__dirname, "../fonts/Roboto-Bold.ttf"),
    },
};

// Inicializar pdfmake
const printer = new PdfPrinter(fonts);

/**
 * Genera un PDF con los gastos del usuario
 * @param {string} usuario
 * @param {string} categoria
 * @param {Array} gastos
 * @returns {Promise<string>}
 */
export const generarPdfGastos = (usuario, categoria, gastos) => {
    return new Promise((resolve, reject) => {
        try {
            const outputPath = path.join(
                __dirname,
                `../../tmp/gastos-${Date.now()}.pdf`
            );

            const docDefinition = {
                content: [
                    { text: "Reporte de Gastos", style: "header" },
                    { text: `Periodo: ${categoria}` },
                    { text: `Usuario: ${usuario}`, margin: [0, 0, 0, 10] },

                    gastos.length === 0 ? { text: "No hay gastos registrados para este periodo" } : {
                        table: {
                            widths: ["*", "auto", "auto"],
                            body: [
                                ["Categoría", "Monto", "Fecha"],
                                ...gastos.map((g) => [
                                    g.categoria,
                                    `$${g.monto}`,
                                    new Date(g.fecha).toLocaleDateString(),
                                ]),
                            ],
                        },
                    },
                ],
                styles: {
                    header: { fontSize: 18, bold: true },
                },
                defaultStyle: {
                    font: "Roboto",
                },
            };

            const pdfDoc = printer.createPdfKitDocument(docDefinition);
            const stream = fs.createWriteStream(outputPath);

            pdfDoc.pipe(stream);
            pdfDoc.end();

            // ✅ CLAVE: esperar a que termine de escribirse
            stream.on("finish", () => resolve(outputPath));
            stream.on("error", (err) => reject(err));
        } catch (err) {
            reject(err);
        }
    });
};