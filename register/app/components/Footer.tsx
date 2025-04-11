"use client";
import Link from "next/link";
import Image from "next/image";
import { FaFacebook, FaInstagram, FaLinkedin, FaTwitter } from "react-icons/fa";

export default function Footer() {
  return (
    <footer className="bg-blue-900 text-white p-8">
      {/* Top Section: Social Icons, Logo, Login/Signup */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-6">
        {/* Social Icons */}
        <div className="flex space-x-4">
          <span className="w-10 h-10 flex items-center justify-center rounded-full bg-blue-600 hover:bg-blue-500 cursor-pointer">
            <FaFacebook size={20} />
          </span>

          <span className="w-10 h-10 flex items-center justify-center rounded-full bg-blue-400 hover:bg-blue-300 cursor-pointer">
            <FaTwitter size={20} />
          </span>

          <span className="w-10 h-10 flex items-center justify-center rounded-full bg-pink-500 hover:bg-pink-400 cursor-pointer">
            <FaInstagram size={20} />
          </span>
          <span className="w-10 h-10 flex items-center justify-center rounded-full bg-blue-700 hover:bg-blue-600 cursor-pointer">
            <FaLinkedin size={20} />
          </span>
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
          {/*<Link href="/login">
            <span className="border border-white px-4 py-2 rounded-md hover:bg-white hover:text-gray-900 transition">
              Login
            </span>
          </Link>*/}
          <Link href="/register">
            <span className="bg-blue-700 px-4 py-2 rounded-md hover:bg-blue-600 transition">
              Get Started
            </span>
          </Link>
        </div>
      </div>

      {/* Footer Links Section */}
      <div className="container mx-auto mt-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Tutors Column */}
          <div>
            <h2 className="text-xl font-semibold mb-4 border-b border-gray-700 pb-2">Tutors</h2>
            <ul className="space-y-2">
              {["Home", "About", "Services", "Contact"].map((item) => (
                <li key={item}>
                  <Link
                    href={`/${item.toLowerCase()}`}
                    className="hover:text-blue-300 transition-colors"
                  >
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company Column */}
          <div>
            <h2 className="text-xl font-semibold mb-4 border-b border-gray-700 pb-2">Company</h2>
            <ul className="space-y-2">
              {["About", "Careers", "Safety", "Take a Tour"].map((item) => (
                <li key={item}>
                  <Link
                    href={`/company/${item.toLowerCase().replace(" ", "-")}`}
                    className="hover:text-blue-300 transition-colors"
                  >
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Column 
          <div>
            <h2 className="text-xl font-semibold mb-4 border-b border-gray-700 pb-2">Contact</h2>
            <ul className="space-y-2">
              {["Parents", "Homeschooling", "Home Tutoring"].map((item) => (
                <li key={item}>
                  <Link
                    href={`/contact/${item.toLowerCase().replace(" ", "-")}`}
                    className="hover:text-blue-300 transition-colors"
                  >
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>*/}
        </div>
      </div>

      {/* Copyright Section */}
      <div className="mt-8 pt-4 border-t border-gray-800 text-center text-gray-400">
        © {new Date().getFullYear()} STC Tutors. All rights reserved.
      </div>
    </footer>
  );
}
