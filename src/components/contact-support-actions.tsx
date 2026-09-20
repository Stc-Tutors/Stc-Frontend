"use client";

import { Mail, MessageCircle, Phone } from "lucide-react";
import { usePageSection } from "@/hooks/use-page-section";
import { DEFAULT_CONTACT } from "@/constants/default-contact";
import { ContactInfoContent, PageSectionKey } from "@/types/content";

// One-tap ways to actually reach the team, pre-filled with what the visitor was
// doing - built from the same admin-managed contact details as the Contact page
// (Site Content), so changing them there changes them here. WhatsApp and email
// open with the message already written; phone dials. (The public Contact page's
// own form doesn't send anything, so this deliberately doesn't point at it.)
export default function ContactSupportActions({ subject, message }: { subject: string; message: string }) {
  const content = usePageSection<ContactInfoContent>(PageSectionKey.CONTACT_INFO, DEFAULT_CONTACT);

  const email = content.emails?.[0];
  const phone = content.phones?.[0];
  const whatsappBase = content.socialLinks?.find((l) => l.platform.toLowerCase() === "whatsapp")?.url;
  const whatsappHref = whatsappBase
    ? `${whatsappBase}${whatsappBase.includes("?") ? "&" : "?"}text=${encodeURIComponent(message)}`
    : undefined;
  const mailHref = email
    ? `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(message)}`
    : undefined;
  const telHref = phone ? `tel:${phone.replace(/[^\d+]/g, "")}` : undefined;

  if (!whatsappHref && !mailHref && !telHref) return null;

  const linkClass =
    "inline-flex items-center gap-1.5 rounded-md border border-gray-300 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50";

  return (
    <div className="flex flex-wrap items-center gap-2 pt-1">
      <span className="text-xs text-gray-500">Contact us:</span>
      {whatsappHref && (
        <a href={whatsappHref} target="_blank" rel="noopener noreferrer" className={linkClass}>
          <MessageCircle className="h-3.5 w-3.5" /> WhatsApp
        </a>
      )}
      {mailHref && (
        <a href={mailHref} className={linkClass}>
          <Mail className="h-3.5 w-3.5" /> Email
        </a>
      )}
      {telHref && (
        <a href={telHref} className={linkClass}>
          <Phone className="h-3.5 w-3.5" /> Call
        </a>
      )}
    </div>
  );
}
