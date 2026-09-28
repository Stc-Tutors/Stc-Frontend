import { notFound } from "next/navigation";
import Image from "next/image";
import { GetCampaignLandingPageAction } from "@/server/campaign-landing-page";
import { sanitizeRichText } from "@/lib/sanitize-html";
import CampaignSignupForm from "./CampaignSignupForm";

export default async function CampaignLandingPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const [res] = await GetCampaignLandingPageAction(slug);
  const page = res?.data;
  if (!page) notFound();

  return (
    <main className="min-h-screen bg-gray-50">
      <section className="bg-[#1c2574] text-white">
        <div className="max-w-5xl mx-auto px-6 py-14 grid md:grid-cols-2 gap-10 items-center">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold mb-3">{page.heading}</h1>
            {page.subheading && <p className="text-lg text-white/85 mb-4">{page.subheading}</p>}
            {page.scheduleNote && (
              <p className="inline-block bg-white/10 border border-white/20 rounded-md px-3 py-1.5 text-sm mb-2">
                {page.scheduleNote}
              </p>
            )}
          </div>
          {page.heroImageUrl && (
            <div className="relative h-56 md:h-72 rounded-lg overflow-hidden">
              <Image src={page.heroImageUrl} alt={page.heading} fill className="object-cover" />
            </div>
          )}
        </div>
      </section>

      <section className="max-w-5xl mx-auto px-6 py-10 grid md:grid-cols-5 gap-10">
        <div className="md:col-span-3 space-y-6">
          <div
            className="prose prose-sm max-w-none text-gray-700"
            dangerouslySetInnerHTML={{ __html: sanitizeRichText(page.body) }}
          />
          {page.benefits.length > 0 && (
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-3">What&apos;s included</h2>
              <ul className="space-y-2">
                {page.benefits.map((b, i) => (
                  <li key={i} className="flex items-start gap-2 text-gray-700">
                    <span className="text-green-600 mt-0.5">✓</span>
                    <span>{b}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <div className="md:col-span-2">
          <CampaignSignupForm page={page} />
        </div>
      </section>
    </main>
  );
}
