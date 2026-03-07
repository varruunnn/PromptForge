import { db, prompts, promptVersions } from '@promptforge/database'

async function seed() {
  console.log("seeding the db")

  const [newPrompt] = await db.insert(prompts).values({
    name: "summarize_ticket"
  }).returning()

  await db.insert(promptVersions).values({
    promptId: newPrompt.id,
    versionTag: "v1",
    template: "You are an expert customer support agent. Summarize the following customer complaint in two bullet points (Issue and Trigger): {{complaint}}"
  })

  console.log("seed complete")
}

seed()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err)
    process.exit(1)
  })