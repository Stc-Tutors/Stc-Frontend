"use client";

import { Download, Monitor, Smartphone } from "lucide-react";
import { usePageSection } from "@/hooks/use-page-section";
import { DownloadsContent, PageSectionKey } from "@/types/content";

const DEFAULT_DOWNLOADS: DownloadsContent = {
  heading: "Get the STC Tutors app",
  intro: "Join your classes, read your reports and get class reminders on your phone or computer.",
  androidUrl: "",
  androidVersion: "",
  androidNote: "Open the downloaded file to install. If your phone asks, allow installs from this source.",
  windowsUrl: "",
  windowsVersion: "",
  windowsNote: "Run the installer. If Windows shows a blue warning, choose More info, then Run anyway.",
};

function Card({ icon, title, url, version, note }: { icon: React.ReactNode; title: string; url: string; version?: string; note?: string }) {
  const ready = !!url.trim();
  return (
    <div className="flex flex-col rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
      <div className="flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#38b6ff]/10 text-[#38b6ff]">{icon}</div>
        <div>
          <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
          {version && <p className="text-xs text-gray-500">Version {version}</p>}
        </div>
      </div>
      {note && <p className="mt-4 flex-1 text-sm text-gray-600">{note}</p>}
      {ready ? (
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-5 inline-flex items-center justify-center gap-2 rounded-lg bg-[#38b6ff] px-4 py-3 font-medium text-white hover:bg-[#1c9ae0]"
        >
          <Download className="h-5 w-5" aria-hidden="true" /> Download
        </a>
      ) : (
        <span className="mt-5 inline-flex cursor-not-allowed items-center justify-center rounded-lg bg-gray-100 px-4 py-3 font-medium text-gray-500">Coming soon</span>
      )}
    </div>
  );
}

// The public page where students, parents and tutors get the Android app and the Windows installer. The links are set in Stc-SuperAdmin's
// Site Content > Page Sections > Downloads, so a new version is just a new link.
export default function Downloads() {
  const content = usePageSection(PageSectionKey.DOWNLOADS, DEFAULT_DOWNLOADS);
  return (
    <section className="bg-gray-50 px-6 py-16 md:px-12 lg:px-20">
      <div className="mx-auto max-w-3xl text-center">
        <h1 className="text-3xl font-bold text-gray-900 md:text-4xl">{content.heading}</h1>
        <p className="mt-3 text-gray-600">{content.intro}</p>
      </div>
      <div className="mx-auto mt-10 grid max-w-3xl gap-6 sm:grid-cols-2">
        <Card icon={<Smartphone className="h-6 w-6" />} title="Android" url={content.androidUrl ?? ""} version={content.androidVersion} note={content.androidNote} />
        <Card icon={<Monitor className="h-6 w-6" />} title="Windows" url={content.windowsUrl ?? ""} version={content.windowsVersion} note={content.windowsNote} />
      </div>
      <p className="mt-8 text-center text-sm text-gray-500">You can always use STC Tutors in your web browser too - no download needed.</p>
    </section>
  );
}
