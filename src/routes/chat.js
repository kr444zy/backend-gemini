import { Router } from "express";
import multer from "multer";
import { GoogleGenerativeAI } from "@google/generative-ai";

const upload = multer({ storage: multer.memoryStorage() });
const router = Router();

// ---------- Función que llama a Gemini ----------
async function askGemini(systemInstruction, userText) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("⚠️ GEMINI_API_KEY no configurada en Render");

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `${systemInstruction}

Usuario: ${userText}

Tu respuesta:`;

    const result = await model.generateContent(prompt);
    const text = result.response.text();

    if (!text || text.trim() === "") {
      return "⚠️ Gemini no devolvió contenido. Revisá tu API Key o los límites de uso.";
    }

    return text;
  } catch (err) {
    console.error("Error en Gemini:", err);
    if (err.message?.includes("API_KEY_INVALID")) {
      throw new Error("Tu API key de Gemini es inválida o está expirada. Creá una nueva en https://aistudio.google.com/app/apikey");
    }
    throw err;
  }
}

// ---------- Endpoint principal ----------
router.post("/", upload.array("files"), async (req, res) => {
  try {
    const { messages = [], attachments = [] } = req.body ?? {};
    const lastUser = [...messages].reverse().find(m => m.role === "user")?.content || "";

    const attachSummary = Array.isArray(attachments) && attachments.length
      ? `El usuario adjuntó ${attachments.length} archivo(s): ${attachments.map(a => a.name || a.filename || "archivo").join(", ")}.`
      : "No hay adjuntos.";

    const systemInstruction = `Sos un asistente experto en clasificación arancelaria (HS/NCM).
- Pedí datos clave si faltan: material, uso, presentación, si es parte o artículo completo, si viene en kit o armado, medidas/peso, contexto de uso.
- Si podés, proponé 1-3 códigos (capítulo/partida/subpartida) con justificación breve.
- Indicá si hay notas legales o reglas generales del SA relevantes.
- Responde claro, en español rioplatense. ${attachSummary}`;

    if (!lastUser.trim()) {
      return res.status(400).json({ ok: false, error: "Mensaje vacío o no válido." });
    }

    const reply = await askGemini(systemInstruction, String(lastUser));

    res.json({ ok: true, reply });
  } catch (err) {
    console.error("Error general:", err);
    res.status(500).json({
      ok: false,
      error: err.message || "Error interno del servidor.",
    });
  }
});

export default router;
