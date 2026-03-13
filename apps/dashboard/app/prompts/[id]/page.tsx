import { db, prompts, promptVersions, promptRuns, evaluations } from "@promptforge/database";
import { eq, desc } from "drizzle-orm";
import { PromptCharts } from "@/components/PromptCharts";

export default async function PromptAnalyticsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const promptData = await db
    .select()
    .from(prompts)
    .where(eq(prompts.id, id))
    .limit(1);

  if (promptData.length === 0)
    return <div className="p-8">Prompt not found</div>;

  const runsData = await db
    .select({
      id: promptRuns.id,
      latencyMs: promptRuns.latencyMs,
      promptTokens: promptRuns.promptTokens,
      completionTokens: promptRuns.completionTokens,
      createdAt: promptRuns.createdAt,
      version: promptVersions.versionTag,
      score: evaluations.score,
    })
    .from(promptRuns)
    .innerJoin(promptVersions, eq(promptRuns.promptVersionId, promptVersions.id))
    .leftJoin(evaluations, eq(promptRuns.id, evaluations.promptRunId))
    .where(eq(promptVersions.promptId, id))
    .orderBy(desc(promptRuns.createdAt))
    .limit(50);

  const chartData = runsData.reverse();

  const totalRuns = runsData.length;

  const avgLatency =
    totalRuns > 0
      ? Math.round(
          runsData.reduce((acc, curr) => acc + (curr.latencyMs || 0), 0) /
            totalRuns
        )
      : 0;

  const scoredRuns = runsData.filter((r) => r.score !== null);

  const avgScore =
    scoredRuns.length > 0
      ? (
          scoredRuns.reduce((acc, curr) => acc + curr.score!, 0) /
          scoredRuns.length
        ).toFixed(1)
      : "N/A";

  return (
    <main className="p-8 max-w-6xl mx-auto space-y-8">
      <div className="flex justify-between items-end border-b pb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {promptData[0].name}
          </h1>
          <p className="text-muted-foreground mt-1">Prompt ID: {id}</p>
        </div>

        <div className="flex gap-4">
          <div className="border rounded-md px-4 py-2 bg-slate-50">
            <p className="text-sm text-muted-foreground">Total Runs</p>
            <p className="text-xl font-bold">{totalRuns}</p>
          </div>

          <div className="border rounded-md px-4 py-2 bg-slate-50">
            <p className="text-sm text-muted-foreground">Avg Latency</p>
            <p className="text-xl font-bold">{avgLatency}ms</p>
          </div>

          <div className="border rounded-md px-4 py-2 bg-blue-50 text-blue-900 border-blue-200">
            <p className="text-sm font-medium">Avg Quality</p>
            <p className="text-xl font-bold">
              {avgScore}
              {avgScore !== "N/A" ? "/10" : ""}
            </p>
          </div>
        </div>
      </div>

      <PromptCharts data={chartData} />
    </main>
  );
}