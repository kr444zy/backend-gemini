import { Router } from "express";
import multer from "multer";
import { GoogleGenerativeAI } from "@google/generative-ai";

const upload = multer({ storage: multer.memoryStorage() });
const router = Router();

async function askGemini(systemInstruction, userText) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("GEMINI_API_KEY no configurada");
  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  const prompt = `${systemInstruction}

Usuario: ${userText}

Tu respuesta:`;

  const result = await model.generateContent(prompt);
  const text = result.response.text();
  return text;
}

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
- Indica si hay notas legales o reglas generales del SA relevantes.
- Responde claro, en español rioplatense. ${attachSummary}`;

    const reply = await askGemini(systemInstruction, String(lastUser || ""));

    res.json({ ok: true, reply });
  } catch (err) {
    console.error(err);
    res.status(500).json({ ok: false, error: err.message || "Error" });
  }
});

export default router;
