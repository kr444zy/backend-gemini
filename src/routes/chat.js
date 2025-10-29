import { Router } from "express";
import multer from "multer";
import fetch from "node-fetch";

const upload = multer({ storage: multer.memoryStorage() });
const router = Router();

// --- Llamada REST a Gemini v1 (sin SDK) ---
async function askGemini(systemInstruction, userText) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("⚠️ GEMINI_API_KEY no configurada en Render.");

  const endpoint = `https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent?key=${apiKey}`;

  const prompt = `${systemInstruction}

Usuario: ${userText}

Tu respuesta:`;

  const body = {
    contents: [
      {
        role: "user",
        parts: [{ text: prompt }]
      }
    ]
  };

  const resp = await fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body)
  });

  const data = await resp.json();

  if (!resp.ok) {
    const msg = data?.error?.message || JSON.stringify(data);
    throw new Error(`Gemini API error ${resp.status}: ${msg}`);
  }

  const text =
    data?.candidates?.[0]?.content?.parts?.[0]?.text ||
    data?.candidates?.[0]?.content?.parts?.map(p => p?.text).filter(Boolean)?.join("\n") ||
    "";

  return text || "⚠️ Gemini no devolvió contenido.";
}

router.post("/", upload.array("files"), async (req, res) => {
  try {
    const { messages = [], attachments = [] } = req.body ?? {};
    const lastUser = [...messages].reverse().find(m => m.role === "user")?.content || "";

    if (!lastUser.trim()) {
      return res.status(400).json({ ok: false, error: "El mensaje está vacío." });
    }

    const attachSummary = Array.isArray(attachments) && attachments.length
      ? `El usuario adjuntó ${attachments.length} archivo(s): ${attachments.map(a => a?.name || a?.filename || "archivo").join(", ")}.`
      : "No hay adjuntos.";

    const systemInstruction = `Sos un asistente experto en clasificación arancelaria (HS/NCM).
- Pedí datos clave si faltan: material, uso, presentación, si es parte o artículo completo, si viene en kit o armado, medidas/peso, contexto de uso.
- Proponé 1–3 códigos HS/NCM con justificación breve y notas legales relevantes.
- Responde claro, en español rioplatense. ${attachSummary}`;

    const reply = await askGemini(systemInstruction, String(lastUser));
    res.json({ ok: true, reply });
  } catch (err) {
    console.error("❌ Error /api/chat:", err);
    res.status(500).json({ ok: false, error: err.message || "Error interno." });
  }
});

export default router;


