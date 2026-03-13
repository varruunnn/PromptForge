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
    <main className="p-8 max-w-6xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Prompt Registry</h1>
        <p className="text-muted-foreground">Manage and monitor your LLM prompts.</p>
      </div>

      <div className="border rounded-md bg-white">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Prompt Name</TableHead>
              <TableHead>Active Version</TableHead>
              <TableHead>Created At</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {allPrompts.map((prompt) => (
              <TableRow key={prompt.id}>
                <TableCell className="font-medium">{prompt.name}</TableCell>
                <TableCell>{prompt.version || "N/A"}</TableCell>
                <TableCell>{prompt.createdAt?.toLocaleDateString()}</TableCell>
                <TableCell className="text-right">
                  <Link href={`/prompts/${prompt.id}`} className="text-sm text-blue-500 hover:underline">
                    View Analytics
                  </Link>
                </TableCell>
              </TableRow>
            ))}
            {allPrompts.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                  No prompts found. Seed the database!
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </main>
  );
}