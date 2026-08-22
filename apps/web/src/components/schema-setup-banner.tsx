import { Card } from "@/components/ui";

export function SchemaSetupBanner() {
  return (
    <Card className="mb-6 border-[var(--warning)]/30 bg-[var(--warn-soft)]">
      <h2 className="font-display text-xl">
        Λείπει το database schema
      </h2>
      <p className="mt-2 text-sm text-[var(--muted)]">
        Στο Supabase SQL Editor τρέξε το αρχείο{" "}
        <code className="rounded bg-[var(--bg-accent)] px-1 py-0.5">
          supabase/migrations/20260731120000_initial.sql
        </code>{" "}
        και μετά κάνε refresh.
      </p>
      <ol className="mt-3 list-decimal space-y-1 pl-5 text-sm text-[var(--ink)]">
        <li>Άνοιξε το project στο Supabase Dashboard</li>
        <li>SQL Editor → New query</li>
        <li>Κάνε paste όλο το περιεχόμενο του migration → Run</li>
      </ol>
    </Card>
  );
}
