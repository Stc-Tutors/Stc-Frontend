"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import "keen-slider/keen-slider.min.css";
import { GetEnrollmentsAction } from "@/server/enrollment";

import {
  Home,
  Calendar,
  Users,
  Search,
  Menu,
  MessageSquare,
  BookOpen,
  BarChart2,
  UserRound,
  Headphones,
  NotebookPen,
  Bell,
  LogOut,
  CreditCard,
  ClipboardList,
  ClipboardCheck,
  Gift,
  GraduationCap,
  FolderOpen,
  Wallet,
} from "lucide-react";
import BrandLogo from "@/components/shared/BrandLogo";
import LogoutButton from "@/components/shared/LogoutButton";
import { UserProfileDropdown } from "@/components/user-profile-dropdown";
import NotificationBell from "@/components/notification-bell";
import AccessRestrictionGate from "@/components/shared/AccessRestrictionGate";
import { useUser } from "@/contexts/user-context";

// export const metadata = {
//   title: "STC Tutors LMS",
//   description: "Tutor & Student Portal",
// };

const sidebarLinks = [
  { label: "Dashboard", icon: Home, href: "/lms-home/student/dashboard" },
  { label: "Enrollment", icon: ClipboardList, href: "/lms-home/student/enrollment" },
  { label: "Tutors", icon: GraduationCap, href: "/lms-home/student/tutors" },
  { label: "Schedule", icon: Calendar, href: "/lms-home/student/scheduling" },
  { label: "Classroom", icon: Users, href: "/lms-home/student/classroom" },
  { label: "Resources", icon: FolderOpen, href: "/lms-home/student/resources" },
  { label: "Messages", icon: MessageSquare, href: "/lms-home/student/messages" },
  { label: "Assessment", icon: BookOpen, href: "/lms-home/student/assessment" },
  { label: "Analytics", icon: BarChart2, href: "/lms-home/student/analytics" },
  { label: "Attendance", icon: ClipboardCheck, href: "/lms-home/student/attendance" },
  { label: "Courses", icon: NotebookPen, href: "/lms-home/student/courses" },
  { label: "Subscription", icon: CreditCard, href: "/lms-home/student/subscription" },
  { label: "Payments", icon: CreditCard, href: "/lms-home/student/payments" },
  { label: "Wallet", icon: Wallet, href: "/lms-home/student/wallet" },
  { label: "Refer & Earn", icon: Gift, href: "/lms-home/student/refer-earn" },
  { label: "Profile", icon: UserRound, href: "/lms-home/student/profile" },
  { label: "Support", icon: Headphones, href: "/lms-home/student/complaints" },
  { label: "Notifications", icon: Bell, href: "/lms-home/student/notification", badge: true },
];

// Paths a student must still be able to reach before they've registered for
// any service - the registration wizard itself, and the admin-confirmation
// review flow (which implies a Student record already exists).
const ENROLLMENT_PATH = "/lms-home/student/enrollment";
const COMPLETE_PROFILE_PATH = "/lms-home/student/complete-profile";
const NEW_ENROLLMENT_PATH = "/lms-home/student/enrollment/new";

export default function LMSLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isLoading } = useUser();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // A student with no registered service can't use any other LMS feature -
  // keep sending them back to the registration wizard until they have one.
  // Except a parent-created child login (user.studentId set, no email -
  // see AuthService.registerChild in stcbe) - registering a new service is
  // their parent's call, not theirs, so redirecting them into the wizard
  // would just dead-end them on a flow the backend refuses to let them
  // submit. Wait for the user to actually load before deciding anything -
  // `user` starts null on mount, and treating that as "definitely not a
  // child login" would wrongly redirect a parent-registered child for the
  // instant before their profile arrives.
  useEffect(() => {
    if (isLoading || !user) return;
    if (user.studentId) return;
    if (pathname.startsWith(ENROLLMENT_PATH) || pathname.startsWith(COMPLETE_PROFILE_PATH)) return;
    (async () => {
      const [res] = await GetEnrollmentsAction();
      if (res?.data && res.data.length === 0) {
        router.replace(NEW_ENROLLMENT_PATH);
      }
    })();
  }, [pathname, router, user, isLoading]);

  // The registration wizard is a bare full-screen step - no sidebar/topbar
  // chrome, so a student with nothing registered yet can't wander off via
  // the sidebar before completing it.
  if (pathname === NEW_ENROLLMENT_PATH) {
    return (
      <AccessRestrictionGate role="STUDENT">
        <>{children}</>
      </AccessRestrictionGate>
    );
  }

  return (
    <AccessRestrictionGate role="STUDENT">
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
                        
                        <div className="p-4 border-t space-y-4">
                            {/* Support */}
                            <Link
                            href="/lms-home/student/complaints"
                            className="flex items-center gap-3 text-gray-600 hover:text-[#38b6ff] hover:translate-x-3">
                                <Headphones className="w-5 h-5" />
                                Support
                                </Link>
                                
                                {/* Notifications */}
                                <Link
                                href="/lms-home/student/notification"
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
            <Link
              href="/lms-home/student/messages"
              title="Messages"
              className="group relative p-2 rounded-full hover:bg-gray-100 cursor-pointer transition"
            >
              <MessageSquare className="w-5 h-5 text-gray-600" />
            </Link>

            <NotificationBell viewAllHref="/lms-home/student/notification" />

            <UserProfileDropdown />
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
    </AccessRestrictionGate>
  );
}



// "use client";

// import React, { useState } from "react";
// import Link from "next/link";
// import { usePathname } from "next/navigation";
// import {
//   Home,
//   Calendar,
//   Users,
//   MessageSquare,
//   BookOpen,
//   BarChart2,
//   UserRound,
//   Headphones,
//   Bell,
//   LogOut,
//   Search,
//   Menu,
// } from "lucide-react";
// import Image from "next/image";

// const sidebarLinks = [
//   { label: "Dashboard", icon: Home, href: "/lms-home/tutor/overview" },
//   { label: "Schedule", icon: Calendar, href: "/lms-home/tutor/schedule" },
//   { label: "Classroom", icon: Users, href: "#" },
//   { label: "Messages", icon: MessageSquare, href: "#" },
//   { label: "Assessment", icon: BookOpen, href: "#" },
//   { label: "Analytics", icon: BarChart2, href: "#" },
//   { label: "Profile", icon: UserRound, href: "/lms-home/tutor/profile" },
//   { label: "Support", icon: Headphones, href: "#" },
//   { label: "Notifications", icon: Bell, href: "#", badge: true },
// ];

// export default function LMSLayout({ children }: { children: React.ReactNode }) {
//   const pathname = usePathname();
//   const [isSidebarOpen, setIsSidebarOpen] = useState(false);

//   return (
//     <>
//       {/* Mobile View: Sidebar only */}
//       <div className="md:hidden h-screen w-full bg-white overflow-y-auto">
//         <div className="p-6 border-b">
//           <Image src="/image/logo_black.png" alt="STC Logo" width={120} height={40} />
//         </div>
//         <nav className="p-4 space-y-2">
//           {sidebarLinks.map(({ label, icon: Icon, href, badge }) => (
//             <Link
//               key={label}
//               href={href}
//               className="flex items-center justify-between px-4 py-2 rounded-lg text-gray-700 hover:bg-gray-100"
//             >
//               <div className="flex items-center gap-3">
//                 <Icon className="w-5 h-5" />
//                 {label}
//               </div>
//               {badge && (
//                 <span className="ml-auto w-2.5 h-2.5 bg-red-500 rounded-full"></span>
//               )}
//             </Link>
//           ))}
//         </nav>
//       </div>

//       {/* Desktop View */}
//       <div className="hidden md:flex h-screen">
//         {/* Sidebar */}
//         <aside className="w-64 bg-white border-r shadow-md flex flex-col justify-between">
//           <div>
//             <div className="p-6 border-b">
//               <Image src="/image/logo_black.png" alt="STC Logo" width={120} height={40} />
//             </div>
//             <nav className="p-4 space-y-2">
//               {sidebarLinks.map(({ label, icon: Icon, href, badge }) => (
//                 <Link
//                   key={label}
//                   href={href}
//                   className={`flex items-center justify-between px-4 py-2 rounded-lg transition-transform duration-200 ${
//                     pathname === href
//                       ? "bg-blue-100 text-blue-600 font-medium -translate-x-1"
//                       : "text-gray-700 hover:bg-gray-100"
//                   }`}
//                 >
//                   <div className="flex items-center gap-3">
//                     <Icon className="w-5 h-5" />
//                     {label}
//                   </div>
//                   {badge && (
//                     <span className="ml-auto w-2.5 h-2.5 bg-red-500 rounded-full"></span>
//                   )}
//                 </Link>
//               ))}
//             </nav>
//           </div>

//           <div className="p-4 border-t">
//             <Link
//               href="#"
//               className="flex items-center gap-3 text-gray-600 hover:text-red-600"
//             >
//               <LogOut className="w-5 h-5" />
//               Logout
//             </Link>
//           </div>
//         </aside>

//         {/* Main content */}
//         <div className="flex-1 flex flex-col">
//           {/* Topbar */}
//           <header className="h-16 bg-white shadow-sm px-6 flex items-center justify-between">
//             {/* SearchBar */}
//             <div className="relative w-full max-w-xs">
//               <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
//               <input
//                 type="text"
//                 placeholder="Search..."
//                 className="w-full pl-10 pr-4 py-1.5 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400 text-sm"
//               />
//             </div>

//             {/* Icons */}
//             <div className="flex items-center gap-2">
//               {[{ icon: Bell, label: "Notifications" }, { icon: UserRound, label: "Contact" }].map(
//                 ({ icon: Icon, label }, i) => (
//                   <div
//                     key={i}
//                     className="group relative p-2 rounded-full hover:bg-gray-100 cursor-pointer transition"
//                   >
//                     <Icon className="w-5 h-5 text-gray-600" />
//                     <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 text-xs text-white bg-gray-700 px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition pointer-events-none">
//                       {label}
//                     </div>
//                   </div>
//                 )
//               )}
//               <Image
//                 src="/avatar.png"
//                 alt="Avatar"
//                 width={32}
//                 height={32}
//                 className="rounded-full cursor-pointer"
//               />
//             </div>
//           </header>

//           <main className="flex-1 overflow-y-auto p-6">{children}</main>
//         </div>
//       </div>
//     </>
//   );
// }
