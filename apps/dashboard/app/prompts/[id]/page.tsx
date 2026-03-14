import { db, prompts, promptVersions, promptRuns, evaluations } from "@promptforge/database";
import { eq, desc } from "drizzle-orm";
import { PromptCharts } from "@/components/PromptCharts";

// NEW: Shadcn table imports
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

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
    return (
      <div className="min-h-[calc(100vh-52px)] bg-[#07090F] flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="w-16 h-16 rounded-2xl bg-white/[0.03] border border-white/[0.07] flex items-center justify-center text-slate-600 mx-auto">
            <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
              <circle cx="14" cy="14" r="10" stroke="currentColor" strokeWidth="1.5"/>
              <path d="M14 9v6M14 18v.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </div>
          <p className="text-slate-400 font-medium">Prompt not found</p>
          <p className="text-xs text-slate-600 font-mono">{id}</p>
        </div>
      </div>
    );

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
    <main className="min-h-[calc(100vh-52px)] bg-[#07090F]">
      <div className="max-w-6xl mx-auto px-8 py-12 space-y-10">

        <div className="flex items-start justify-between gap-6">
          <div className="space-y-1 flex-1 min-w-0">
            <div className="flex items-center gap-2 text-xs font-medium text-violet-400 uppercase tracking-widest mb-3">
              <div className="w-4 h-px bg-violet-400/60" />
              Analytics
            </div>
            <h1 className="text-[2rem] font-bold tracking-tight text-white leading-none truncate">
              {promptData[0].name}
            </h1>
            <p className="text-slate-600 mt-2 text-xs font-mono">{id}</p>
          </div>

          <div className="flex items-stretch gap-3 flex-shrink-0">
            <div className="rounded-xl border border-white/[0.07] bg-white/[0.025] px-5 py-3.5 min-w-[110px] text-center">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 mb-1">
                Total Runs
              </p>
              <p className="text-2xl font-bold text-white tabular-nums">
                {totalRuns}
              </p>
            </div>

            <div className="rounded-xl border border-white/[0.07] bg-white/[0.025] px-5 py-3.5 min-w-[110px] text-center">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 mb-1">
                Avg Latency
              </p>
              <p className="text-2xl font-bold text-amber-400 tabular-nums">
                {avgLatency}
                <span className="text-sm font-medium text-amber-400/60 ml-0.5">
                  ms
                </span>
              </p>
            </div>

            <div className="rounded-xl border border-violet-500/30 bg-violet-500/[0.07] px-5 py-3.5 min-w-[110px] text-center">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-violet-400/80 mb-1">
                Avg Quality
              </p>
              <p className="text-2xl font-bold text-violet-300 tabular-nums">
                {avgScore}
                {avgScore !== "N/A" && (
                  <span className="text-sm font-medium text-violet-400/60 ml-0.5">
                    /10
                  </span>
                )}
              </p>
            </div>
          </div>
        </div>

        <div className="h-px bg-gradient-to-r from-transparent via-white/[0.08] to-transparent" />

        <PromptCharts data={chartData} />

        {/* NEW: Recent Executions Table */}
        <div className="mt-12 space-y-4">
          <h3 className="text-2xl font-bold tracking-tight text-white">
            Recent Executions
          </h3>

          <div className="border border-white/[0.07] rounded-md bg-white/[0.02] overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Latency</TableHead>
                  <TableHead>Tokens</TableHead>
                  <TableHead className="text-right">
                    AI Quality Grade
                  </TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {chartData.slice(-10).reverse().map((run) => (
                  <TableRow key={run.id}>
                    <TableCell>
                      {run.createdAt?.toLocaleString()}
                    </TableCell>

                    <TableCell>
                      {run.latencyMs}ms
                    </TableCell>

                    <TableCell>
                      {(run.promptTokens || 0) +
                        (run.completionTokens || 0)}
                    </TableCell>

                    <TableCell className="text-right font-medium">
                      {run.score !== null ? (
                        <span
                          className={
                            run.score >= 8
                              ? "text-green-400"
                              : "text-amber-400"
                          }
                        >
                          {run.score}/10
                        </span>
                      ) : (
                        <span className="text-slate-500 italic text-sm">
                          Evaluating...
                        </span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>
    </main>
  );
}