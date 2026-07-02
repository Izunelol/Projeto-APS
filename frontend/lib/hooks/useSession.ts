"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { clearSession, getStoredUser, getToken } from "@/lib/api/session";
import type { User } from "@/lib/types";

export function useSession(requireAuth = true) {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = getToken();
    const storedUser = getStoredUser();

    if (!token || !storedUser) {
      if (requireAuth) {
        router.replace("/login");
        return;
      }
      setLoading(false);
      return;
    }

    setUser(storedUser);
    setLoading(false);
  }, [requireAuth, router]);

  function logout() {
    clearSession();
    router.replace("/login");
  }

  return { user, loading, logout };
}
