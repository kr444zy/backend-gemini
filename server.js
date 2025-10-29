import express from "express";
import cors from "cors";
import morgan from "morgan";
import dotenv from "dotenv";
import chatRouter from "./src/routes/chat.js";

dotenv.config();

const app = express();

// Render asigna un puerto automáticamente (process.env.PORT)
const PORT = process.env.PORT || 10000;

// Middleware
app.use(morgan("tiny"));
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// Configuración de CORS: solo permitir tu frontend
const origin = process.env.ORIGIN_FRONTEND || "*";
app.use(
  cors({
    origin,
    methods: ["GET", "POST", "OPTIONS"],
    allowedHeaders: ["Content-Type"],
  })
);

// Ruta simple de verificación
app.get("/health", (_, res) => res.json({ ok: true }));

// Ruta principal de chat (usa Gemini)
app.use("/api/chat", chatRouter);

// Manejador de rutas inexistentes
app.use((req, res) => res.status(404).json({ error: "Not found" }));

// Inicio del servidor
app.listen(PORT, () => {
  console.log(`[backend] listening on :${PORT}`);
  console.log(`✅ Servicio en: http://localhost:${PORT}`);
  console.log(`🌐 CORS permitido desde: ${origin}`);
});
