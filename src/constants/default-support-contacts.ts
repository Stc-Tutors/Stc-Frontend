import { SupportContactsContent } from "@/types/content";

// Until the owner edits Site Content > Support Contacts: everyone is pointed at the same general details (the same ones as the
// Contact page). Mirrors Stc-SuperAdmin's DEFAULT_SUPPORT_CONTACTS (page-sections-tab.tsx) - keep in sync.
export const DEFAULT_SUPPORT_CONTACTS: SupportContactsContent = {
  general: { phone: "+234 706 055 4954", whatsapp: "2347089118528", email: "stc.consult24@gmail.com" },
  tutor: {},
  parent: {},
  student: {},
  admin: {},
};
