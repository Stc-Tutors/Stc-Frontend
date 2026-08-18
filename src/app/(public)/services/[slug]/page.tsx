"use client";

import { useEffect, useState } from "react";
import { notFound, useParams, useRouter } from "next/navigation";
import ServicePageBody, { ServicePageBodyContent } from "@/components/service-page-body";
import { GetServiceBySlugAction } from "@/server/service-catalog";
import { IService, ServiceCatalogStatus } from "@/types/service-catalog";

// Catch-all for any real Service Catalog slug that doesn't have its own
// dedicated page folder under src/app/(public)/services/ - Next.js always
// prefers a matching static folder over this dynamic one, so this only
// handles services an admin has added to the catalog that nobody's built a
// custom page for yet. A slug that doesn't exist in the catalog at all is a
// real 404; one that exists but isn't Active shows "Coming Soon" instead of
// either a 404 or a half-built page.
export default function ServiceCatchAllPage() {
  const { slug } = useParams<{ slug: string }>();
  const router = useRouter();
  const [service, setService] = useState<IService | null | undefined>(undefined);

  useEffect(() => {
    GetServiceBySlugAction(slug).then(([res, error]) => {
      setService(error ? null : res?.data ?? null);
    });
  }, [slug]);

  if (service === undefined) {
    return <p className="text-center py-20 text-gray-500">Loading...</p>;
  }

  if (service === null) {
    notFound();
  }

  if (service.status !== ServiceCatalogStatus.ACTIVE) {
    return (
      <main className="flex flex-col items-center justify-center py-24 px-6 text-center min-h-[50vh]">
        <h1 className="text-4xl font-bold text-gray-900 mb-3">{service.serviceName}</h1>
        <p className="text-2xl font-semibold text-[#38b6ff] mb-4">Coming Soon</p>
        <p className="text-gray-600 max-w-md mb-8">
          We&apos;re still putting the finishing touches on this program. Check back soon, or explore our other
          services in the meantime.
        </p>
        <div className="flex gap-4">
          <button
            onClick={() => router.back()}
            className="bg-gray-200 text-gray-800 px-6 py-3 rounded-lg hover:bg-gray-300 transition"
          >
            ← Back
          </button>
          <button
            onClick={() => router.push("/services")}
            className="bg-[#38b6ff] text-white px-6 py-3 rounded-lg hover:bg-[#1c2574] transition"
          >
            Browse Services
          </button>
        </div>
      </main>
    );
  }

  const defaults: ServicePageBodyContent = {
    heroHeading: service.serviceName,
    overview: service.description,
    keyFeatures: [],
    benefits: [],
    howItWorks: [],
    testimonials: [],
    ctaLabel: `Start ${service.serviceName} Now`,
  };

  return <ServicePageBody slug={slug} defaults={defaults} />;
}
