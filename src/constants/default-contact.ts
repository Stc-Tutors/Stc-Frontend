import { ContactInfoContent } from "@/types/content";

// The contact details shown until an admin has edited them (Stc-SuperAdmin's
// Site Content > Contact). Shared by the public Contact page and anywhere else
// that has to point a visitor at a real way to reach the team.
export const DEFAULT_CONTACT: ContactInfoContent = {
  phones: ["+234 706 055 4954"],
  emails: ["stc.consult24@gmail.com"],
  socialLinks: [
    { platform: "WhatsApp", url: "https://wa.me/2347089118528" },
    { platform: "Instagram", url: "https://instagram.com/stc.consult01" },
    { platform: "Facebook", url: "https://web.facebook.com/stc.consult01/" },
    { platform: "LinkedIn", url: "https://linkedin.com/company/yourcompany" },
    { platform: "TikTok", url: "https://www.tiktok.com/@stc.consult01" },
  ],
};
