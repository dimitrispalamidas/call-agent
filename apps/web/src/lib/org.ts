import { createClient } from "@/lib/supabase/server";
import type { Organization } from "@call-agent/db";

export async function requireUser() {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();
  if (error || !user) {
    throw new Error("UNAUTHORIZED");
  }
  return { supabase, user };
}

export async function getUserOrganizations(): Promise<Organization[]> {
  const { supabase, user } = await requireUser();
  const { data: memberships, error } = await supabase
    .from("memberships")
    .select("org_id")
    .eq("user_id", user.id);

  if (error) throw error;
  const orgIds = (memberships ?? []).map((m) => m.org_id);
  if (orgIds.length === 0) return [];

  const { data: orgs, error: orgError } = await supabase
    .from("organizations")
    .select("*")
    .in("id", orgIds)
    .order("created_at", { ascending: true });

  if (orgError) throw orgError;
  return (orgs ?? []) as Organization[];
}

export async function getOrganization(orgId: string): Promise<Organization | null> {
  const { supabase } = await requireUser();
  const { data, error } = await supabase
    .from("organizations")
    .select("*")
    .eq("id", orgId)
    .maybeSingle();
  if (error) throw error;
  return data as Organization | null;
}
