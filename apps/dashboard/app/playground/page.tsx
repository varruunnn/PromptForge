"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

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
  const [prompt, setPrompt] = useState("Write a haiku about debugging code at 2 AM.");
  const [output, setOutput] = useState("");
  const [telemetry, setTelemetry] = useState<{ latencyMs?: number; promptTokens?: number; completionTokens?: number } | null>(null);
  const [isLoading, setIsLoading] = useState(false);

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
    <main className="p-8 max-w-7xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Prompt Playground</h1>
        <p className="text-muted-foreground">Test and iterate on your prompts before saving them.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="prompt">Prompt System Template</Label>
            <Textarea
              id="prompt"
              placeholder="Type your prompt here..."
              className="min-h-[400px] font-mono text-sm resize-none"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
            />
          </div>
          <Button onClick={handleRun} disabled={isLoading} className="w-full">
            {isLoading ? "Running..." : "Run Prompt"}
          </Button>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label>LLM Output</Label>
            <div className="min-h-[400px] w-full rounded-md border bg-slate-50 p-4 text-sm whitespace-pre-wrap overflow-y-auto">
              {output || <span className="text-muted-foreground italic">Response will appear here...</span>}
            </div>
          </div>
          
          {telemetry && (
            <div className="flex gap-4 text-sm bg-blue-50 text-blue-900 p-3 rounded-md border border-blue-200">
              <div><strong>Latency:</strong> {telemetry.latencyMs}ms</div>
              <div><strong>Prompt Tokens:</strong> {telemetry.promptTokens}</div>
              <div><strong>Completion Tokens:</strong> {telemetry.completionTokens}</div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}