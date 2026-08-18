"use client";

import { useEffect, useState } from "react";
import { GetMyTenantAction, MyTenant, UpdateMyTenantAction } from "@/server/tenant";
import { useUser } from "@/contexts/user-context";
import { isSuperOrAlmighty } from "@/lib/roles";

// A tenant's own SUPER_ADMIN managing their own branding and domain, without
// needing Stc-SuperAdmin - see stcbe's SuperAdminService.getMyTenant/
// updateMyTenant. name/slug/active-status stay ALMIGHTY_ADMIN-only (studentId
// numbering and platform-level control), so this page never shows them as
// editable.
export default function TenantSettingsPage() {
  const { user, isLoading: isLoadingUser } = useUser();
  const [tenant, setTenant] = useState<MyTenant | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState<string | null>(null);

  const [originsText, setOriginsText] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [logoUrl, setLogoUrl] = useState("");
  const [faviconUrl, setFaviconUrl] = useState("");
  const [primaryColor, setPrimaryColor] = useState("");
  const [supportEmail, setSupportEmail] = useState("");

  const load = async () => {
    setIsLoading(true);
    const [res, error] = await GetMyTenantAction();
    if (error || !res?.data) {
      setMessage(error || "Could not load your tenant");
      setIsLoading(false);
      return;
    }
    const t = res.data;
    setTenant(t);
    setOriginsText(t.allowedOrigins.join("\n"));
    setDisplayName(t.branding.displayName ?? "");
    setLogoUrl(t.branding.logoUrl ?? "");
    setFaviconUrl(t.branding.faviconUrl ?? "");
    setPrimaryColor(t.branding.primaryColor ?? "");
    setSupportEmail(t.branding.supportEmail ?? "");
    setIsLoading(false);
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSaveDomain = async () => {
    const allowedOrigins = originsText
      .split("\n")
      .map((o) => o.trim())
      .filter(Boolean);
    const [, error] = await UpdateMyTenantAction({ allowedOrigins });
    setMessage(error || "Domain settings updated");
    load();
  };

  const handleSaveBranding = async () => {
    const [, error] = await UpdateMyTenantAction({
      branding: { displayName, logoUrl, faviconUrl, primaryColor, supportEmail },
    });
    setMessage(error || "Branding updated");
    load();
  };

  if (isLoadingUser) return <p className="text-sm text-gray-500">Loading...</p>;

  if (!user || !isSuperOrAlmighty(user.role)) {
    return (
      <div className="bg-white shadow rounded-2xl p-6">
        <h1 className="text-2xl font-bold mb-1">Tenant Settings</h1>
        <p className="text-sm text-gray-500">Only a Super Admin can manage tenant branding and domain settings.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Tenant Settings</h1>
        <p className="text-sm text-gray-500 mt-1">
          Make this platform look and feel like your own - your logo, colors, support email, and domain.
        </p>
      </div>

      {message && <p className="text-sm text-blue-600">{message}</p>}

      {isLoading ? (
        <p className="text-sm text-gray-500">Loading...</p>
      ) : !tenant ? (
        <p className="text-sm text-gray-500">Could not load your tenant.</p>
      ) : (
        <>
          <div className="bg-white shadow rounded-2xl p-6 space-y-3">
            <h2 className="font-semibold text-gray-900">{tenant.name}</h2>
            <p className="text-xs text-gray-400">{tenant.slug}</p>
          </div>

          <div className="bg-white shadow rounded-2xl p-6 space-y-3">
            <h2 className="font-semibold text-gray-900">Domain</h2>
            <textarea
              rows={3}
              placeholder={"https://your-company.com\nhttps://your-company-staging.vercel.app"}
              value={originsText}
              onChange={(e) => setOriginsText(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm font-mono"
            />
            <p className="text-xs text-gray-400">
              One domain per line - visitors on any of these will see your own branding and content.
            </p>
            <button
              onClick={handleSaveDomain}
              className="bg-gray-900 text-white rounded-md px-4 py-2 text-sm hover:bg-gray-800"
            >
              Save domain
            </button>
          </div>

          <div className="bg-white shadow rounded-2xl p-6 space-y-3">
            <h2 className="font-semibold text-gray-900">Branding</h2>
            <div className="grid md:grid-cols-2 gap-3">
              <input
                placeholder="Display name shown to your users"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="border border-gray-300 rounded-md px-3 py-2 text-sm"
              />
              <input
                placeholder="Support email"
                value={supportEmail}
                onChange={(e) => setSupportEmail(e.target.value)}
                className="border border-gray-300 rounded-md px-3 py-2 text-sm"
              />
              <input
                placeholder="Logo URL"
                value={logoUrl}
                onChange={(e) => setLogoUrl(e.target.value)}
                className="border border-gray-300 rounded-md px-3 py-2 text-sm"
              />
              <input
                placeholder="Favicon URL"
                value={faviconUrl}
                onChange={(e) => setFaviconUrl(e.target.value)}
                className="border border-gray-300 rounded-md px-3 py-2 text-sm"
              />
              <input
                placeholder="Primary color (#0EA5E9)"
                value={primaryColor}
                onChange={(e) => setPrimaryColor(e.target.value)}
                className="border border-gray-300 rounded-md px-3 py-2 text-sm"
              />
            </div>
            <button
              onClick={handleSaveBranding}
              className="bg-gray-900 text-white rounded-md px-4 py-2 text-sm hover:bg-gray-800"
            >
              Save branding
            </button>
          </div>
        </>
      )}
    </div>
  );
}
