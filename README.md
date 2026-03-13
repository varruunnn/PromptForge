# PromptForge

An AI Prompt Observability and Evaluation Platform designed to help developers monitor, test, optimize, and version their LLM prompts. 

Instead of hardcoding complex prompts into application code, developers use the PromptForge SDK to execute managed templates via an API Gateway. The platform automatically logs token usage, tracks latency, and utilizes an asynchronous background worker to grade AI outputs for quality (LLM-as-a-judge).

## System Architecture

```mermaid
graph TD
    %% Define Nodes
    Client[Client Application / SDK]
    Gateway[Fastify API Gateway]
    DB[(Neon Serverless Postgres)]
    LLM[Gemini]
    Worker[AI Evaluator Worker]
    Dashboard[Next.js Dashboard]

    %% Define Connections
    Client -->|Executes Prompt via SDK| Gateway
    Gateway -->|Fetches Prompt Template| DB
    Gateway -->|Calls LLM API| LLM
    Gateway -->|Logs Telemetry & Output| DB
    
    Worker -.->|Polls for pending runs| DB
    Worker -->|Grades Output| LLM
    Worker -->|Saves Quality Score| DB
    
    Dashboard -->|Visualizes Metrics| DB