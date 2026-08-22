import type { CallPreviewMessage } from "@/types/landing";

const messages: CallPreviewMessage[] = [
  {
    id: "1",
    role: "caller",
    text: "Τι ώρα ανοίγετε αύριο;",
  },
  {
    id: "2",
    role: "agent",
    text: "Ανοίγουμε 09:00–17:00. Θέλετε να μιλήσετε με ρεσεψιόν;",
  },
  {
    id: "3",
    role: "system",
    text: "Μεταφορά στον Νίκο · Reception",
  },
];

export function CallPreview() {
  return (
    <div className="relative">
      <div
        aria-hidden="true"
        className="absolute -inset-6 rounded-[2rem] bg-[var(--brand)]/8 blur-2xl"
      />
      <article className="relative overflow-hidden rounded-[1.6rem] border border-[var(--line)] bg-white/90 shadow-[0_24px_60px_rgba(20,32,26,0.08)] backdrop-blur-sm">
        <header className="flex items-center justify-between border-b border-[var(--line)] px-5 py-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">
              Ζωντανή κλήση
            </p>
            <p className="mt-0.5 text-sm font-medium">Γραμμή υποδοχής</p>
          </div>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-[var(--ok)]">
            <span className="relative flex size-1.5">
              <span className="absolute inline-flex size-full animate-ping rounded-full bg-emerald-400 opacity-70" />
              <span className="relative inline-flex size-full rounded-full bg-emerald-500" />
            </span>
            01:14
          </span>
        </header>

        <div className="space-y-3 px-5 py-5">
          {messages.map((message) => (
            <CallBubble key={message.id} message={message} />
          ))}
        </div>

        <footer className="flex items-center justify-between border-t border-[var(--line)] bg-[var(--bg-accent)]/70 px-5 py-3 text-xs text-[var(--muted)]">
          <span>Απάντηση από βάση γνώσης</span>
          <span>Handoff έτοιμο</span>
        </footer>
      </article>
    </div>
  );
}

function CallBubble({ message }: { message: CallPreviewMessage }) {
  switch (message.role) {
    case "caller":
      return (
        <p className="ml-auto max-w-[85%] rounded-2xl rounded-br-md bg-[var(--ink)] px-3.5 py-2.5 text-sm text-white">
          {message.text}
        </p>
      );
    case "agent":
      return (
        <p className="mr-auto max-w-[90%] rounded-2xl rounded-bl-md bg-[var(--bg-accent)] px-3.5 py-2.5 text-sm text-[var(--ink)]">
          {message.text}
        </p>
      );
    case "system":
      return (
        <p className="mx-auto rounded-full border border-[var(--line)] bg-white px-3 py-1.5 text-center text-xs font-medium text-[var(--brand)]">
          {message.text}
        </p>
      );
    default: {
      const _exhaustive: never = message.role;
      return _exhaustive;
    }
  }
}
