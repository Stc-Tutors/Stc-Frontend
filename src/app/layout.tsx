import React from "react";
import "./globals.css";
import { Toaster } from "sonner";
import { UserProvider } from "@/contexts/user-context";


export const metadata = {
  title: "STC Tutors",
  description: "Personalized online tutoring platform",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <UserProvider>
        <body className="min-h-screen flex flex-col ">
          {children}
          <Toaster position="top-right" />
        </body>
      </UserProvider>
    </html>
  );
}