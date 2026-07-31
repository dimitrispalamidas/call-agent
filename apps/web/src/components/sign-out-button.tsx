"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui";
import { createClient } from "@/lib/supabase/client";

export function SignOutButton() {
  const router = useRouter();

  return (
    <Button
      variant="secondary"
      className="w-full"
      onClick={async () => {
        const supabase = createClient();
        await supabase.auth.signOut();
        router.push("/login");
        router.refresh();
      }}
    >
      Αποσύνδεση
    </Button>
  );
}
