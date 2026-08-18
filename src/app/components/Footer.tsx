"use client";
import Link from "next/link";
import Image from "next/image";
import { FaFacebook, FaGlobe, FaInstagram, FaLinkedin, FaTiktok } from "react-icons/fa";
import { ROUTES } from "@/config/routes";
import { usePageSection } from "@/hooks/use-page-section";
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
    { label: "Contact", href: "/contact" },
  ],
};

const SOCIAL_ICON: Record<string, { Icon: typeof FaGlobe; bg: string; hoverBg: string }> = {
  facebook: { Icon: FaFacebook, bg: "bg-blue-600", hoverBg: "hover:bg-blue-500" },
  tiktok: { Icon: FaTiktok, bg: "bg-blue-400", hoverBg: "hover:bg-blue-300" },
  instagram: { Icon: FaInstagram, bg: "bg-pink-500", hoverBg: "hover:bg-pink-400" },
  linkedin: { Icon: FaLinkedin, bg: "bg-blue-700", hoverBg: "hover:bg-blue-600" },
};

export default function Footer() {
  const content = usePageSection(PageSectionKey.FOOTER, DEFAULT_FOOTER);

  return (
    <footer className="bg-[#38b6ff] text-white p-8">
      {/* Top Section: Social Icons, Logo, Login/Signup */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-6">
        {/* Social Icons */}
        <div className="flex space-x-4">
          {content.socialLinks.map((social) => {
            const icon = SOCIAL_ICON[social.platform.toLowerCase()] ?? { Icon: FaGlobe, bg: "bg-blue-600", hoverBg: "hover:bg-blue-500" };
            const { Icon } = icon;
            return (
              <a
                key={social.platform + social.url}
                href={social.url}
                target="_blank"
                rel="noopener noreferrer"
                className={`w-10 h-10 flex items-center justify-center rounded-full ${icon.bg} ${icon.hoverBg} cursor-pointer`}
              >
                <Icon size={20} />
              </a>
            );
          })}
        </div>

        {/* Logo Image */}
        <div className="my-4 md:my-0">
          <Image
            src="/image/image.png"
            alt="STC Logo"
            width={150}
            height={100}
          />
        </div>

        {/* Login & Signup Buttons */}
        <div className="flex space-x-4">
          <Link href={ROUTES.AUTH.REGISTER}>
            <span className="bg-white text-[#38b6ff] px-4 py-2 rounded-md hover:bg-blue-100 transition">
              Get Started
            </span>
          </Link>
        </div>
      </div>

      {/* Footer Links Section */}
      <div className="container mx-auto mt-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Company Column */}
          <div>
            <h2 className="text-xl font-semibold mb-4 border-b border-gray-700 pb-2">Company</h2>
            <ul className="space-y-2">
              {content.companyLinks.map((item) => (
                <li key={item.label}>
                  <Link
                    href={item.href}
                    className="hover:text-blue-300 transition-colors"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Partners Section */}
          <div>
            <h2 className="text-xl font-semibold mb-4 border-b border-gray-700 pb-2">Partners</h2>
            <a href="https://appsandscripts.tech" target="_blank" rel="noopener noreferrer">
            <img
            src="/image/apps&scripts.jpg"
            alt="Apps & Scripts"
            className="w-20 h-auto hover:opacity-80 transition"/>
            </a>
            </div>

            </div>
      </div>

      {/* Copyright Section */}
      <div className="mt-8 pt-4 border-t border-gray-800 text-center text-blue-900">
        © {new Date().getFullYear()} {content.copyrightName}. All rights reserved.
      </div>
    </footer>
  );
}
