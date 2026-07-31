import { createClient } from "@/lib/supabase/server";

export async function assertOrgAdmin(orgId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { ok: false as const, status: 401, error: "Unauthorized", supabase, user: null };
  }

  const { data: membership } = await supabase
    .from("memberships")
    .select("role")
    .eq("org_id", orgId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (!membership || !["owner", "admin"].includes(membership.role)) {
    return { ok: false as const, status: 403, error: "Forbidden", supabase, user };
  }

  return { ok: true as const, supabase, user };
}

export function assertInternalSecret(request: Request) {
  const secret = request.headers.get("x-internal-secret");
  return Boolean(secret && secret === process.env.INTERNAL_API_SECRET);
}
