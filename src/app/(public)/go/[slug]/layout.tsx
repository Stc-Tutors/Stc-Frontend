import MetaPixel from "@/components/meta-pixel";

// Meta Pixel only on the ad landing pages (/go/<slug>), not the rest of the site.
export default function CampaignLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <MetaPixel />
      {children}
    </>
  );
}
