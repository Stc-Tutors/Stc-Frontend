"use client";
import Image from "next/image";
import { useTenantBranding } from "@/contexts/tenant-branding-context";

// Renders the current tenant's logo (see tenant-branding-context.tsx),
// falling back to STC's own /image/logo_black.png when no tenant-specific
// logo is set - which is every existing STC page today, unchanged.
export default function BrandLogo({
  width = 120,
  height = 40,
  className,
}: {
  width?: number;
  height?: number;
  className?: string;
}) {
  const { tenant } = useTenantBranding();
  const logoUrl = tenant?.branding?.logoUrl;
  const alt = tenant?.branding?.displayName || tenant?.name || "STC Logo";

  if (logoUrl) {
    return (
      // Tenant-supplied logo, unknown remote host - next/image would need
      // that host added to next.config's allowed image domains per tenant.
      // eslint-disable-next-line @next/next/no-img-element
      <img src={logoUrl} alt={alt} className={className} style={{ width, height, objectFit: "contain" }} />
    );
  }

  return <Image src="/image/logo_black.png" alt={alt} width={width} height={height} className={className} priority />;
}
