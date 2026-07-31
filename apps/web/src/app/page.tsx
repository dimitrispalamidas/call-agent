import Link from "next/link";

export default function HomePage() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-5xl flex-col px-6 py-10">
      <header className="flex items-center justify-between">
        <div
          className="text-2xl font-semibold tracking-tight"
          style={{ fontFamily: "var(--font-fraunces), Georgia, serif" }}
        >
          CallAgent
        </div>
        <div className="flex gap-3">
          <Link
            href="/login"
            className="rounded-full border border-[var(--line)] bg-white px-4 py-2 text-sm"
          >
            Σύνδεση
          </Link>
          <Link
            href="/signup"
            className="rounded-full bg-[var(--brand)] px-4 py-2 text-sm text-white"
          >
            Εγγραφή
          </Link>
        </div>
      </header>

      <section className="mt-24 max-w-2xl">
        <h1
          className="text-5xl leading-tight tracking-tight"
          style={{ fontFamily: "var(--font-fraunces), Georgia, serif" }}
        >
          AI τηλεφωνικός πράκτορας για κάθε οργανισμό
        </h1>
        <p className="mt-5 text-lg text-[var(--muted)]">
          Απαντά από τη βάση γνώσης σας και μεταφέρει σε πραγματικό υπάλληλο όταν
          χρειάζεται.
        </p>
        <div className="mt-8 flex gap-3">
          <Link
            href="/signup"
            className="rounded-full bg-[var(--brand)] px-5 py-3 text-sm font-medium text-white"
          >
            Ξεκίνα τώρα
          </Link>
          <Link
            href="/login"
            className="rounded-full border border-[var(--line)] bg-white px-5 py-3 text-sm"
          >
            Έχω λογαριασμό
          </Link>
        </div>
      </section>
    </main>
  );
}
