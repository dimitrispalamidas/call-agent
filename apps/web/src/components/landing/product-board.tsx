import { Badge, Card } from "@/components/ui";
import {
  LANDING_CALL_STATUS,
  type LandingCallRow,
  type LandingCallStatus,
  type LandingStat,
} from "@/types/landing";

const stats: LandingStat[] = [
  { label: "Documents", value: "4" },
  { label: "Υπάλληλοι", value: "2" },
  { label: "Κλήσεις", value: "128" },
];

const calls: LandingCallRow[] = [
  {
    id: "1",
    fromNumber: "+30 694 112 2301",
    toNumber: "+30 210 123 4567",
    startedAt: "Σήμερα, 14:02",
    summary: "Ώρες λειτουργίας · μεταφορά στη γραμματεία",
    status: LANDING_CALL_STATUS.TRANSFERRED,
  },
  {
    id: "2",
    fromNumber: "+30 698 441 9022",
    toNumber: "+30 210 123 4567",
    startedAt: "Σήμερα, 11:18",
    summary: "Απάντηση από βάση γνώσης",
    status: LANDING_CALL_STATUS.COMPLETED,
  },
  {
    id: "3",
    fromNumber: "+30 697 220 1188",
    toNumber: "+30 210 123 4567",
    startedAt: "Χθες, 17:40",
    summary: "Σε εξέλιξη",
    status: LANDING_CALL_STATUS.IN_PROGRESS,
  },
];

export function ProductBoard() {
  return (
    <section aria-label="Πίνακας οργανισμού">
      <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="font-display text-2xl tracking-tight">Ιατρείο Παπαδόπουλου</p>
          <p className="mt-1 text-sm text-[var(--muted)]">
            Επισκόπηση AI τηλεφωνικού πράκτορα
          </p>
        </div>
        <Badge tone="ok">+30 210 123 4567</Badge>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {stats.map((stat) => (
          <Card key={stat.label}>
            <p className="text-sm text-[var(--muted)]">{stat.label}</p>
            <p className="mt-2 text-3xl">{stat.value}</p>
          </Card>
        ))}
      </div>

      <Card className="mt-4">
        <p className="text-sm font-medium">Κλήσεις</p>
        <div className="mt-3 space-y-3">
          {calls.map((call) => (
            <div
              key={call.id}
              className="flex flex-wrap items-start justify-between gap-3 rounded-xl border border-[var(--line)] px-3 py-3"
            >
              <div>
                <p className="font-mono text-sm font-medium">
                  {call.fromNumber} → {call.toNumber}
                </p>
                <p className="mt-1 text-xs text-[var(--muted)]">
                  {call.startedAt} · {call.summary}
                </p>
              </div>
              <Badge tone={toneForStatus(call.status)}>{statusLabel(call.status)}</Badge>
            </div>
          ))}
        </div>
      </Card>
    </section>
  );
}

function toneForStatus(status: LandingCallStatus) {
  switch (status) {
    case LANDING_CALL_STATUS.COMPLETED:
      return "ok" as const;
    case LANDING_CALL_STATUS.TRANSFERRED:
      return "warn" as const;
    case LANDING_CALL_STATUS.IN_PROGRESS:
      return "neutral" as const;
    default: {
      const _exhaustive: never = status;
      return _exhaustive;
    }
  }
}

function statusLabel(status: LandingCallStatus) {
  switch (status) {
    case LANDING_CALL_STATUS.COMPLETED:
      return "completed";
    case LANDING_CALL_STATUS.TRANSFERRED:
      return "transferred";
    case LANDING_CALL_STATUS.IN_PROGRESS:
      return "in_progress";
    default: {
      const _exhaustive: never = status;
      return _exhaustive;
    }
  }
}
