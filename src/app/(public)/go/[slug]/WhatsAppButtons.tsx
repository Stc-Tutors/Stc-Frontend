"use client";

import { MessageCircle } from "lucide-react";
import { campaignWhatsappMessage, campaignWhatsappUrl } from "@/lib/campaign-whatsapp";

// "Questions? Chat with us on WhatsApp" - sits near the registration form.
export function WhatsAppLink({ pageName, label = "Questions? Chat with us on WhatsApp" }: { pageName: string; label?: string }) {
  const href = campaignWhatsappUrl(campaignWhatsappMessage(pageName));
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-sm font-medium text-green-700 hover:underline">
      <MessageCircle className="size-4" aria-hidden="true" />
      {label}
    </a>
  );
}

// Floating button, phones only (md:hidden) - desktop visitors already have
// the site-wide contact widget. Bottom-left so it never sits on top of that
// widget, which is anchored bottom-right.
export function WhatsAppFloat({ pageName }: { pageName: string }) {
  const href = campaignWhatsappUrl(campaignWhatsappMessage(pageName));
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" aria-label="Chat with us on WhatsApp" className="md:hidden fixed bottom-4 left-4 z-40 inline-flex size-14 items-center justify-center rounded-full bg-green-500 text-white shadow-lg active:bg-green-600 print:hidden">
      <MessageCircle className="size-7" aria-hidden="true" />
    </a>
  );
}
