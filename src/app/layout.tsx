import "./globals.css";
import Navbar from "./components/Navbar";
import "./globals.css";


export const metadata = {
  title: "STC Tutors",
  description: "Personalized online tutoring platform",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Navbar />
        {children}
      </body>
    </html>
  );
}