"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LifeBuoy, Mail, MessageCircle, Phone, X } from "lucide-react";
import { usePageSection } from "@/hooks/use-page-section";
import { DEFAULT_CONTACT } from "@/constants/default-contact";
import { DEFAULT_SUPPORT_CONTACTS } from "@/constants/default-support-contacts";
import { ContactInfoContent, PageSectionKey, SupportAudience, SupportChannel, SupportContactsContent } from "@/types/content";

// Which set of contact details applies to the page being viewed. Each kind of person (tutor applicant, parent, student, admin, and a
// plain visitor on the public site) can be given their own numbers/addresses in Site Content > Support Contacts.
function audienceFor(pathname: string): SupportAudience {
  if (pathname.startsWith("/lms-home/admin")) return "admin";
  if (pathname.startsWith("/lms-home/tutor") || pathname.startsWith("/auth/apply-tutor") || pathname.startsWith("/auth/tutor-application-status")) return "tutor";
  if (pathname.startsWith("/lms-home/parent")) return "parent";
  if (pathname.startsWith("/lms-home/student")) return "student";
  return "general";
}

// Where "use the support system" goes: a signed-in person's own support (complaints) page, or the public Contact form.
function supportPageFor(audience: SupportAudience, inLms: boolean): string | undefined {
  if (!inLms) return "/contact";
  if (audience === "parent") return "/lms-home/parent/complaints";
  if (audience === "student") return "/lms-home/student/complaints";
  if (audience === "tutor") return "/lms-home/tutor/complaints";
  return undefined;
}

// First non-empty value for a field: this audience's own, then the general one, then the Contact page's details.
function pick(content: SupportContactsContent, audience: SupportAudience, field: keyof SupportChannel): string | undefined {
  return content[audience]?.[field]?.trim() || content.general?.[field]?.trim() || undefined;
}

// Hidden where a floating button would sit on top of the live classroom controls.
const HIDDEN_ON = ["/classroom", "/lms-home/classroom", "/lms-home/student/classroom"];

export default function ContactUsWidget() {
  const pathname = usePathname() ?? "/";
  const [open, setOpen] = useState(false);
  const support = usePageSection<SupportContactsContent>(PageSectionKey.SUPPORT_CONTACTS, DEFAULT_SUPPORT_CONTACTS);
  const contact = usePageSection<ContactInfoContent>(PageSectionKey.CONTACT_INFO, DEFAULT_CONTACT);

  if (HIDDEN_ON.some((p) => pathname.includes(p))) return null;

  const audience = audienceFor(pathname);
  const phone = pick(support, audience, "phone") ?? contact.phones?.[0];
  const email = pick(support, audience, "email") ?? contact.emails?.[0];
  const whatsapp = pick(support, audience, "whatsapp");
  const whatsappDigits = whatsapp?.replace(/[^\d]/g, "");
  const waLink = whatsappDigits
    ? `https://wa.me/${whatsappDigits}?text=${encodeURIComponent(`Hello, I need help (page: ${pathname}).`)}`
    : contact.socialLinks?.find((l) => l.platform.toLowerCase() === "whatsapp")?.url;
  const telHref = phone ? `tel:${phone.replace(/[^\d+]/g, "")}` : undefined;
  const mailHref = email ? `mailto:${email}?subject=${encodeURIComponent("I need help")}&body=${encodeURIComponent(`Page: ${pathname}\n\n`)}` : undefined;
  const supportHref = supportPageFor(audience, pathname.startsWith("/lms-home"));

  if (!telHref && !waLink && !mailHref && !supportHref) return null;

  const item =
    "flex items-center gap-2 rounded-md px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 focus:bg-gray-100 focus:outline-none";

  return (
    <div className="fixed bottom-4 right-4 z-40 print:hidden">
      {open && (
        <div className="mb-2 w-60 rounded-xl border border-gray-200 bg-white p-2 shadow-lg" role="dialog" aria-label="Contact us">
          <div className="flex items-center justify-between px-3 pb-1 pt-1">
            <p className="text-sm font-semibold text-gray-900">Contact us</p>
            <button onClick={() => setOpen(false)} aria-label="Close" className="text-gray-400 hover:text-gray-600">
              <X className="h-4 w-4" />
            </button>
          </div>
          {telHref && (
            <a href={telHref} className={item}>
              <Phone className="h-4 w-4 text-blue-600" /> Call {phone}
            </a>
          )}
          {waLink && (
            <a href={waLink} target="_blank" rel="noopener noreferrer" className={item}>
              <MessageCircle className="h-4 w-4 text-green-600" /> WhatsApp
            </a>
          )}
          {mailHref && (
            <a href={mailHref} className={item}>
              <Mail className="h-4 w-4 text-amber-600" /> Email {email}
            </a>
          )}
          {supportHref && (
            <Link href={supportHref} className={item} onClick={() => setOpen(false)}>
              <LifeBuoy className="h-4 w-4 text-purple-600" /> {pathname.startsWith("/lms-home") ? "Open a support request" : "Send us a message"}
            </Link>
          )}
        </div>
      )}
      <button
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="flex items-center gap-2 rounded-full bg-blue-600 px-4 py-2.5 text-sm font-medium text-white shadow-lg hover:bg-blue-700"
      >
        <LifeBuoy className="h-4 w-4" /> Need help?
      </button>
    </div>
  );
}
