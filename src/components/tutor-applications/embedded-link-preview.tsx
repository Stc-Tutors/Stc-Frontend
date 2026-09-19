"use client";

import { useState } from "react";
import ResourcePreviewDialog from "@/components/resources/ResourcePreviewDialog";

// A single "View X" link rendered from a data-driven field (see
// tutor-field-registry.tsx's `format` functions, which return raw JSX for a
// single field value with no dialog state of their own) - self-contained so
// it can be dropped into any format() callback without threading preview
// state through every caller.
export function EmbeddedLinkPreview({ label, url }: { label: string; url: string }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button onClick={() => setOpen(true)} className="text-blue-600 hover:underline">
        {label}
      </button>
      <ResourcePreviewDialog open={open} onOpenChange={setOpen} title={label} url={url} />
    </>
  );
}
