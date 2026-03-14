"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";

async function testPrompt(promptText: string) {
  const response = await fetch("http://localhost:3001/v1/test", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      promptText,
      model: "gemini-2.5-flash-lite",
    }),
  });
  return response.json();
}

export default function PlaygroundPage() {
  const [prompt, setPrompt] = useState("Write PromptForge's mission statement in a poetic style.");
  const [output, setOutput] = useState("");
  const [telemetry, setTelemetry] = useState<{ latencyMs?: number; promptTokens?: number; completionTokens?: number } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const [promptName, setPromptName] = useState("");
  const [isSaving, setIsSaving] = useState(false);


  const handleSave = async () => {
    if (!promptName || !prompt) return alert("Please provide a name and template.");

    setIsSaving(true);

    try {
      const res = await fetch("http://localhost:3001/v1/prompts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: promptName.toLowerCase().replace(/\s+/g, "_"),
          template: prompt,
        }),
      });

      const data = await res.json();

      if (data.success) {
        router.push("/");
      }
    } catch (error) {
      alert("Failed to save prompt.");
    } finally {
      setIsSaving(false);
    }
  };


  const handleRun = async () => {
    setIsLoading(true);
    setOutput("");
    setTelemetry(null);
    try {
      const result = await testPrompt(prompt);
      if (result.success) {
        setOutput(result.output);
        setTelemetry(result.telemetry);
      } else {
        setOutput("Error: " + result.error);
      }
    } catch (error) {
      setOutput("Failed to connect to the Gateway. Is it running on port 3001?");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-[calc(100vh-52px)] bg-[#07090F]">
      <div className="max-w-7xl mx-auto px-8 py-12 space-y-8">

        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs font-medium text-violet-400 uppercase tracking-widest mb-3">
            <div className="w-4 h-px bg-violet-400/60" />
            Prompt Playground
          </div>
          <div className="flex items-end justify-between">
            <div>
              <h1 className="text-[2rem] font-bold tracking-tight text-white leading-none">Experiment</h1>
              <p className="text-slate-500 mt-2 text-sm">Test and iterate on prompts before committing to the registry.</p>
            </div>
            <div className="flex items-center gap-2 text-xs font-mono text-slate-600 bg-white/[0.02] border border-white/[0.05] rounded-lg px-3 py-2">
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                <circle cx="6" cy="6" r="4.5" stroke="currentColor" strokeWidth="1" />
                <path d="M4.5 6l1.5 1.5L9 4" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              gemini-2.5-flash-lite
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="rounded-xl border border-white/[0.07] bg-white/[0.02] overflow-hidden flex flex-col">
            <div className="flex items-center justify-between px-4 py-3 border-b border-white/[0.05] bg-white/[0.01]">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-red-500/70" />
                <div className="w-2 h-2 rounded-full bg-amber-500/70" />
                <div className="w-2 h-2 rounded-full bg-emerald-500/70" />
              </div>
              <Label htmlFor="prompt" className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                System Prompt
              </Label>
              <div className="text-[10px] font-mono text-slate-700">
                {prompt.length} chars
              </div>
            </div>
            <div className="flex-1 flex flex-col p-0">
              <Textarea
                id="prompt"
                placeholder="Type your system prompt here..."
                className="flex-1 min-h-[420px] font-mono text-sm resize-none bg-transparent border-0 rounded-none text-slate-200 placeholder:text-slate-700 focus-visible:ring-0 focus-visible:ring-offset-0 p-5 leading-relaxed"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
              />
            </div>
            <div className="p-4 border-t border-white/[0.05] space-y-4">
              <Button
                onClick={handleRun}
                disabled={isLoading}
                className="w-full h-10 bg-violet-600 hover:bg-violet-500 text-white font-semibold text-sm rounded-lg shadow-lg shadow-violet-500/20 transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed border-0"
              >
                {isLoading ? "Running…" : "Run Prompt"}
              </Button>

              <div className="pt-4 border-t border-white/[0.05] space-y-3">
                <Label className="text-xs text-slate-500 uppercase tracking-wider">
                  Prompt Name
                </Label>

                <Input
                  value={promptName}
                  onChange={(e) => setPromptName(e.target.value)}
                  placeholder="summarize_ticket"
                  className="bg-white/[0.03] border-white/[0.08] text-slate-200"
                />

                <Button
                  onClick={handleSave}
                  disabled={isSaving || !promptName}
                  className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-semibold"
                >
                  {isSaving ? "Saving…" : "Save to Registry"}
                </Button>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-white/[0.07] bg-white/[0.02] overflow-hidden flex flex-col">
            <div className="flex items-center justify-between px-4 py-3 border-b border-white/[0.05] bg-white/[0.01]">
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full transition-colors duration-300 ${output ? "bg-emerald-400 shadow-sm shadow-emerald-400/60" : "bg-slate-700"}`} />
                <div className="w-2 h-2 rounded-full bg-slate-800" />
                <div className="w-2 h-2 rounded-full bg-slate-800" />
              </div>
              <Label className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                LLM Output
              </Label>
              <div className="text-[10px] font-mono text-slate-700">
                {output ? `${output.length} chars` : "awaiting…"}
              </div>
            </div>

            <div className="flex-1 p-5 min-h-[420px] overflow-y-auto">
              {output ? (
                <p className="text-sm text-slate-200 whitespace-pre-wrap leading-relaxed font-mono">{output}</p>
              ) : (
                <div className="h-full flex flex-col items-center justify-center gap-3 text-slate-700">
                  {isLoading ? (
                    <>
                      <div className="flex gap-1">
                        <div className="w-1.5 h-1.5 rounded-full bg-violet-500 animate-bounce" style={{ animationDelay: "0ms" }} />
                        <div className="w-1.5 h-1.5 rounded-full bg-violet-500 animate-bounce" style={{ animationDelay: "120ms" }} />
                        <div className="w-1.5 h-1.5 rounded-full bg-violet-500 animate-bounce" style={{ animationDelay: "240ms" }} />
                      </div>
                      <p className="text-xs text-slate-600">Generating response…</p>
                    </>
                  ) : (
                    <>
                      <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
                        <path d="M4 7h20M4 14h14M4 21h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                      </svg>
                      <p className="text-xs">Response will appear here</p>
                    </>
                  )}
                </div>
              )}
            </div>

            {telemetry && (
              <div className="border-t border-white/[0.05] p-4">
                <div className="grid grid-cols-3 gap-3">
                  <div className="bg-amber-500/[0.07] border border-amber-500/20 rounded-lg px-3 py-2.5 text-center">
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-amber-500/70 mb-1">Latency</p>
                    <p className="text-sm font-bold text-amber-400 font-mono tabular-nums">{telemetry.latencyMs}ms</p>
                  </div>
                  <div className="bg-blue-500/[0.07] border border-blue-500/20 rounded-lg px-3 py-2.5 text-center">
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-blue-400/70 mb-1">Prompt Tkns</p>
                    <p className="text-sm font-bold text-blue-400 font-mono tabular-nums">{telemetry.promptTokens}</p>
                  </div>
                  <div className="bg-emerald-500/[0.07] border border-emerald-500/20 rounded-lg px-3 py-2.5 text-center">
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-emerald-400/70 mb-1">Compl. Tkns</p>
                    <p className="text-sm font-bold text-emerald-400 font-mono tabular-nums">{telemetry.completionTokens}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}