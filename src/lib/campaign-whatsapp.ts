import { DEFAULT_CONTACT } from "@/constants/default-contact";

// WhatsApp number for the "Chat with us" links on /go/:slug pages. Set
// NEXT_PUBLIC_WHATSAPP_NUMBER (digits, with country code) to override; when
// unset it falls back to the WhatsApp link in the default contact details
// (the same one the Contact page uses), so nothing is hardcoded in components.
function whatsappDigits(): string {
  const fromEnv = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER?.replace(/[^\d]/g, "");
  if (fromEnv) return fromEnv;
  const fallback = DEFAULT_CONTACT.socialLinks?.find((l) => l.platform.toLowerCase() === "whatsapp")?.url ?? "";
  return fallback.replace(/[^\d]/g, "");
}

export function campaignWhatsappUrl(message: string): string {
  return `https://wa.me/${whatsappDigits()}?text=${encodeURIComponent(message)}`;
}

export function campaignWhatsappMessage(pageName: string): string {
  return `Hi, I have a question about ${pageName}`;
}
