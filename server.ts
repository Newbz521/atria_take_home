import express from 'express';
import type { RequestHandler } from 'express';
import fs from 'fs';
import dotenv from 'dotenv';
import bodyParser from 'body-parser';
import { OpenAI } from 'openai';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

// ESM-compatible __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config(); // Load environment variables

if (!process.env.OPENAI_API_KEY) {
  throw new Error("OPENAI_API_KEY not found in .env file");
}

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const app = express();
const port = 3000;

// File paths
const fileData = path.join(__dirname, 'DummyData.txt');

// Middleware
app.use(cors()); // Enable CORS for all routes
app.use(bodyParser.json());
app.use(express.static('public'));

// Add error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Server error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// Split text into word-based chunks (simplified tokenizer)
function splitTextIntoChunks(text: string, chunkSize: number): string[] {
  const words = text.split(/\s+/);
  const chunks: string[] = [];

  for (let i = 0; i < words.length; i += chunkSize) {
    chunks.push(words.slice(i, i + chunkSize).join(" "));
  }

  return chunks;
}

// Retrieve top 3 relevant text chunks
function retrieveChunksFromFile(query: string, file: string): string {
  if (!fs.existsSync(file)) {
    return "Knowledge file not found.";
  }

  const content = fs.readFileSync(file, 'utf-8');
  const chunks = splitTextIntoChunks(content, 400); // Chunk size based on words

  const keywords = query.toLowerCase().split(" ");
  const scored = chunks
    .map(chunk => {
      const score = keywords.reduce((sum, kw) => sum + (chunk.toLowerCase().split(kw).length - 1), 0);
      return { score, chunk };
    })
    .filter(item => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)
    .map(item => item.chunk);

  return scored.length ? scored.join("\n\n") : "No relevant information found.";
}

// POST endpoint
app.post('/query', (async (req, res) => {
  try {
    console.log('Received request:', req.body);
    const userQuery = req.body.query;

    if (!userQuery || typeof userQuery !== 'string') {
      console.log('Invalid query:', userQuery);
      res.status(400).json({ error: "Invalid or missing 'query' in request body." });
      return;
    }

    const context = retrieveChunksFromFile(userQuery, fileData);
    if (!context) {
      console.log('No context found for query:', userQuery);
      res.status(404).json({ error: "No relevant context found." });
      return;
    }

    console.log('Sending request to OpenAI...');
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system", content:
          `
       You are a flood resilience expert assisting architects designing flood-resilient buildings in New Orleans. You have access to detailed flood risk projections and score tables for building attributes.

        Instructions:

        1. Calculate a building’s resilience score (0–100%) as follows:
          - Start from a baseline score (e.g., 0).
          - For each building attribute (foundation elevation, foundation type, flood mitigation features, roof type), retrieve its associated score from the provided score tables.
          - Sum all attribute scores.
          - Adjust the total score by comparing the building’s foundation elevation against the Base Flood Elevation (BFE) for each projected year:
            * If the foundation elevation is below BFE in any year, deduct penalties (e.g., -5 or more).
          - Clamp the final resilience score within 0 to 100.

        2. Construct a performance timeline through the year 2055:
          - For each year, evaluate how rising sea levels, storm surge, and BFE affect the building’s vulnerability.
          - Adjust and log the resilience score per year.

        3. Recommend adaptive actions based on risk trends (e.g., adding flood vents, raising foundation, switching to amphibious foundations, etc.).

        Use only the data and scoring rules provided in the input context.

        Return your answer as a structured JSON object:
        {
          "resilience_score": number,
          "performance_timeline": {
            "2025": number,
            "2030": number,
            ...
            "2055": number
          },
          "recommendations": [string, string, ...]
        }
        Only output JSON. Prioritize clarity and actionable insights.
          `
        },
        { role: "user", content: `Using the flood risk data below, evaluate the building design based on the scores provided:\n\n${context} Query: ${userQuery}` },
      ],


      temperature: 0.3,
      max_tokens: 1024,
    });

    if (!response.choices?.[0]?.message?.content) {
      console.log('No response from OpenAI');
      res.status(500).json({ error: "No response generated from OpenAI." });
      return;
    }

    console.log('Sending response to client');
    res.json({ result: response.choices[0].message.content });
  } catch (error: any) {
    console.error("Error in /query endpoint:", error);
    res.status(500).json({ error: "Failed to process request." });
  }
}) as RequestHandler);

// Start server
app.listen(port, () => {
  console.log(`🚀 Server running at http://localhost:${port}`);
});