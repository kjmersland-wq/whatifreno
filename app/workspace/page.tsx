import type { Metadata } from "next";
import { WorkspaceShell } from "@/components/workspace/WorkspaceShell";

export const metadata: Metadata = {
  title: "Workspace — RenoEstimate",
};

export default function WorkspacePage() {
  return (
    <main>
      <WorkspaceShell />
    </main>
  );
}
