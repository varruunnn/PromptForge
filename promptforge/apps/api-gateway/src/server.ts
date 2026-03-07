import dotenv from "dotenv"
dotenv.config({ path: "../../.env" })
import Fastify from 'fastify'
import { db, promptRuns } from '@promptforge/database'
import { GoogleGenerativeAI } from '@google/generative-ai'
const server = Fastify({
    logger: true
})
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)
if (!genAI) throw new Error("Missing Gemini key")

server.get('/health', async (request, reply) => {
    return { status: 'ok', service: 'promptforge-gateway' }
})

server.post('/v1/run', async (request, reply) => {
  const { promptText, model, inputVariables } = request.body as {
    promptText: string;
    model: string;
    inputVariables?: Record<string, string>;
  };

  if (!promptText || !model) {
    return reply.status(400).send({ error: "promptText and model are required" });
  }
  let finalPrompt = promptText;
  if (inputVariables) {
    for (const [key, value] of Object.entries(inputVariables)) {
      finalPrompt = finalPrompt.replace(new RegExp(`{{${key}}}`, 'g'), value);
    }
  }

  const startTime = Date.now();

  try {
    const generativeModel = genAI.getGenerativeModel({ model });
    const result = await generativeModel.generateContent(finalPrompt);
    
    const responseText = result.response.text();
    const usage = result.response.usageMetadata;
    const latencyMs = Date.now() - startTime;
    db.insert(promptRuns).values({
      modelUsed: model,
      inputVariables: inputVariables || {},
      rawOutput: responseText,
      latencyMs: latencyMs,
      promptTokens: usage?.promptTokenCount || 0,
      completionTokens: usage?.candidatesTokenCount || 0,
      costUsd: "0.00",
    }).catch(err => server.log.error("Failed to log run to DB:", err));
    return {
      success: true,
      output: responseText,
      telemetry: {
        latencyMs,
        promptTokens: usage?.promptTokenCount || 0,
        completionTokens: usage?.candidatesTokenCount || 0
      }
    };

  } catch (error) {
    server.log.error(error);
    return reply.status(500).send({ error: "LLM execution failed" });
  }
});

const start = async () => {
    try {
        await server.listen({ port: 3001, host: '0.0.0.0' })
        console.log(`gateway running on http://localhost:3001`);
    } catch (error) {
        server.log.error(error)
        process.exit(1);
    }
}

start();