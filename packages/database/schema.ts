import {pgTable, uuid, varchar, text,timestamp,integer,numeric,jsonb} from 'drizzle-orm/pg-core'

export const prompts = pgTable('prompts',{
    id: uuid('id').defaultRandom().primaryKey(),
    name: varchar('name',{length:255}).notNull().unique(),
    createdAt: timestamp('created_at').defaultNow(),
})

export const promptVersions = pgTable('prompt_versions',{
    id: uuid('id').defaultRandom().primaryKey(),
    promptId: uuid('prompt_id').references(()=>prompts.id,{onDelete:'cascade'}).notNull(),
    versionTag:varchar('version_tag',{length:50}).notNull(),
    template:text('template').notNull(),
    createdAt: timestamp('created_at').defaultNow(),
})

export const promptRuns = pgTable('prompt_runs', {
  id: uuid('id').defaultRandom().primaryKey(),
  promptVersionId: uuid('prompt_version_id').references(() => promptVersions.id),
  modelUsed: varchar('model_used', { length: 100 }).notNull(),
  inputVariables: jsonb('input_variables'),
  rawOutput: text('raw_output'),
  latencyMs: integer('latency_ms'),
  promptTokens: integer('prompt_tokens'),
  completionTokens: integer('completion_tokens'),
  costUsd: numeric('cost_usd', { precision: 10, scale: 6 }),
  createdAt: timestamp('created_at').defaultNow(),
});