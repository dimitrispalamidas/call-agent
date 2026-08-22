import Link from "next/link";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-20 border-b border-[var(--line)]/70 bg-[color-mix(in_srgb,var(--bg)_78%,transparent)] backdrop-blur-xl">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-6">
        <Link href="/" className="flex items-center gap-2.5">
          <span className="flex size-8 items-center justify-center rounded-lg bg-[var(--brand)] text-white shadow-[0_8px_20px_rgba(15,106,77,0.22)]">
            <SignalMark />
          </span>
          <span className="font-display text-xl tracking-tight">CallAgent</span>
        </Link>

        <nav className="flex items-center gap-2">
          <Link
            href="/login"
            className="rounded-full px-4 py-2 text-sm text-[var(--muted)] transition-colors duration-300 hover:text-[var(--ink)]"
          >
            Σύνδεση
          </Link>
          <Link
            href="/signup"
            className="rounded-full bg-[var(--brand)] px-4 py-2 text-sm font-medium text-white transition-colors duration-300 hover:bg-[var(--brand-dark)]"
          >
            Εγγραφή
          </Link>
        </nav>
      </div>
    </header>
  );
}

function SignalMark() {
  return (
    <svg viewBox="0 0 24 24" className="size-4" fill="none" aria-hidden="true">
      <path
        d="M8 15.5c1.8-1.8 4.2-1.8 6 0M6 12c3.2-3.2 8.8-3.2 12 0M4 8.5c4.6-4.6 11.4-4.6 16 0"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <circle cx="12" cy="18" r="1.2" fill="currentColor" />
    </svg>
  );
}
