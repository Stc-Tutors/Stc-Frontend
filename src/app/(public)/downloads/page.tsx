import type { Metadata } from "next";
import Footer from "@/app/components/Footer";
import Downloads from "./downloads";

export const metadata: Metadata = {
  title: "Download the app",
};

export default function DownloadsPage() {
  return (
    <>
      <main>
        <Downloads />
      </main>
      <Footer />
    </>
  );
}
