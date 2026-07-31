"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import type { Employee } from "@call-agent/db";
import { Badge, Button, Card, Input, Label } from "@/components/ui";

export function EmployeesPanel({
  orgId,
  employees,
}: {
  orgId: string;
  employees: Employee[];
}) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [priority, setPriority] = useState(100);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onCreate(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const res = await fetch(`/api/orgs/${orgId}/employees`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, phone_e164: phone, priority }),
    });
    const body = await res.json().catch(() => ({}));
    setLoading(false);
    if (!res.ok) {
      setError(body.error ?? "Failed");
      return;
    }
    setName("");
    setPhone("");
    setPriority(100);
    router.refresh();
  }

  async function toggleAvailable(employee: Employee) {
    await fetch(`/api/orgs/${orgId}/employees/${employee.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ is_available: !employee.is_available }),
    });
    router.refresh();
  }

  async function onDelete(employeeId: string) {
    await fetch(`/api/orgs/${orgId}/employees/${employeeId}`, {
      method: "DELETE",
    });
    router.refresh();
  }

  return (
    <div className="space-y-4">
      <Card>
        <h2
          className="text-xl"
          style={{ fontFamily: "var(--font-fraunces), Georgia, serif" }}
        >
          Νέος υπάλληλος
        </h2>
        <form className="mt-4 grid gap-3 md:grid-cols-3" onSubmit={onCreate}>
          <div>
            <Label>Όνομα</Label>
            <Input required value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div>
            <Label>Τηλέφωνο (E.164)</Label>
            <Input
              required
              placeholder="+3069..."
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </div>
          <div>
            <Label>Priority (μικρότερο = πρώτος)</Label>
            <Input
              type="number"
              value={priority}
              onChange={(e) => setPriority(Number(e.target.value))}
            />
          </div>
          {error ? (
            <p className="text-sm text-[var(--danger)] md:col-span-3">{error}</p>
          ) : null}
          <div className="md:col-span-3">
            <Button type="submit" disabled={loading}>
              {loading ? "Αποθήκευση..." : "Προσθήκη"}
            </Button>
          </div>
        </form>
      </Card>

      <Card>
        <h2 className="text-lg font-medium">Ουρά transfer</h2>
        <div className="mt-4 space-y-3">
          {employees.length === 0 ? (
            <p className="text-sm text-[var(--muted)]">Πρόσθεσε τουλάχιστον έναν υπάλληλο.</p>
          ) : (
            employees.map((employee) => (
              <div
                key={employee.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[var(--line)] px-3 py-3"
              >
                <div>
                  <div className="font-medium">{employee.name}</div>
                  <div className="text-sm text-[var(--muted)]">
                    {employee.phone_e164} · priority {employee.priority}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge tone={employee.is_available ? "ok" : "neutral"}>
                    {employee.is_available ? "available" : "offline"}
                  </Badge>
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => toggleAvailable(employee)}
                  >
                    Toggle
                  </Button>
                  <Button
                    type="button"
                    variant="danger"
                    onClick={() => onDelete(employee.id)}
                  >
                    Διαγραφή
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      </Card>
    </div>
  );
}
