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
      <div className="h-96 border rounded-md flex items-center justify-center text-muted-foreground bg-slate-50 mt-8">
        No execution data available yet. Run a prompt via the SDK!
      </div>
    );
  }

  return (
    <div className="space-y-8 mt-8">
      {/* Latency Chart */}
      <div className="h-[400px] w-full border rounded-md p-4 shadow-sm bg-white">
        <h3 className="text-lg font-semibold mb-4">Latency Over Time (ms)</h3>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={formattedData}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="time" tick={{ fontSize: 12 }} />
            <YAxis tick={{ fontSize: 12 }} />
            <Tooltip />
            <Line type="monotone" dataKey="latencyMs" stroke="#2563eb" strokeWidth={2} name="Latency (ms)" />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Token Chart */}
      <div className="h-[400px] w-full border rounded-md p-4 shadow-sm bg-white">
        <h3 className="text-lg font-semibold mb-4">Token Usage</h3>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={formattedData}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="time" tick={{ fontSize: 12 }} />
            <YAxis tick={{ fontSize: 12 }} />
            <Tooltip />
            <Legend />
            <Bar dataKey="promptTokens" name="Prompt Tokens" stackId="a" fill="#3b82f6" />
            <Bar dataKey="completionTokens" name="Completion Tokens" stackId="a" fill="#10b981" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}