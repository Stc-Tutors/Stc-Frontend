import React from "react";
import "./globals.css";
import { Toaster } from "sonner";
import { UserProvider } from "@/contexts/user-context";
import { TenantBrandingProvider } from "@/contexts/tenant-branding-context";
import TermsGateModal from "@/components/terms-gate-modal";
import OnboardingTour from "@/components/onboarding-tour/onboarding-tour";
import PushNotificationRegistrar from "@/components/push-notification-registrar";
import RealtimeSync from "@/components/realtime-sync";
import ContactUsWidget from "@/components/contact-us-widget";


export const metadata = {
  title: "STC Tutors",
  description: "Personalized online tutoring platform",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <TenantBrandingProvider>
        <UserProvider>
          {/* suppressHydrationWarning only ignores a mismatch on this element's own
              attributes (not its children) - the standard fix for a browser
              extension (Grammarly, Dark Reader, etc.) injecting attributes like
              data-gr-ext-installed into <body> before React hydrates. Harmless and
              unrelated to any app code; this just stops it being flagged as an error. */}
          <body className="min-h-screen flex flex-col " suppressHydrationWarning>
            {children}
            {/* Mandatory for every role, on top of any page - see TermsGateModal. */}
            <TermsGateModal />
            {/* First-login walkthrough - gates itself on hasCompletedTour, see OnboardingTour. */}
            <OnboardingTour />
            <PushNotificationRegistrar />
            <RealtimeSync />
            {/* "Need help?" - call / WhatsApp / email / support, with details per audience - see ContactUsWidget. */}
            <ContactUsWidget />
            <Toaster position="top-right" />
          </body>
        </UserProvider>
      </TenantBrandingProvider>
    </html>
  );
}