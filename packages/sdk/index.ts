export interface PromptForgeConfig {
  gatewayUrl?: string; 
}

export interface RunPromptArgs {
  promptName: string;
  version: string;
  model: string;
  inputVariables?: Record<string, string>;
}

export interface RunPromptResponse {
  success: boolean;
  output?: string;
  error?: string;
  telemetry?: {
    latencyMs: number;
    promptTokens: number;
    completionTokens: number;
  };
}

export class PromptForge {
  private gatewayUrl: string;

  constructor(config?: PromptForgeConfig) {
    this.gatewayUrl = config?.gatewayUrl || 'http://localhost:3001';
  }

  async run(args: RunPromptArgs): Promise<RunPromptResponse> {
    try {
      const response = await fetch(`${this.gatewayUrl}/v1/run`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(args),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to execute prompt');
      }

      return data as RunPromptResponse;
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
      };
    }
  }
}

export const promptforge = new PromptForge();