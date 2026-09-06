"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import "keen-slider/keen-slider.min.css";
import { SelectedStudentProvider } from "@/contexts/selected-student-context";

import {
  Home,
  Calendar,
  Users,
  Search,
  Menu,
  MessageSquare,
  BarChart2,
  UserRound,
  Headphones,
  Bell,
  LogOut,
  CreditCard,
  ClipboardList,
  UserPlus,
  Gift,
  ShoppingBag,
  CalendarDays,
  GraduationCap,
  FolderOpen,
  Wallet,
} from "lucide-react";
import BrandLogo from "@/components/shared/BrandLogo";
import LogoutButton from "@/components/shared/LogoutButton";
import { UserProfileDropdown } from "@/components/user-profile-dropdown";
import NotificationBell from "@/components/notification-bell";
import AnnouncementsOverlay from "@/components/announcements-overlay";
import { ChildSwitcherDropdown } from "@/components/child-switcher-dropdown";
import AccessRestrictionGate from "@/components/shared/AccessRestrictionGate";

// export const metadata = {
//   title: "STC Tutors LMS",
//   description: "Tutor & Student Portal",
// };

const sidebarLinks = [
  { label: "Dashboard", icon: Home, href: "/lms-home/parent/dashboard" },
  { label: "Enrollment", icon: ClipboardList, href: "/lms-home/parent/enrollment" },
  { label: "Marketplace", icon: ShoppingBag, href: "/lms-home/parent/marketplace" },
  { label: "Tutors", icon: GraduationCap, href: "/lms-home/parent/tutors" },
  { label: "Schedule", icon: Calendar, href: "/lms-home/parent/scheduling" },
  { label: "Classroom", icon: Users, href: "/lms-home/parent/classroom" },
  { label: "Resources", icon: FolderOpen, href: "/lms-home/parent/resources" },
  { label: "Assessment", icon: CalendarDays, href: "/lms-home/parent/assessment" },
  { label: "Messages", icon: MessageSquare, href: "/lms-home/parent/messages" },
  { label: "Analytics", icon: BarChart2, href: "/lms-home/parent/analytics" },
  { label: "Subscription", icon: CreditCard, href: "/lms-home/parent/subscription" },
  { label: "Payments", icon: CreditCard, href: "/lms-home/parent/payments" },
  { label: "Wallet", icon: Wallet, href: "/lms-home/parent/wallet" },
  { label: "Refer & Earn", icon: Gift, href: "/lms-home/parent/refer-earn" },
  { label: "Add Child", icon: UserPlus, href: "/lms-home/parent/add-child" },
  { label: "Profile", icon: UserRound, href: "/lms-home/parent/profile" },
  { label: "Support", icon: Headphones, href: "/lms-home/parent/complaints" },
  { label: "Notifications", icon: Bell, href: "/lms-home/parent/notification", badge: true },
];

export default function LMSLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <AccessRestrictionGate role="PARENT">
    <SelectedStudentProvider>
    <div className="flex h-screen bg-gray-100 relative">
      {/* Sidebar */}
      <aside
        className={`fixed md:static top-0 left-0 h-full w-64 bg-white border-r shadow-md z-40 transform transition-transform duration-300 ease-in-out
        ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"} md:translate-x-0 md:flex flex-col justify-between`}
      >
        
          <div className="flex items-center justify-between p-4 border-b">
            <Link href="/">
            <BrandLogo width={120} height={40} className="object-contain" />
            </Link>

            <button
            onClick={() => setIsSidebarOpen(false)}
            className="md:hidden text-gray-500 hover:text-blue-600 text-3xl font-bold">
                &times;
                </button>
                </div>

          {/* Sidebar Navigation (top section) */}
          <nav className="p-4 space-y-2">
            {sidebarLinks
            .filter(({ label }) => !["Support", "Notifications"].includes(label))
            .map(({ label, icon: Icon, href, badge }) => (
            <Link
            key={label}
            href={href}
            className={`flex items-center justify-between px-4 py-2 rounded-lg transition-transform duration-200 ${
                pathname === href
                ? "bg-blue-100 text-gray-500 hover:text-[#38b6ff] font-medium -translate-x-1"
                : "text-gray-700 hover:bg-blue-100 hover:text-[#38b6ff] hover:translate-x-3"}`}>
                    <div className="flex items-center gap-3">
                        <Icon className="w-5 h-5" />
                        {label}
                        </div>
                        {badge && (
                            <span className="ml-auto w-2.5 h-2.5 bg-red-500 rounded-full"></span>
                            )}
                            </Link>
                        ))}
                        </nav>
                        
                        <div className="p-4 border-t space-y-6">
                            {/* Support */}
                            <Link
                            href="/lms-home/parent/complaints"
                            className="flex items-center gap-3 text-gray-600 hover:text-[#38b6ff] hover:translate-x-3">
                                <Headphones className="w-5 h-5" />
                                Support
                                </Link>
                                
                                {/* Notifications */}
                                <Link
                                href="/lms-home/parent/notification"
                                className="flex items-center gap-3 text-gray-600 hover:text-[#38b6ff] hover:translate-x-3">
                                    <Bell className="w-5 h-5" />
                                    Notifications
                                    </Link>
                                    
                                    {/* Logout */}
                                    <LogoutButton
                                    className="flex items-center gap-3 text-gray-600 hover:text-[#38b6ff] hover:translate-x-3">
                                        <LogOut className="w-5 h-5" />
                                        Logout
                                        </LogoutButton>
                                        </div>
                    </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Topbar */}
        <header className="h-16 bg-white shadow-sm px-6 flex items-center justify-between">
          {/* Hamburger (mobile only) */}
          <button
            className="md:hidden mr-4 p-2 rounded-md hover:bg-blue-100 transition"
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          >
            <Menu className="w-6 h-6 text-gray-700" />
          </button>

          {/* SearchBar */}
          <div className="relative w-full max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              id="search"
              name="search"
              placeholder="Search..."
              className="w-full pl-10 pr-4 py-1.5 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400 text-sm"
            />
          </div>

          {/* Icons */}
          <div className="flex items-center gap-2">
            <ChildSwitcherDropdown />

            <Link
              href="/lms-home/parent/messages"
              title="Messages"
              className="group relative p-2 rounded-full hover:bg-gray-100 cursor-pointer transition"
            >
              <MessageSquare className="w-5 h-5 text-gray-600" />
            </Link>

            <AnnouncementsOverlay />

            <NotificationBell viewAllHref="/lms-home/parent/notification" />

            <UserProfileDropdown />
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
    </SelectedStudentProvider>
    </AccessRestrictionGate>
  );
}

