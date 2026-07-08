"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import "./Navbar.css"
import { ROUTES } from "@/config/routes";

const Navbar = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();

  const links = [
    { path: "/about", label: "About" },
    { path: "/services", label: "Services" },
    { path: "/contact", label: "Contact" },
  ];

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
          <Image src="/image/logo_black.png" alt="STC Tutors" width={160} height={45} priority />
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
          {/* <Link href={ROUTES.AUTH.REGISTER} className="navbarCta">Get Started</Link> */}
          <Link href="/services" className="navbarCta">
            Get Started
          </Link>
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
              <li>
                <Link
                  href={ROUTES.AUTH.REGISTER}
                  className="mobileCta"
                  onClick={() => setMobileOpen(false)}
                >
                  Get Started
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
