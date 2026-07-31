import { Card } from "@/components/ui";

export function SchemaSetupBanner() {
  return (
    <Card className="mb-6 border-amber-200 bg-amber-50">
      <h2
        className="text-xl"
        style={{ fontFamily: "var(--font-fraunces), Georgia, serif" }}
      >
        Λείπει το database schema
      </h2>
      <p className="mt-2 text-sm text-[var(--muted)]">
        Στο Supabase SQL Editor τρέξε το αρχείο{" "}
        <code className="rounded bg-white px-1 py-0.5">
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
