"use client";
import Link from "next/link";
import Image from "next/image";
import { useTenantBranding } from "@/contexts/tenant-branding-context";

export default function SignupLogoHeader() {
  const { tenant } = useTenantBranding();
  const logoUrl = tenant?.branding?.logoUrl;

  return (
    <div className="w-fit flex items-start justify-start px-4 py-4">
      <Link href="/dashboard" className="block">
        {logoUrl ? (
          // Tenant-supplied logo - unknown dimensions, so an <img> (not
          // next/image, which needs a configured remote host per domain)
          // scaled to roughly the same footprint as the default logo.
          // eslint-disable-next-line @next/next/no-img-element
          <img src={logoUrl} alt={tenant?.branding?.displayName || tenant?.name || "Logo"} className="h-10 w-auto" />
        ) : (
          <Image src="/image/logo_black.png" alt="STC Tutors" width={160} height={40} priority />
        )}
      </Link>
    </div>
  );
}