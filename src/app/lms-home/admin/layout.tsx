"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

import {
  Home,
  Users,
  BookOpen,
  ClipboardList,
  BarChart2,
  UserRound,
  Headphones,
  Bell,
  LogOut,
  Menu,
  Search,
  MessageSquare,
  GraduationCap,
  CreditCard,
  Baby,
  Wallet,
  CalendarClock,
  FileStack,
  Network,
  DollarSign,
  Boxes,
  Tags,
  UsersRound,
  FormInput,
  FolderUp,
  Gift,
  AlertCircle,
  Megaphone,
  RefreshCcw,
  UserCog,
  History,
  FileCheck2,
  Settings,
  ArrowLeftRight,
} from "lucide-react";
import BrandLogo from "@/components/shared/BrandLogo";
import LogoutButton from "@/components/shared/LogoutButton";
import { UserProfileDropdown } from "@/components/user-profile-dropdown";
import { useUser } from "@/contexts/user-context";
import { AdminPermission } from "@/types/admin-permission";
import { isSuperOrAlmighty } from "@/lib/roles";

// permission: undefined means always visible (no matching AdminPermission
// exists yet, or the page is universally accessible). superOrAlmightyOnly is
// a role gate, not a permission - for tenant-owner-tier capability
// (Allocation Hub, deep Finance, tenant settings) that a regular STC_ADMIN/
// TUTOR_ADMIN should never see even with every permission granted, since
// permissions can be handed out per-admin while these are SUPER_ADMIN/
// ALMIGHTY_ADMIN by definition (mirrors Stc-SuperAdmin's isSuperOrAlmighty gates).
const sidebarLinks: {
  label: string;
  icon: typeof Home;
  href: string;
  badge?: boolean;
  permission?: AdminPermission;
  superOrAlmightyOnly?: boolean;
}[] = [
  { label: "Dashboard", icon: Home, href: "/lms-home/admin/dashboard" },
  { label: "Students", icon: Users, href: "/lms-home/admin/students", permission: AdminPermission.MANAGE_STUDENTS },
  { label: "Parents", icon: Baby, href: "/lms-home/admin/parents", permission: AdminPermission.MANAGE_STUDENTS },
  { label: "Users", icon: Users, href: "/lms-home/admin/users", permission: AdminPermission.MANAGE_USERS },
  {
    label: "Tutor Applications",
    icon: GraduationCap,
    href: "/lms-home/admin/tutor-applications",
    permission: AdminPermission.REVIEW_TUTOR_APPLICATIONS,
  },
  { label: "Video Courses", icon: BookOpen, href: "/lms-home/admin/video-courses", permission: AdminPermission.APPROVE_RESOURCES },
  {
    label: "Curriculum Taxonomy",
    icon: Network,
    href: "/lms-home/admin/curriculum-taxonomy",
    permission: AdminPermission.MANAGE_TAXONOMY,
  },
  {
    label: "Service Pricing",
    icon: DollarSign,
    href: "/lms-home/admin/service-pricing",
    permission: AdminPermission.MANAGE_PRICING,
  },
  {
    label: "Service Catalog",
    icon: Boxes,
    href: "/lms-home/admin/service-catalog",
    permission: AdminPermission.MANAGE_TAXONOMY,
  },
  {
    label: "Taxonomy Options",
    icon: Tags,
    href: "/lms-home/admin/taxonomy-options",
    permission: AdminPermission.MANAGE_TAXONOMY,
  },
  {
    label: "Class Groups",
    icon: UsersRound,
    href: "/lms-home/admin/class-groups",
    permission: AdminPermission.MANAGE_TAXONOMY,
  },
  {
    label: "Custom Form Fields",
    icon: FormInput,
    href: "/lms-home/admin/custom-form-fields",
    permission: AdminPermission.MANAGE_TAXONOMY,
  },
  { label: "Enrollments", icon: ClipboardList, href: "/lms-home/admin/enrollments", permission: AdminPermission.MANAGE_STUDENTS },
  { label: "Sessions", icon: CalendarClock, href: "/lms-home/admin/sessions", permission: AdminPermission.VIEW_ALL_SCHEDULES },
  {
    label: "Document Upload",
    icon: FileStack,
    href: "/lms-home/admin/document-upload",
    permission: AdminPermission.APPROVE_RESOURCES,
  },
  {
    label: "Resources",
    icon: FolderUp,
    href: "/lms-home/admin/resources",
    permission: AdminPermission.APPROVE_RESOURCES,
  },
  {
    label: "Assignments",
    icon: FileCheck2,
    href: "/lms-home/admin/assignments",
    permission: AdminPermission.APPROVE_RESOURCES,
  },
  {
    label: "Finance",
    icon: Wallet,
    href: "/lms-home/admin/finance",
    permission: AdminPermission.VIEW_FINANCIAL_REPORTS,
  },
  // Mixed-purpose page: any admin can use the self-service referral-link/
  // withdrawal-request section (ungated on the backend), while the
  // admin-only withdrawal approval queue + commission settings are gated
  // inside the page itself via MANAGE_REFERRAL_SETTINGS - left ungated here
  // for the same reason as Reports above.
  { label: "Refer & Earn", icon: Gift, href: "/lms-home/admin/refer-earn" },
  { label: "Subscriptions", icon: CreditCard, href: "/lms-home/admin/subscriptions" },
  { label: "Messages", icon: MessageSquare, href: "/lms-home/admin/messages" },
  // Mixed-purpose page (financial revenue chart + operational courses-by-status
  // report) - left ungated at the nav level since the operational half is open
  // to any admin; the revenue section gates itself inside the page.
  { label: "Reports", icon: BarChart2, href: "/lms-home/admin/reports" },
  {
    label: "Complaints",
    icon: AlertCircle,
    href: "/lms-home/admin/complaints",
    permission: AdminPermission.MANAGE_COMPLAINTS,
  },
  {
    label: "Announcements",
    icon: Megaphone,
    href: "/lms-home/admin/announcements",
    permission: AdminPermission.MANAGE_ANNOUNCEMENTS,
  },
  {
    label: "Reschedule Requests",
    icon: RefreshCcw,
    href: "/lms-home/admin/reschedule-requests",
    permission: AdminPermission.APPROVE_RESCHEDULES,
  },
  {
    label: "Schedule Approvals",
    icon: CalendarClock,
    href: "/lms-home/admin/schedule-approvals",
    permission: AdminPermission.MANAGE_SCHEDULES,
  },
  // No permission - GET /users?role=TUTOR is already scoped server-side to
  // the calling admin's assigned cluster, so this is visible to any assigned admin.
  { label: "My Tutors", icon: UserCog, href: "/lms-home/admin/my-tutors" },
  {
    label: "Allocation Hub",
    icon: ArrowLeftRight,
    href: "/lms-home/admin/allocations",
    superOrAlmightyOnly: true,
  },
  {
    label: "Audit Log",
    icon: History,
    href: "/lms-home/admin/audit-log",
    permission: AdminPermission.VIEW_AUDIT_LOGS,
  },
  {
    label: "Tenant Settings",
    icon: Settings,
    href: "/lms-home/admin/tenant-settings",
    superOrAlmightyOnly: true,
  },
  { label: "Profile", icon: UserRound, href: "/lms-home/admin/profile" },
  { label: "Support", icon: Headphones, href: "/lms-home/admin/messages" },
  { label: "Notifications", icon: Bell, href: "/lms-home/admin/notification", badge: true },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const { user, hasPermission } = useUser();

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchTerm.trim()) return;
    router.push(`/lms-home/admin/students?search=${encodeURIComponent(searchTerm.trim())}`);
  };

  return (
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
            className="md:hidden text-gray-500 hover:text-blue-600 text-3xl font-bold"
          >
            &times;
          </button>
        </div>

        <nav className="p-4 space-y-2 flex-1">
          {sidebarLinks
            .filter(({ label }) => !["Support", "Notifications"].includes(label))
            .filter(({ permission }) => !permission || hasPermission(permission))
            .filter(({ superOrAlmightyOnly }) => !superOrAlmightyOnly || (user && isSuperOrAlmighty(user.role)))
            .map(({ label, icon: Icon, href, badge }) => (
              <Link
                key={label}
                href={href}
                className={`flex items-center justify-between px-4 py-2 rounded-lg transition-transform duration-200 ${
                  pathname === href
                    ? "bg-blue-100 text-gray-500 hover:text-[#38b6ff] font-medium -translate-x-1"
                    : "text-gray-700 hover:bg-blue-100 hover:text-[#38b6ff] hover:translate-x-3"
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className="w-5 h-5" />
                  {label}
                </div>
                {badge && <span className="ml-auto w-2.5 h-2.5 bg-red-500 rounded-full"></span>}
              </Link>
            ))}
        </nav>

        <div className="p-4 border-t space-y-4">
          <Link href="/lms-home/admin/messages" className="flex items-center gap-3 text-gray-600 hover:text-[#38b6ff] hover:translate-x-3">
            <Headphones className="w-5 h-5" />
            Support
          </Link>
          <LogoutButton className="flex items-center gap-3 text-gray-600 hover:text-[#38b6ff] hover:translate-x-3">
            <LogOut className="w-5 h-5" />
            Logout
          </LogoutButton>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        <header className="h-16 bg-white shadow-sm px-6 flex items-center justify-between">
          <button
            className="md:hidden mr-4 p-2 rounded-md hover:bg-blue-100 transition"
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          >
            <Menu className="w-6 h-6 text-gray-700" />
          </button>

          <form onSubmit={handleSearchSubmit} className="relative w-full max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search students..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-1.5 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400 text-sm"
            />
          </form>

          <div className="flex items-center gap-2">
            <Link
              href="/lms-home/admin/messages"
              title="Messages"
              className="group relative p-2 rounded-full hover:bg-gray-100 cursor-pointer transition"
            >
              <MessageSquare className="w-5 h-5 text-gray-600" />
            </Link>

            <Link
              href="/lms-home/admin/notification"
              className="group relative p-2 rounded-full hover:bg-gray-100 cursor-pointer transition"
            >
              <Bell className="w-5 h-5 text-gray-600" />
            </Link>

            <UserProfileDropdown />
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  );
}
