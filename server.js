import express from "express";
import cors from "cors";
import morgan from "morgan";
import dotenv from "dotenv";
import chatRouter from "./src/routes/chat.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(morgan("tiny"));
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

const origin = process.env.ORIGIN_FRONTEND || "*";
app.use(cors({ origin }));

app.get("/health", (_, res) => res.json({ ok: true }));

app.use("/api/chat", chatRouter);

app.use((req, res) => res.status(404).json({ error: "Not found" }));

app.listen(process.env.PORT || 10000, () => {
  console.log(`[backend] listening on :${process.env.PORT || 10000}`);
});
