"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import "./Navbar.css"
import { lmsDashboardPath } from "@/config/routes";
import { useTenantBranding } from "@/contexts/tenant-branding-context";
import { useUser } from "@/contexts/user-context";
import { UserProfileDropdown } from "@/components/user-profile-dropdown";
import { usePageSection } from "@/hooks/use-page-section";
import { HeaderContent, PageSectionKey } from "@/types/content";

// Mirrors Stc-SuperAdmin's DEFAULT_HEADER (page-sections-tab.tsx) - keep in sync.
const DEFAULT_HEADER: HeaderContent = {
  navLinks: [
    { label: "About", href: "/about" },
    { label: "Services", href: "/services" },
    { label: "Blog", href: "/blog" },
    { label: "Careers", href: "/careers" },
    { label: "Contact", href: "/contact" },
  ],
  ctaText: "Get Started",
  ctaLink: "/services",
};

const Navbar = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();
  const { tenant } = useTenantBranding();
  const { user, logout } = useUser();
  const logoUrl = tenant?.branding?.logoUrl;
  const header = usePageSection(PageSectionKey.HEADER, DEFAULT_HEADER);

  const links = header.navLinks.map((link) => ({ path: link.href, label: link.label }));

  // Disable scrolling when mobile menu is open
  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
  }, [mobileOpen]);

  return (
    <header className="navHeader">
      <div className="navContainer">
        {/* Logo that acts as home link */}
        <Link href="/" className="logo">
          {logoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={logoUrl} alt={tenant?.branding?.displayName || tenant?.name || "Logo"} className="h-11 w-auto" />
          ) : (
            <Image src="/image/logo_black.png" alt="STC Tutors" width={160} height={45} priority />
          )}
        </Link>

        {/* Desktop Navigation */}
        <nav className="desktopNav">
          <ul>
            {links.map((link) => (
              <li key={link.path}>
                <Link
                  href={link.path}
                  className={`link ${pathname.startsWith(link.path) ? "active" : ""}`}
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
          {user ? (
            <UserProfileDropdown />
          ) : (
            <Link href={header.ctaLink} className="navbarCta">
              {header.ctaText}
            </Link>
          )}
        </nav>

        {/* Mobile Menu Button */}
        <button
          className={`menuButton ${mobileOpen ? "open" : ""}`}
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Menu"
        >
          <span></span>
          <span></span>
          <span></span>
        </button>

        {/* Mobile Menu Overlay */}
        <div className={`mobileNav ${mobileOpen ? "show" : ""}`}>
          <div className="mobileContent">
            <ul>
              {links.map((link) => (
                <li key={link.path}>
                  <Link
                    href={link.path}
                    className={`mobileLink ${pathname.startsWith(link.path) ? "active" : ""}`}
                    onClick={() => setMobileOpen(false)}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
              {user ? (
                <>
                  <li>
                    <Link
                      href={lmsDashboardPath(user.role)}
                      className="mobileLink"
                      onClick={() => setMobileOpen(false)}
                    >
                      Dashboard
                    </Link>
                  </li>
                  <li>
                    <button
                      type="button"
                      className="mobileCta"
                      onClick={() => {
                        setMobileOpen(false);
                        logout();
                      }}
                    >
                      Log out
                    </button>
                  </li>
                </>
              ) : (
                <li>
                  <Link
                    href={header.ctaLink}
                    className="mobileCta"
                    onClick={() => setMobileOpen(false)}
                  >
                    {header.ctaText}
                  </Link>
                </li>
              )}
            </ul>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
