import type { ButtonHTMLAttributes, InputHTMLAttributes, ReactNode, TextareaHTMLAttributes } from "react";

export function Card({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-5 ${className}`}
    >
      {children}
    </div>
  );
}

export function Button({
  className = "",
  variant = "primary",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "danger";
}) {
  const styles =
    variant === "primary"
      ? "bg-[var(--brand)] text-[var(--on-brand)] hover:bg-[var(--brand-dark)]"
      : variant === "danger"
        ? "bg-[var(--danger)] text-white"
        : "border border-[var(--line)] bg-[var(--surface)] text-[var(--ink)]";

  return (
    <button
      className={`inline-flex items-center justify-center rounded-full px-4 py-2 text-sm font-medium disabled:opacity-50 ${styles} ${className}`}
      {...props}
    />
  );
}

export function Input({
  className = "",
  ...props
}: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={`w-full rounded-xl border border-[var(--line)] bg-[var(--bg)] px-3 py-2 text-sm outline-none ring-[var(--brand)] focus:ring-2 ${className}`}
      {...props}
    />
  );
}

export function Textarea({
  className = "",
  ...props
}: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      className={`w-full rounded-xl border border-[var(--line)] bg-[var(--bg)] px-3 py-2 text-sm outline-none ring-[var(--brand)] focus:ring-2 ${className}`}
      {...props}
    />
  );
}

export function Label({ children }: { children: ReactNode }) {
  return (
    <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">
      {children}
    </label>
  );
}

export function Badge({
  children,
  tone = "neutral",
}: {
  children: ReactNode;
  tone?: "neutral" | "ok" | "warn" | "danger";
}) {
  const color =
    tone === "ok"
      ? "bg-[var(--ok-soft)] text-[var(--ok)]"
      : tone === "warn"
        ? "bg-[var(--warn-soft)] text-[var(--warning)]"
        : tone === "danger"
          ? "bg-[var(--danger-soft)] text-[var(--danger)]"
          : "bg-[var(--bg-accent)] text-[var(--muted)]";
  return (
    <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${color}`}>
      {children}
    </span>
  );
}

export function PageHeader({
  title,
  description,
  actions,
}: {
  title: string;
  description?: string;
  actions?: ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
      <div>
        <h1 className="font-display text-3xl tracking-tight">
          {title}
        </h1>
        {description ? (
          <p className="mt-1 text-sm text-[var(--muted)]">{description}</p>
        ) : null}
      </div>
      {actions}
    </div>
  );
}
