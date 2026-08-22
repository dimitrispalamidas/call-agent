import Link from "next/link";
import { ListenDemo } from "@/components/landing/listen-demo";
import { ProductBoard } from "@/components/landing/product-board";
import { SiteHeader } from "@/components/landing/site-header";
import type { LandingProof } from "@/types/landing";

const proofs: LandingProof[] = [
  { label: "Βάση γνώσης", detail: "Απαντά από τα δικά σας έγγραφα" },
  { label: "Handoff", detail: "Μεταφέρει σε πραγματικό υπάλληλο" },
  { label: "24/7", detail: "Η γραμμή δεν μένει αναπάντητη" },
];

export function HomeLanding() {
  return (
    <div className="mx-auto flex min-h-screen w-full max-w-6xl flex-col px-6 py-10">
      <SiteHeader />

      <main className="flex flex-1 flex-col gap-16 py-16 lg:py-20">
        <div className="grid items-center gap-12 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.9fr)] lg:gap-16">
          <section>
            <h1 className="font-display max-w-xl text-balance text-4xl leading-tight tracking-tight sm:text-5xl">
              AI τηλεφωνικός πράκτορας για κάθε οργανισμό
            </h1>
            <p className="mt-5 max-w-lg text-pretty text-lg text-[var(--muted)]">
              Απαντά από τη βάση γνώσης σας και μεταφέρει σε πραγματικό υπάλληλο
              όταν χρειάζεται.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/signup" className="btn-primary px-5 py-3">
                Ξεκίνα τώρα
              </Link>
              <Link href="/login" className="btn-secondary px-5 py-3">
                Έχω λογαριασμό
              </Link>
            </div>

            <ul className="mt-12 space-y-3">
              {proofs.map((proof) => (
                <li key={proof.label} className="flex gap-3 text-sm">
                  <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-[var(--ink)]/35" />
                  <p>
                    <span className="font-medium">{proof.label}.</span>{" "}
                    <span className="text-[var(--muted)]">{proof.detail}</span>
                  </p>
                </li>
              ))}
            </ul>
          </section>

          <ListenDemo />
        </div>

        <ProductBoard />
      </main>
    </div>
  );
}
