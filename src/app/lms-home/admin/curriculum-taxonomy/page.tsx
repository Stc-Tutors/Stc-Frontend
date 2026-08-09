"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import CurriculumTreeBrowser from "@/components/curriculum-tree-browser";
import { GetAdminServicesAction } from "@/server/service-catalog";
import { IService } from "@/types/service-catalog";

// "Browse any service's tree" entry point for admins who aren't starting
// from a specific service. The tab list is whichever live services actually
// have a taxonomy tree (non-empty taxonomyStages - configured in the Service
// Catalog's Overview tab) - not a hardcoded 2-entry list, so any service an
// admin gives a tree shows up automatically. Mirrors Stc-SuperAdmin's page
// of the same name so an ADMIN with MANAGE_TAXONOMY (not just SUPER_ADMIN)
// can also grow the taxonomy here.
export default function CurriculumTaxonomyPage() {
  const [services, setServices] = useState<IService[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedSlug, setSelectedSlug] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const [res, err] = await GetAdminServicesAction();
      setIsLoading(false);
      if (err) {
        setError(err);
        return;
      }
      const withTrees = (res?.data ?? []).filter((s) => s.taxonomyStages.length > 0);
      setServices(withTrees);
      setSelectedSlug((prev) => prev ?? withTrees[0]?.slug ?? null);
    })();
  }, []);

  const selected = services.find((s) => s.slug === selectedSlug);

  return (
    <div className="max-w-4xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Curriculum Taxonomy</h1>
        <p className="text-sm text-gray-500 mt-1">
          Every service with a configured taxonomy tree (set in its Service Catalog workspace) can be browsed here.
          Used across student enrollment, tutor onboarding, and service pricing.
        </p>
      </div>

      {isLoading ? (
        <p className="text-sm text-gray-500">Loading...</p>
      ) : error ? (
        <p className="text-sm text-red-600">{error}</p>
      ) : services.length === 0 ? (
        <p className="text-sm text-gray-500">
          No service has a taxonomy tree configured yet - add one from a service&apos;s{" "}
          <Link href="/lms-home/admin/service-catalog" className="text-blue-600 hover:underline">
            Service Catalog
          </Link>{" "}
          workspace.
        </p>
      ) : (
        <>
          <div className="flex flex-wrap gap-6 border-b border-gray-200 text-sm">
            {services.map((s) => (
              <button
                key={s.slug}
                onClick={() => setSelectedSlug(s.slug)}
                className={`pb-3 border-b-2 ${
                  selectedSlug === s.slug ? "border-blue-600 text-blue-600 font-medium" : "border-transparent text-gray-400"
                }`}
              >
                {s.serviceName}
              </button>
            ))}
          </div>

          {/* key forces a remount on switch so the browser's internal path/tree
              state never straddles two different services' trees */}
          {selected && (
            <CurriculumTreeBrowser key={selected.slug} serviceType={selected.slug} stages={selected.taxonomyStages} />
          )}
        </>
      )}
    </div>
  );
}
