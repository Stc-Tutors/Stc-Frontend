"use client";

import { useRouter } from "next/navigation";
import { ROUTES } from "@/config/routes";

// Logout must be a deliberate POST, not a plain navigable link - a GET route
// is reachable by Next.js's automatic <Link> prefetching (a background GET
// fired just for a link being visible on screen, no click needed), which
// used to silently log every user out as soon as their sidebar rendered.
export default function LogoutButton({ className, children }: { className?: string; children: React.ReactNode }) {
  const router = useRouter();

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push(ROUTES.AUTH.LOGIN);
  };

  return (
    <button type="button" onClick={handleLogout} className={className}>
      {children}
    </button>
  );
}
