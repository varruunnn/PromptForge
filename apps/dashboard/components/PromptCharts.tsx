"use client";

import {
  LineChart, Line, BarChart, Bar, Legend, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';

export function PromptCharts({ data }: { data: any[] }) {
  const formattedData = data.map(run => ({
    ...run,
    time: new Date(run.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
  }));

  if (!data || data.length === 0) {
    return (
      <div className="rounded-xl border border-white/[0.07] bg-white/[0.02] h-72 flex flex-col items-center justify-center gap-4 mt-2">
        <div className="w-14 h-14 rounded-2xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-center text-slate-700">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M3 17l4-6 4 3 4-8 4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
        <div className="text-center space-y-1">
          <p className="text-sm font-medium text-slate-500">No execution data yet</p>
          <p className="text-xs text-slate-700 font-mono">Run a prompt via the SDK to populate charts</p>
        </div>
      </div>
    );
  }

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-[#0E1420] border border-white/[0.10] rounded-lg px-3.5 py-2.5 shadow-2xl shadow-black/60">
          <p className="text-[10px] font-mono text-slate-500 mb-2">{label}</p>
          {payload.map((entry: any, i: number) => (
            <div key={i} className="flex items-center gap-2 text-xs">
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
              <span className="text-slate-400">{entry.name}:</span>
              <span className="font-mono font-semibold text-white">{entry.value}</span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  const axisStyle = { fontSize: 11, fontFamily: "monospace", fill: "#475569" };

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-white/[0.07] bg-white/[0.02] overflow-hidden">
        <div className="px-6 py-4 border-b border-white/[0.05] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M1 10l3-4 3 2 3-5 3 3" stroke="#f59e0b" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-slate-200">Latency Over Time</h3>
              <p className="text-[11px] text-slate-600 font-mono">milliseconds · last {formattedData.length} runs</p>
            </div>
          </div>
          <div className="flex items-center gap-1.5 text-[11px] font-mono text-amber-400 bg-amber-400/[0.08] border border-amber-400/20 px-2.5 py-1 rounded-full">
            <div className="w-1.5 h-1.5 rounded-full bg-amber-400" />
            latencyMs
          </div>
        </div>
        <div className="h-[320px] px-4 py-6">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={formattedData}>
              <defs>
                <linearGradient id="latencyGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.15}/>
                  <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e2a3a" vertical={false} />
              <XAxis dataKey="time" tick={axisStyle} axisLine={false} tickLine={false} />
              <YAxis tick={axisStyle} axisLine={false} tickLine={false} width={50} />
              <Tooltip content={<CustomTooltip />} cursor={{ stroke: "#ffffff15", strokeWidth: 1 }} />
              <Line
                type="monotone"
                dataKey="latencyMs"
                stroke="#f59e0b"
                strokeWidth={2}
                name="Latency (ms)"
                dot={{ fill: "#f59e0b", r: 3, strokeWidth: 0 }}
                activeDot={{ r: 5, fill: "#f59e0b", strokeWidth: 2, stroke: "#07090F" }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="rounded-xl border border-white/[0.07] bg-white/[0.02] overflow-hidden">
        <div className="px-6 py-4 border-b border-white/[0.05] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <rect x="1" y="5" width="3" height="8" rx="0.8" fill="#3b82f6" fillOpacity="0.8"/>
                <rect x="5.5" y="3" width="3" height="10" rx="0.8" fill="#3b82f6" fillOpacity="0.6"/>
                <rect x="10" y="7" width="3" height="6" rx="0.8" fill="#3b82f6" fillOpacity="0.4"/>
              </svg>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-slate-200">Token Usage</h3>
              <p className="text-[11px] text-slate-600 font-mono">stacked · prompt + completion · last {formattedData.length} runs</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 text-[10px] font-mono text-blue-400 bg-blue-400/[0.08] border border-blue-400/20 px-2 py-1 rounded-full">
              <div className="w-1.5 h-1.5 rounded-full bg-blue-400" />
              prompt
            </div>
            <div className="flex items-center gap-1 text-[10px] font-mono text-emerald-400 bg-emerald-400/[0.08] border border-emerald-400/20 px-2 py-1 rounded-full">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              completion
            </div>
          </div>
        </div>
        <div className="h-[320px] px-4 py-6">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={formattedData} barSize={24}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e2a3a" vertical={false} />
              <XAxis dataKey="time" tick={axisStyle} axisLine={false} tickLine={false} />
              <YAxis tick={axisStyle} axisLine={false} tickLine={false} width={50} />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: "#ffffff05" }} />
              <Bar dataKey="promptTokens" name="Prompt Tokens" stackId="a" fill="#3b82f6" radius={[0, 0, 4, 4]} />
              <Bar dataKey="completionTokens" name="Completion Tokens" stackId="a" fill="#10b981" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}