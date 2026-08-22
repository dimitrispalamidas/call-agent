import Link from "next/link";
import { CallPreview } from "@/components/landing/call-preview";
import { SiteHeader } from "@/components/landing/site-header";
import type { LandingProof } from "@/types/landing";

const proofs: LandingProof[] = [
  { label: "Βάση γνώσης", detail: "Απαντά από τα δικά σας έγγραφα" },
  { label: "Handoff", detail: "Μεταφέρει σε πραγματικό υπάλληλο" },
  { label: "24/7", detail: "Η γραμμή δεν μένει αναπάντητη" },
];

export function HomeLanding() {
  return (
    <div className="min-h-screen">
      <SiteHeader />

      <main className="mx-auto grid w-full max-w-6xl items-center gap-14 px-6 py-16 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16 lg:py-24">
        <section className="landing-fade-up">
          <p className="text-sm font-medium text-[var(--brand)]">
            AI voice agent για οργανισμούς
          </p>
          <h1 className="font-display mt-4 max-w-xl text-balance text-4xl leading-[1.12] tracking-tight sm:text-5xl lg:text-[3.4rem]">
            AI τηλεφωνικός πράκτορας για{" "}
            <span className="text-[var(--brand)]">κάθε οργανισμό</span>
          </h1>
          <p className="mt-5 max-w-lg text-pretty text-lg leading-relaxed text-[var(--muted)]">
            Απαντά από τη βάση γνώσης σας και μεταφέρει σε πραγματικό υπάλληλο
            όταν χρειάζεται.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/signup"
              className="rounded-full bg-[var(--brand)] px-5 py-3 text-sm font-medium text-white transition-colors duration-300 hover:bg-[var(--brand-dark)]"
            >
              Ξεκίνα τώρα
            </Link>
            <Link
              href="/login"
              className="rounded-full border border-[var(--line)] bg-white px-5 py-3 text-sm transition-colors duration-300 hover:border-[var(--brand)]/30 hover:bg-[var(--bg-accent)]"
            >
              Έχω λογαριασμό
            </Link>
          </div>

          <ul className="mt-10 grid gap-3 sm:grid-cols-3">
            {proofs.map((proof) => (
              <li
                key={proof.label}
                className="rounded-2xl border border-[var(--line)] bg-white/70 px-3.5 py-3"
              >
                <p className="text-sm font-semibold">{proof.label}</p>
                <p className="mt-0.5 text-xs leading-relaxed text-[var(--muted)]">
                  {proof.detail}
                </p>
              </li>
            ))}
          </ul>
        </section>

        <section className="landing-fade-up landing-fade-up-delay">
          <CallPreview />
        </section>
      </main>
    </div>
  );
}
