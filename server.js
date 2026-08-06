import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import "dotenv/config";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
app.use(express.static(path.join(__dirname, "public")));

const PORT = process.env.PORT || 3000;

if (!process.env.OPENAI_API_KEY) {
  console.warn(
    "⚠️  OPENAI_API_KEY is not set. Set it before starting the server:\n" +
      "   export OPENAI_API_KEY=sk-...\n",
  );
}

app.use(express.static(path.join(__dirname, "public")));

// Session config: which model, voice, and transcription settings to use.
// input.transcription turns on live speech-to-text for the user's mic audio.
const sessionConfig = {
  session: {
    type: "realtime",
    model: "gpt-realtime-2.1",
    audio: {
      input: {
        transcription: { model: "gpt-4o-transcribe" },
      },
      output: {
        voice: "marin",
      },
    },
  },
};

// Browser calls this to get a short-lived ephemeral key (expires in ~1 min,
// but that's fine — it's only used to open the WebRTC connection).
app.get("/token", async (req, res) => {
  try {
    const response = await fetch(
      "https://api.openai.com/v1/realtime/client_secrets",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(sessionConfig),
      },
    );
    const data = await response.json();
    if (!response.ok) {
      console.error("Token error:", data);
      return res.status(response.status).json(data);
    }
    res.json(data);
  } catch (err) {
    console.error("Token generation error:", err);
    res.status(500).json({ error: "Failed to generate token" });
  }
});

app.listen(PORT, () => {
  console.log(`Realtime demo running at http://localhost:${PORT}`);
});
