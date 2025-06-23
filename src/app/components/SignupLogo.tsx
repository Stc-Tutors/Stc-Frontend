"use client";
import Link from "next/link";
import Image from "next/image";

export default function SignupLogoHeader() {
  return (
    <div className="w-full flex items-start justify-start px-4 py-4">
      <Link href="/" className="block">
        <Image
          src="/image/logo_white.png"
          alt="STC Tutors"
          width={160}
          height={40}
          priority
        />
      </Link>
    </div>
  );
}