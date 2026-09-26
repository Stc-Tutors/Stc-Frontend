"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import "keen-slider/keen-slider.min.css";
import { GetMyTutorProfileAction } from "@/server/tutor-profile";
import { GetMyTutorApplicationAction } from "@/server/tutor-application";
import { TutorApplicationStatus } from "@/types/tutor-application";

import {
  Home,
  Calendar,
  Users,
  Search,
  Menu,
  MessageSquare,
  BookOpen,
  BarChart2,
  Headphones,
  Bell,
  LogOut,
  FileUser,
  CircleUserRound,
  Target,
  FolderUp,
  Gift,
  UserCheck,
  Hourglass,
  Star,
} from "lucide-react";
import BrandLogo from "@/components/shared/BrandLogo";
import LogoutButton from "@/components/shared/LogoutButton";
import { UserProfileDropdown } from "@/components/user-profile-dropdown";
import NotificationBell from "@/components/notification-bell";
import AnnouncementsOverlay from "@/components/announcements-overlay";
import { useUser } from "@/contexts/user-context";
import { HodPermission } from "@/types/hod";
import { Network } from "lucide-react";

// export const metadata = {
//   title: "STC Tutors LMS",
//   description: "Tutor & Student Portal",
// };

const sidebarLinks = [
  { label: "Dashboard", icon: Home, href: "/lms-home/tutor/dashboard" },
  { label: "Schedule", icon: Calendar, href: "/lms-home/tutor/scheduling" },
  { label: "Pending Assignments", icon: UserCheck, href: "/lms-home/tutor/pending-assignments" },
  { label: "Classroom", icon: Users, href: "/lms-home/tutor/classroom" },
  { label: "My Hours", icon: Hourglass, href: "/lms-home/tutor/hours" },
  { label: "Student Progress", icon: Target, href: "/lms-home/tutor/student-progress" },
  { label: "Assignments", icon: BookOpen, href: "/lms-home/tutor/assignments" },
  { label: "Messages", icon: MessageSquare, href: "/lms-home/tutor/messages" },
  { label: "Your Account", icon: CircleUserRound, href: "/lms-home/tutor/your-account" },
  { label: "Refer & Earn", icon: Gift, href: "/lms-home/tutor/refer-earn" },
  { label: "Analytics", icon: BarChart2, href: "/lms-home/tutor/analytics" },
  { label: "Resources", icon: FolderUp, href: "/lms-home/tutor/resources" },
  { label: "Profile", icon: FileUser, href: "/lms-home/tutor/profile-details" },
  // Support is the complaints/help centre, as it is for parents and students. It used to open Messages (already
  // listed above) with a separate "Complaints" entry beside it.
  { label: "Support", icon: Headphones, href: "/lms-home/tutor/complaints" },
  { label: "Notifications", icon: Bell, href: "/lms-home/tutor/notification", badge: true },
];

// HOD status is additive (see stcbe's HodService.assign) - a Tutor who
// also holds hodScopes keeps this entire sidebar and simply gains these
// extra entries on top, pointing at the same shared pages the Admin area
// uses (permission-gated there too, so nothing extra leaks by linking in).
const HOD_LINKS: {
  label: string;
  icon: typeof Network;
  href: string;
  badge?: boolean;
  // A single permission, or several treated as OR (any one is enough) - see
  // admin/layout.tsx's identical HOD_LINKS shape.
  hodPermission?: HodPermission | HodPermission[];
  hodOnly?: boolean;
}[] = [
  { label: "Tutor Applications", icon: FileUser, href: "/lms-home/admin/tutor-applications", hodPermission: HodPermission.REVIEW_TUTOR_APPLICATIONS },
  { label: "HOD Reports", icon: BarChart2, href: "/lms-home/admin/hod-reports", hodPermission: HodPermission.VIEW_REPORTS },
  { label: "My Unassigned Queue", icon: Users, href: "/lms-home/admin/hod-unassigned-queue", hodPermission: HodPermission.MANAGE_UNASSIGNED_QUEUE },
  {
    label: "Class Feedback",
    icon: Star,
    href: "/lms-home/admin/feedback",
    hodPermission: [HodPermission.MANAGE_COURSES, HodPermission.VIEW_REPORTS],
  },
  {
    label: "My Tutors (HOD Scope)",
    icon: Users,
    href: "/lms-home/admin/hod-tutors",
    hodPermission: [HodPermission.MANAGE_COURSES, HodPermission.VIEW_REPORTS],
  },
];

const ONBOARDING_PATH = "/lms-home/tutor/onboarding";
const VETTING_PATH = "/lms-home/tutor/vetting";

export default function LMSLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  // Close the mobile drawer whenever the user navigates.
  useEffect(() => {
    setIsSidebarOpen(false);
  }, [pathname]);
  const [searchTerm, setSearchTerm] = useState("");
  const { hodAssignment, hasHodPermission } = useUser();
  const visibleHodLinks = HOD_LINKS.filter((link) => {
    if (link.hodOnly) return !!hodAssignment;
    if (!link.hodPermission) return false;
    const hodPerms = Array.isArray(link.hodPermission) ? link.hodPermission : [link.hodPermission];
    return hodPerms.some(hasHodPermission);
  });

  // Hard gate, not just the tutor-vetting-banner nag: a tutor whose
  // application is APPROVED_PENDING_VETTING can already log in (their
  // account is ACTIVE so they can reach this exact form), but must not be
  // able to browse the rest of the dashboard - allocation eligibility and
  // everything else waits for the Vetting Questionnaire. Also gated while
  // VETTING_SUBMITTED: a reviewer has to confirm the answers before the
  // tutor is treated as vetted (see TutorApplicationService.confirmVetting) -
  // this used to auto-approve on submission, so the tutor went straight
  // through here. Checked ahead of the onboarding check below since
  // completing vetting comes first.
  useEffect(() => {
    if (pathname === VETTING_PATH) return;
    (async () => {
      const [res] = await GetMyTutorApplicationAction();
      if (
        res?.data?.status === TutorApplicationStatus.APPROVED_PENDING_VETTING ||
        res?.data?.status === TutorApplicationStatus.VETTING_SUBMITTED
      ) {
        router.replace(VETTING_PATH);
      }
    })();
  }, [pathname, router]);

  useEffect(() => {
    if (pathname === ONBOARDING_PATH || pathname === VETTING_PATH) return;
    (async () => {
      const [res] = await GetMyTutorProfileAction();
      const profile = res?.data;
      if (!profile) return;
      // teachingCombinations is the old flat (Country/Curriculum/GradeLevel)
      // shape - superseded by teachingCycles for Academic Tutoring/Exam
      // Prep/Tech Training, and by the flat non-cycle fields below for
      // every other service (Music/Digital Skills/Soft Skills/Career
      // Coaching/Self-Dev/Adult Ed). A tutor who completed the registration
      // wizard's "What You Can Teach" step already has one of these
      // populated - checking teachingCombinations alone (never written by
      // the current wizard) forced every newly-approved tutor back through
      // this onboarding step to re-pick subjects they'd already chosen.
      const hasDeclaredWhatTheyTeach =
        profile.teachingCombinations.length > 0 ||
        (profile.teachingCycles?.length ?? 0) > 0 ||
        (profile.digitalSkillsBundles?.length ?? 0) > 0 ||
        (profile.musicInstruments?.length ?? 0) > 0 ||
        (profile.softSkillsTopics?.length ?? 0) > 0 ||
        (profile.careerCoachingTopics?.length ?? 0) > 0 ||
        (profile.selfDevTopics?.length ?? 0) > 0 ||
        (profile.adultEdFocusAreas?.length ?? 0) > 0;
      // ageLevelsTaught has no equivalent anywhere in the registration
      // wizard (unlike everything checked above, which is carried over from
      // TutorApplication at approval) - it's only ever collected here, so
      // it's the one thing that still sends an otherwise-fully-registered
      // tutor through onboarding.
      const hasDeclaredAgeLevels = (profile.ageLevelsTaught?.length ?? 0) > 0;
      if (!hasDeclaredWhatTheyTeach || !hasDeclaredAgeLevels) {
        router.replace(ONBOARDING_PATH);
      }
    })();
  }, [pathname, router]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchTerm.trim()) return;
    router.push(`/lms-home/tutor/student-list?q=${encodeURIComponent(searchTerm.trim())}`);
  };

  // First-login onboarding and the post-approval Vetting Questionnaire are
  // both bare full-screen steps - no sidebar/topbar chrome, so a tutor can't
  // wander off into the rest of the dashboard before completing either one.
  if (pathname === ONBOARDING_PATH || pathname === VETTING_PATH) {
    return <>{children}</>;
  }

  return (
    <div className="flex h-dvh bg-gray-100 relative">
      {/* Sidebar */}
      {/* Mobile backdrop: tap outside the drawer to close it */}
      {isSidebarOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black/40 z-30"
          onClick={() => setIsSidebarOpen(false)}
          aria-hidden="true"
        />
      )}
      <aside
        className={`fixed md:static top-0 left-0 h-full w-64 bg-white border-r shadow-md z-40 transform transition-transform duration-300 ease-in-out
        ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"} md:translate-x-0 md:flex flex-col justify-between`}
      >
        
          <div className={`flex items-center justify-between p-4 border-b ${isSidebarOpen ? "pl-[4.5rem]" : ""} md:pl-4`}>
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
            {[
              ...sidebarLinks.filter(({ label }) => !["Support", "Notifications"].includes(label)),
              ...visibleHodLinks,
            ]
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
                            href="/lms-home/tutor/complaints"
                            className="flex items-center gap-3 text-gray-600 hover:text-[#38b6ff] hover:translate-x-3">
                                <Headphones className="w-5 h-5" />
                                Support
                                </Link>
                                
                                {/* Notifications */}
                                <Link
                                href="/lms-home/tutor/notification"
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
      <div className="flex-1 flex flex-col min-w-0">
        {/* Topbar */}
        <header className="h-16 bg-white shadow-sm px-3 sm:px-6 flex items-center justify-between gap-2">
          {/* Hamburger (mobile only) */}
          <button
            aria-label={isSidebarOpen ? "Close menu" : "Open menu"}
            className="md:hidden relative z-50 mr-2 sm:mr-4 p-2 rounded-md hover:bg-blue-100 transition shrink-0"
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          >
            <Menu className="w-6 h-6 text-gray-700" />
          </button>

          {/* SearchBar */}
          <form onSubmit={handleSearchSubmit} className="relative w-full max-w-xs min-w-0">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              id="search"
              name="search"
              placeholder="Search your students..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-1.5 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400 text-sm"
            />
          </form>

          {/* Icons */}
          <div className="flex items-center gap-1 sm:gap-2 shrink-0">
            <Link
              href="/lms-home/tutor/messages"
              title="Messages"
              className="group relative p-2 rounded-full hover:bg-gray-100 cursor-pointer transition"
            >
              <MessageSquare className="w-5 h-5 text-gray-600" />
            </Link>

            <AnnouncementsOverlay />

            <NotificationBell viewAllHref="/lms-home/tutor/notification" />

            <UserProfileDropdown />
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-3 sm:p-6">{children}</main>
      </div>
    </div>
  );
}

