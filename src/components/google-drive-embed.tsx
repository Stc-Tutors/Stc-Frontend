"use client";

import { toGoogleDriveEmbedUrl } from "@/lib/google-drive";

export default function GoogleDriveEmbed({
  value,
  onChange,
  label,
}: {
  value: string;
  onChange: (value: string) => void;
  label: string;
}) {
  const embedUrl = toGoogleDriveEmbedUrl(value);

  return (
    <div>
      <label className="text-sm font-medium text-gray-700 block mb-1">{label}</label>
      <input
        placeholder="Paste a Google Drive share link"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="border border-gray-300 rounded-md px-3 py-2 text-sm w-full"
      />
      {value && !embedUrl && (
        <p className="text-xs text-amber-600 mt-1">
          Couldn&apos;t recognize this as a Google Drive link — it will still be saved, just without a preview.
        </p>
      )}
      {embedUrl && (
        <iframe
          src={embedUrl}
          className="w-full h-64 mt-2 rounded-md border border-gray-200"
          allow="autoplay"
          title={label}
        />
      )}
    </div>
  );
}
