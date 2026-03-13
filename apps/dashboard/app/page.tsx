import { db, prompts, promptVersions } from "@promptforge/database";
import { eq } from "drizzle-orm";
import Link from "next/link";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default async function DashboardHome() {
  const allPrompts = await db
    .select({
      id: prompts.id,
      name: prompts.name,
      version: promptVersions.versionTag,
      createdAt: prompts.createdAt,
    })
    .from(prompts)
    .leftJoin(promptVersions, eq(prompts.id, promptVersions.promptId));

  return (
    <main className="min-h-[calc(100vh-52px)] bg-[#07090F]">
      <div className="max-w-6xl mx-auto px-8 py-12 space-y-10">

        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs font-medium text-violet-400 uppercase tracking-widest mb-3">
            <div className="w-4 h-px bg-violet-400/60" />
            Prompt Registry
          </div>
          <div className="flex items-end justify-between">
            <div>
              <h1 className="text-[2rem] font-bold tracking-tight text-white leading-none">
                All Prompts
              </h1>
              <p className="text-slate-500 mt-2 text-sm">Manage and monitor your versioned LLM prompt templates.</p>
            </div>
            <div className="flex items-center gap-2 text-sm text-slate-500 bg-white/[0.03] border border-white/[0.07] rounded-lg px-4 py-2">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <circle cx="7" cy="7" r="5.5" stroke="currentColor" strokeWidth="1.2"/>
                <path d="M7 4.5v3l1.5 1.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
              </svg>
              {allPrompts.length} total
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-white/[0.07] bg-white/[0.02] overflow-hidden shadow-2xl shadow-black/40">
          <div className="px-6 py-3 border-b border-white/[0.05] flex items-center justify-between bg-white/[0.01]">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-red-500/70" />
              <div className="w-2 h-2 rounded-full bg-amber-500/70" />
              <div className="w-2 h-2 rounded-full bg-emerald-500/70" />
            </div>
            <span className="text-[11px] font-mono text-slate-600">prompts.registry</span>
          </div>

          <Table>
            <TableHeader>
              <TableRow className="border-white/[0.05] hover:bg-transparent">
                <TableHead className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 py-3 px-6">Prompt Name</TableHead>
                <TableHead className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 py-3">Active Version</TableHead>
                <TableHead className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 py-3">Created</TableHead>
                <TableHead className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 py-3 text-right pr-6">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {allPrompts.map((prompt) => (
                <TableRow
                  key={prompt.id}
                  className="border-white/[0.04] hover:bg-white/[0.03] transition-colors duration-100 group"
                >
                  <TableCell className="py-4 px-6">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500/20 to-indigo-500/10 border border-violet-500/20 flex items-center justify-center text-violet-400 text-xs font-bold">
                        {prompt.name?.charAt(0)?.toUpperCase() ?? "P"}
                      </div>
                      <div>
                        <p className="font-medium text-sm text-slate-100">{prompt.name}</p>
                        <p className="text-[11px] font-mono text-slate-600 mt-0.5">{prompt.id?.slice(0, 8)}…</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="py-4">
                    {prompt.version ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-mono font-semibold text-indigo-300 bg-indigo-500/10 border border-indigo-500/20 px-2 py-0.5 rounded-md">
                        {prompt.version}
                      </span>
                    ) : (
                      <span className="text-[11px] text-slate-600 font-mono">—</span>
                    )}
                  </TableCell>
                  <TableCell className="py-4">
                    <span className="text-sm text-slate-400">{prompt.createdAt?.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</span>
                  </TableCell>
                  <TableCell className="py-4 text-right pr-6">
                    <Link
                      href={`/prompts/${prompt.id}`}
                      className="inline-flex items-center gap-1.5 text-xs font-semibold text-violet-400 hover:text-violet-300 bg-violet-500/10 hover:bg-violet-500/20 border border-violet-500/20 hover:border-violet-500/30 px-3 py-1.5 rounded-md transition-all duration-150"
                    >
                      View Analytics
                      <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                        <path d="M2 5h6M5.5 2.5L8 5l-2.5 2.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </Link>
                  </TableCell>
                </TableRow>
              ))}
              {allPrompts.length === 0 && (
                <TableRow className="border-white/[0.04] hover:bg-transparent">
                  <TableCell colSpan={4} className="text-center py-20">
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-white/[0.03] border border-white/[0.07] flex items-center justify-center text-slate-600">
                        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                          <path d="M4 6h12M4 10h8M4 14h6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                        </svg>
                      </div>
                      <p className="text-sm text-slate-500">No prompts found.</p>
                      <p className="text-xs text-slate-600 font-mono">Run the seed script to get started.</p>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </main>
  );
}