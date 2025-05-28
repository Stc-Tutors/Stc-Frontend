import "./globals.css";
import { Toaster } from "sonner";


export const metadata = {
  title: "STC Tutors",
  description: "Personalized online tutoring platform",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col ">
        {/* <Navbar /> */}
        {children}
        <Toaster position="top-right" />
      </body>
    </html>
  );
}