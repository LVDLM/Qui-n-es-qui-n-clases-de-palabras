/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from "express";
import path from "path";
import dotenv from "dotenv";
import { GoogleGenAI, Type } from "@google/genai";
import { createServer as createViteServer } from "vite";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Initialize Gemini client server-side
// Use process.env.GEMINI_API_KEY securely and register User-Agent for build telemetry
const apiKey = process.env.GEMINI_API_KEY;
let ai: GoogleGenAI | null = null;

if (apiKey && apiKey !== "MY_GEMINI_API_KEY") {
  try {
    ai = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
    console.log("Gemini API Client initialized successfully.");
  } catch (err) {
    console.error("Error initializing Gemini client:", err);
  }
} else {
  console.warn("GEMINI_API_KEY is not configured or holds default placeholder value. AI custom questions will fallback to local parsing.");
}

// REST API Endpoints defined BEFORE Vite middleware

// API Health Check
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", aiConfigured: !!ai });
});

// Endpoint: Analyze Custom Question
app.post("/api/gemini/analyze-question", async (req, res) => {
  const { word, wordClass, attributes, definition, question } = req.body;

  if (!word || !question) {
    return res.status(400).json({ error: "Faltan parámetros 'word' o 'question'." });
  }

  // Local fallback if AI is not initialized
  if (!ai) {
    // Attempt basic pattern-matching internally for Spanish grammar
    const lowerQ = question.toLowerCase();
    const isSust = wordClass === "Sustantivo";
    let answer: "SÍ" | "NO" = "NO";
    let explanation = "La respuesta ha sido evaluada de forma local y discreta.";

    if (lowerQ.includes("sustantivo") && isSust) {
      answer = "SÍ";
      explanation = "Sí, la palabra secreta cumple las propiedades de un sustantivo.";
    } else if (lowerQ.includes("verbo") && wordClass === "Verbo") {
      answer = "SÍ";
      explanation = "Sí, cumple con la condición de ser un verbo.";
    } else if (lowerQ.includes("femenino") && JSON.stringify(attributes).toLowerCase().includes("femenino")) {
      answer = "SÍ";
      explanation = "Sí, la palabra es de género femenino de acuerdo a sus propiedades gramaticales.";
    } else if (lowerQ.includes("masculino") && JSON.stringify(attributes).toLowerCase().includes("masculino")) {
      answer = "SÍ";
      explanation = "Sí, el término tiene género masculino.";
    } else if (lowerQ.includes("plural") && JSON.stringify(attributes).toLowerCase().includes("plural")) {
      answer = "SÍ";
      explanation = "Sí, se refiere a una forma plural.";
    } else {
      // General guess
      answer = Math.random() > 0.5 ? "SÍ" : "NO";
      explanation = `Respuesta cerrada evaluada localmente. Decimos que ${answer}.`;
    }

    return res.json({ answer, explanation });
  }

  try {
    const prompt = `Analiza si la palabra secreta "${word}" cumple con la condición planteada en la pregunta: "${question}".
La palabra tiene la clase gramatical: "${wordClass}".
Sus atributos detallados son: ${JSON.stringify(attributes)}.
Y su descripción educativa es: "${definition}".

Determina si la respuesta es "SÍ" o "NO" de manera precisa (por ejemplo: si preguntan "¿es una acción?" y es un verbo, responde "SÍ". Si preguntan "¿es un objeto físico?" y es abstracto, responde "NO"). 

REGLAS CRÍTICAS DE SEGURIDAD (MÁXIMA PRIORIDAD):
1. ESTÁ ESTRICTAMENTE PROHIBIDO REVELAR, NOMBRAR o INSINUAR CUÁL ES LA PALABRA SECRETA (que es "${word}") en el campo "explanation". NUNCA la escribas.
2. ESTÁ ESTRICTAMENTE PROHIBIDO REVELAR O INFORMAR de forma explícita o implícita la clase gramatical real de la palabra si la respuesta es negativa. Por ejemplo, si te preguntan "¿Es un sustantivo?" y la palabra secreta es un pronombre, tu respuesta es "NO" y tu explicación debe ser neutra como "No, no cumple las condiciones de un sustantivo." (NUNCA DEBES DECIR: "No, la palabra es un pronombre", ni "No, es de clase pronombre" ya que arruinaría el juego).
3. Mantén la explicación muy corta (máximo 15 palabras), amigable para el aula, enfocada únicamente en justificar por qué es SÍ o NO en base a la categoría gramatical consultada o morfología, sin revelar datos externos.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          required: ["answer", "explanation"],
          properties: {
            answer: {
              type: Type.STRING,
              description: "Must be SÍ or NO",
            },
            explanation: {
              type: Type.STRING,
              description: "Brief educational explanation in Spanish (max 15 words).",
            },
          },
        },
      },
    });

    const resultText = response.text ? response.text.trim() : "";
    if (resultText) {
      const data = JSON.parse(resultText);
      return res.json(data);
    } else {
      throw new Error("Empty response text from Gemini");
    }
  } catch (err: any) {
    console.error("Error invoking Gemini model:", err);
    res.status(500).json({
      error: "Error al procesar la inteligencia artificial.",
      details: err.message,
      answer: "NO",
      explanation: "Hubo un error al conectar con el servidor de IA de Google Gemini."
    });
  }
});

// Mounting Vite dev server or static dist folder
async function setupViteOrStatic() {
  if (process.env.NODE_ENV !== "production") {
    console.log("Vite runs in DEVELOPMENT mode.");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    console.log("Vite serves in PRODUCTION mode.");
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server fully operating on http://0.0.0.0:${PORT}`);
  });
}

setupViteOrStatic();
