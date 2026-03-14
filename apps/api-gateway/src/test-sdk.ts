import { promptforge } from '@promptforge/sdk';

async function main() {
  console.log("Firing request via PromptForge SDK...\n");

  const startTime = Date.now();

  const response = await promptforge.run({
    promptName: "generate_haiku",
    version: "v1",
    model: "gemini-2.5-flash-lite",
    inputVariables: {
      complaint: "The new UI update is incredibly slow and my dashboard keeps crashing when I try to update billing API keys!"
    }
  });

  const totalClientLatency = Date.now() - startTime;

  if (response.success) {
    console.log(" Success! Here is the LLM Output:\n");
    console.log(response.output);
    console.log("\n Telemetry Data:");
    console.log(`Gateway Latency: ${response.telemetry?.latencyMs}ms`);
    console.log(`Total Client Roundtrip: ${totalClientLatency}ms`);
    console.log(`Tokens Used: ${response.telemetry?.promptTokens} prompt / ${response.telemetry?.completionTokens} completion`);
  } else {
    console.error(" Failed:", response.error);
  }
}

main();