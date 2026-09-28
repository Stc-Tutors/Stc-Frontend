"use client";
import Link from "next/link";
import Image from "next/image";
import { FaFacebook, FaGlobe, FaInstagram, FaLinkedin, FaTiktok } from "react-icons/fa";
import { ROUTES, lmsDashboardPath } from "@/config/routes";
import { usePageSection } from "@/hooks/use-page-section";
import { useUser } from "@/contexts/user-context";
import { FooterContent, PageSectionKey } from "@/types/content";

const DEFAULT_FOOTER: FooterContent = {
  copyrightName: "STC Tutors",
  socialLinks: [
    { platform: "Facebook", url: "https://web.facebook.com/stc.consult01/" },
    { platform: "TikTok", url: "https://www.tiktok.com/@stc.consult01" },
    { platform: "Instagram", url: "https://instagram.com/stc.consult01" },
    { platform: "LinkedIn", url: "https://linkedin.com/yourpage" },
  ],
  companyLinks: [
    { label: "Home", href: "/" },
    { label: "About", href: "/about" },
    { label: "Services", href: "/services" },
    { label: "Blog", href: "/blog" },
    { label: "Careers", href: "/careers" },
    { label: "Contact", href: "/contact" },
  ],
  partners: [
    { name: "Apps & Scripts", logoUrl: "/image/apps&scripts.jpg", url: "https://appsandscripts.tech" },
  ],
  loginText: "Login",
  loginLink: "/auth/login",
};

const SOCIAL_ICON: Record<string, { Icon: typeof FaGlobe; bg: string; hoverBg: string }> = {
  facebook: { Icon: FaFacebook, bg: "bg-blue-600", hoverBg: "hover:bg-blue-500" },
  tiktok: { Icon: FaTiktok, bg: "bg-blue-400", hoverBg: "hover:bg-blue-300" },
  instagram: { Icon: FaInstagram, bg: "bg-pink-500", hoverBg: "hover:bg-pink-400" },
  linkedin: { Icon: FaLinkedin, bg: "bg-blue-700", hoverBg: "hover:bg-blue-600" },
};

export default function Footer() {
  const content = usePageSection(PageSectionKey.FOOTER, DEFAULT_FOOTER);
  const { user, logout } = useUser();

  return (
    <footer className="bg-[#38b6ff] text-white p-5">
      {/* Top Section: Social Icons, Logo, Login/Signup */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-3 mb-3">
        {/* Social Icons */}
        <div className="flex space-x-3">
          {content.socialLinks.map((social) => {
            const icon = SOCIAL_ICON[social.platform.toLowerCase()] ?? { Icon: FaGlobe, bg: "bg-blue-600", hoverBg: "hover:bg-blue-500" };
            const { Icon } = icon;
            return (
              <a
                key={social.platform + social.url}
                href={social.url}
                target="_blank"
                rel="noopener noreferrer"
                className={`w-8 h-8 flex items-center justify-center rounded-full ${icon.bg} ${icon.hoverBg} cursor-pointer`}
              >
                <Icon size={16} />
              </a>
            );
          })}
        </div>

        {/* Logo Image */}
        <div>
          <Image
            src="/image/image.png"
            alt="STC Logo"
            width={100}
            height={67}
          />
        </div>

        {/* Account links */}
        <div className="flex items-center space-x-3">
          {user ? (
            <>
              <Link href={lmsDashboardPath(user.role)}>
                <span className="bg-white text-[#38b6ff] px-3 py-1.5 rounded-md text-sm hover:bg-blue-100 transition">
                  Dashboard
                </span>
              </Link>
              <button type="button" onClick={logout}>
                <span className="border border-white px-3 py-1.5 rounded-md text-sm hover:bg-white/10 transition">
                  Log out
                </span>
              </button>
            </>
          ) : (
            <>
              <Link href={content.loginLink} className="text-sm hover:text-blue-100 transition">
                {content.loginText}
              </Link>
              <Link href={ROUTES.AUTH.REGISTER}>
                <span className="bg-white text-[#38b6ff] px-3 py-1.5 rounded-md text-sm hover:bg-blue-100 transition">
                  Get Started
                </span>
              </Link>
            </>
          )}
        </div>
      </div>

      {/* Footer Links Section */}
      <div className="container mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {/* Company Column */}
          <div>
            <h2 className="text-sm font-semibold mb-2 border-b border-white/20 pb-1">Company</h2>
            <ul className="flex flex-wrap gap-x-4 gap-y-1 text-sm">
              {content.companyLinks.map((item) => (
                <li key={item.label}>
                  <Link
                    href={item.href}
                    className="hover:text-blue-100 transition-colors"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Partners Section */}
          {content.partners.length > 0 && (
            <div>
              <h2 className="text-sm font-semibold mb-2 border-b border-white/20 pb-1">Partners</h2>
              <div className="flex flex-wrap items-center gap-3">
                {content.partners.map((partner) => (
                  <a key={partner.name} href={partner.url} target="_blank" rel="noopener noreferrer">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={partner.logoUrl} alt={partner.name} className="h-8 w-auto hover:opacity-80 transition" />
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Copyright Section */}
      <div className="mt-3 pt-2 border-t border-white/20 text-center text-sm text-blue-950">
        <p>
          © {new Date().getFullYear()} {content.copyrightName}. All rights reserved.
        </p>
        <p className="mt-1 flex items-center justify-center gap-4">
          <Link href="/terms" className="underline-offset-2 hover:underline">
            Terms &amp; Conditions
          </Link>
          <Link href="/privacy" className="underline-offset-2 hover:underline">
            Privacy Policy
          </Link>
        </p>
      </div>
    </footer>
  );
}
