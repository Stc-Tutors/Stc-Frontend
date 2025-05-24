"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import styles from "./Navbar.module.css";

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
    <header className={styles.header}>
      <div className={styles.container}>
        {/* Logo that acts as home link */}
        <Link href="/" className={styles.logo}>
          <Image src="/image/logo_black.png" alt="STC Tutors" width={160} height={45} priority />
        </Link>

        {/* Desktop Navigation */}
        <nav className={styles.desktopNav}>
          <ul>
            {links.map((link) => (
              <li key={link.path}>
                <Link
                  href={link.path}
                  className={`${styles.link} ${pathname.startsWith(link.path) ? styles.active : ""}`}
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
          <Link href="/register" className={styles.ctaButton}>Get Started</Link>
        </nav>

        {/* Mobile Menu Button */}
        <button
          className={`${styles.menuButton} ${mobileOpen ? styles.open : ""}`}
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Menu"
        >
          <span></span>
          <span></span>
          <span></span>
        </button>

        {/* Mobile Menu Overlay */}
        <div className={`${styles.mobileNav} ${mobileOpen ? styles.show : ""}`}>
          <div className={styles.mobileContent}>
            <ul>
              {links.map((link) => (
                <li key={link.path}>
                  <Link
                    href={link.path}
                    className={`${styles.mobileLink} ${pathname.startsWith(link.path) ? styles.active : ""}`}
                    onClick={() => setMobileOpen(false)}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
              <li>
                <Link
                  href="/register"
                  className={styles.mobileCta}
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
