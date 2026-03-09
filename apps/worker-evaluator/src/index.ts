import 'dotenv/config';
import { db, promptRuns, evaluations } from '@promptforge/database';
import { isNull, eq } from 'drizzle-orm';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
const EVALUATION_PROMPT = `
You are an expert QA evaluator. Review the following LLM output based on the original prompt.
Score the output from 1 to 10 based on accuracy, clarity, and instruction following.

Return ONLY a JSON object with this exact structure, nothing else:
{
  "score": <number 1-10>,
  "reasoning": "<brief explanation of the score>"
}

Original Prompt:
{{prompt}}

LLM Output to Evaluate:
{{output}}
`;

async function evaluateRun(run: any) {
    console.log(`[Worker] Evaluating Run ID: ${run.id}`);

    try {
        const promptToJudge = EVALUATION_PROMPT
            .replace('{{prompt}}', "User requested a haiku or summary").replace('{{output}}', run.rawOutput || "");
        const model = genAI.getGenerativeModel({
            model: "gemini-2.5-flash-lite",
            generationConfig: { responseMimeType: "application/json" }
        });

        const result = await model.generateContent(promptToJudge);
        const jsonText = result.response.text();
        const grade = JSON.parse(jsonText);
        await db.insert(evaluations).values({
            promptRunId: run.id,
            score: grade.score,
            reasoning: grade.reasoning
        });

        console.log(`Run ${run.id} Scored: ${grade.score}/10`);

    } catch (error) {
        console.error(`Failed to evaluate run ${run.id}:`, error);
    }
}
async function startPolling() {
    console.log("Evaluator Worker Started. Polling every 10 seconds...");

    setInterval(async () => {
        try {
            const pendingRuns = await db
                .select({ id: promptRuns.id, rawOutput: promptRuns.rawOutput })
                .from(promptRuns)
                .leftJoin(evaluations, eq(promptRuns.id, evaluations.promptRunId))
                .where(isNull(evaluations.id))
                .limit(1);

            if (pendingRuns.length > 0) {
                await evaluateRun(pendingRuns[0]);
            }
        } catch (error) {
            console.error("Database query failed:", error);
        }
    }, 10000); 
}

startPolling();