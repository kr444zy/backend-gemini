import express from "express";
import cors from "cors";
import morgan from "morgan";
import dotenv from "dotenv";
import chatRouter from "./src/routes/chat.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 10000;

app.use(morgan("tiny"));
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

const origin = process.env.ORIGIN_FRONTEND || "*";
app.use(cors({
  origin,
  methods: ["GET", "POST", "OPTIONS"],
  allowedHeaders: ["Content-Type"]
}));

app.get("/health", (_, res) => res.json({ ok: true }));

app.use("/api/chat", chatRouter);

app.use((req, res) => res.status(404).json({ error: "Not found" }));

app.listen(PORT, () => {
  console.log(`[backend] listening on :${PORT}`);
  console.log(`✅ Servicio en: http://localhost:${PORT}`);
  console.log(`🌐 CORS permitido desde: ${origin}`);
});

