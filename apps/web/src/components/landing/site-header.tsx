import Link from "next/link";
import { HandsetMark } from "@/components/landing/handset-mark";

export function SiteHeader() {
  return (
    <header className="flex items-center justify-between">
      <Link href="/" className="flex items-center gap-2.5">
        <span className="flex size-8 items-center justify-center rounded-full bg-[var(--brand)] text-[var(--on-brand)]">
          <HandsetMark />
        </span>
        <span className="font-display text-2xl tracking-tight">CallAgent</span>
      </Link>

      <nav aria-label="Λογαριασμός" className="flex items-center gap-3">
        <Link href="/login" className="btn-secondary px-4 py-2">
          Σύνδεση
        </Link>
        <Link href="/signup" className="btn-primary px-4 py-2">
          Εγγραφή
        </Link>
      </nav>
    </header>
  );
}
