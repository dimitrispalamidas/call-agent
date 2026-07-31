import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getUserOrganizations } from "@/lib/org";
import { SignOutButton } from "@/components/sign-out-button";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const orgs = await getUserOrganizations();

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-6xl gap-8 px-6 py-8">
      <aside className="w-56 shrink-0">
        <div
          className="text-xl font-semibold"
          style={{ fontFamily: "var(--font-fraunces), Georgia, serif" }}
        >
          CallAgent
        </div>
        <p className="mt-1 truncate text-xs text-[var(--muted)]">{user.email}</p>
        <nav className="mt-8 flex flex-col gap-1 text-sm">
          <Link className="rounded-lg px-3 py-2 hover:bg-white" href="/dashboard">
            Οργανισμοί
          </Link>
          {orgs.map((org) => (
            <div key={org.id} className="mt-3">
              <div className="px-3 text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">
                {org.name}
              </div>
              <Link
                className="block rounded-lg px-3 py-2 hover:bg-white"
                href={`/dashboard/orgs/${org.id}`}
              >
                Επισκόπηση
              </Link>
              <Link
                className="block rounded-lg px-3 py-2 hover:bg-white"
                href={`/dashboard/orgs/${org.id}/knowledge`}
              >
                Knowledge base
              </Link>
              <Link
                className="block rounded-lg px-3 py-2 hover:bg-white"
                href={`/dashboard/orgs/${org.id}/employees`}
              >
                Υπάλληλοι
              </Link>
              <Link
                className="block rounded-lg px-3 py-2 hover:bg-white"
                href={`/dashboard/orgs/${org.id}/calls`}
              >
                Κλήσεις
              </Link>
              <Link
                className="block rounded-lg px-3 py-2 hover:bg-white"
                href={`/dashboard/orgs/${org.id}/settings`}
              >
                Ρυθμίσεις
              </Link>
            </div>
          ))}
        </nav>
        <div className="mt-8">
          <SignOutButton />
        </div>
      </aside>
      <main className="min-w-0 flex-1">{children}</main>
    </div>
  );
}
