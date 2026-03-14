import dotenv from "dotenv"
dotenv.config({ path: "../../.env" })
import Fastify from 'fastify'
import { eq, and } from 'drizzle-orm';
import cors from "@fastify/cors"
import { db, promptRuns } from '@promptforge/database'
import { GoogleGenerativeAI } from '@google/generative-ai'
import { prompts, promptVersions } from '@promptforge/database'
const server = Fastify({
  logger: true
})

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)
if (!genAI) throw new Error("Missing Gemini key")

server.get('/health', async (request, reply) => {
  return { status: 'ok', service: 'promptforge-gateway' }
})
server.post('/v1/run', async (request, reply) => {
  const { promptName, version, model, inputVariables } = request.body as {
    promptName: string;
    version: string;
    model: string;
    inputVariables?: Record<string, string>;
  };

  if (!promptName || !version || !model) {
    return reply.status(400).send({ error: "promptName, version, and model are required" });
  }

  try {
    const result = await db
      .select({
        template: promptVersions.template,
        versionId: promptVersions.id
      })
      .from(promptVersions)
      .innerJoin(prompts, eq(promptVersions.promptId, prompts.id))
      .where(
        and(
          eq(prompts.name, promptName),
          eq(promptVersions.versionTag, version)
        )
      )
      .limit(1);

    if (result.length === 0) {
      return reply.status(404).send({ error: `Prompt '${promptName}' version '${version}' not found` });
    }

    const { template, versionId } = result[0];
    let finalPrompt = template;
    if (inputVariables) {
      for (const [key, value] of Object.entries(inputVariables)) {
        finalPrompt = finalPrompt.replace(new RegExp(`{{${key}}}`, 'g'), value);
      }
    }
    const startTime = Date.now();
    const generativeModel = genAI.getGenerativeModel({ model });
    const aiResult = await generativeModel.generateContent(finalPrompt);

    const responseText = aiResult.response.text();
    const usage = aiResult.response.usageMetadata;
    const latencyMs = Date.now() - startTime;
    db.insert(promptRuns).values({
      promptVersionId: versionId,
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
      telemetry: { latencyMs, promptTokens: usage?.promptTokenCount, completionTokens: usage?.candidatesTokenCount }
    };

  } catch (error) {
    server.log.error(error);
    return reply.status(500).send({ error: "Execution failed" });
  }
});

server.post('/v1/test', async (request, reply) => {
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
   server.log.error(error, "Test endpoint error");
    return reply.status(500).send({ error: "LLM execution failed" });
  }
});


server.post('/v1/prompts', async (request, reply) => {
  const { name, template } = request.body as { name: string; template: string };
  
  if (!name || !template) {
    return reply.status(400).send({ error: "Name and template are required" });
  }

  try {
    const [newPrompt] = await db.insert(prompts).values({ name }).returning();
    await db.insert(promptVersions).values({
      promptId: newPrompt.id,
      versionTag: 'v1',
      template: template
    });

    return { success: true, promptId: newPrompt.id };
  } catch (error) {
    server.log.error(error, "Test endpoint error");
    return reply.status(500).send({ error: "Database error while saving prompt" });
  }
});

const start = async () => {
  await server.register(cors, {
    origin: "http://localhost:3000",
    methods: ["GET", "POST", "OPTIONS"],
  });
  try {
    await server.listen({ port: 3001, host: '0.0.0.0' })
    console.log(`gateway running on http://localhost:3001`);
  } catch (error) {
    server.log.error(error)
    process.exit(1);
  }
}

start();