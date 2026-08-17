import React from "react";
import "./globals.css";
import { Toaster } from "sonner";
import { UserProvider } from "@/contexts/user-context";
import { TenantBrandingProvider } from "@/contexts/tenant-branding-context";
import TermsGateModal from "@/components/terms-gate-modal";


export const metadata = {
  title: "STC Tutors",
  description: "Personalized online tutoring platform",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <TenantBrandingProvider>
        <UserProvider>
          <body className="min-h-screen flex flex-col ">
            {children}
            {/* Mandatory for every role, on top of any page - see TermsGateModal. */}
            <TermsGateModal />
            <Toaster position="top-right" />
          </body>
        </UserProvider>
      </TenantBrandingProvider>
    </html>
  );
}