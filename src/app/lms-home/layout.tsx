"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import "keen-slider/keen-slider.min.css";

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
} from "lucide-react";
import Image from "next/image";

// export const metadata = {
//   title: "STC Tutors LMS",
//   description: "Tutor & Student Portal",
// };

const sidebarLinks = [
  { label: "Dashboard", icon: Home, href: "/lms-home/student/overview" },
  { label: "Schedule", icon: Calendar, href: "/lms-home/student/scheduling" },
  { label: "Classroom", icon: Users, href: "#" },
  { label: "Messages", icon: MessageSquare, href: "#" },
  { label: "Assessment", icon: BookOpen, href: "/lms-home/student/assessment" },
  { label: "Analytics", icon: BarChart2, href: "/lms-home/student/analytics" },
  { label: "Courses", icon: NotebookPen, href: "/lms-home/student/courses" },
  { label: "Profile", icon: UserRound, href: "/lms-home/tutor/profile" },
  { label: "Support", icon: Headphones, href: "#" },
  { label: "Notifications", icon: Bell, href: "/lms-home/student/notification", badge: true },
];

export default function LMSLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen bg-gray-100 relative">
      {/* Sidebar */}
      <aside
        className={`fixed md:static top-0 left-0 h-full w-64 bg-white border-r shadow-md z-40 transform transition-transform duration-300 ease-in-out
        ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"} md:translate-x-0 md:flex flex-col justify-between`}
      >
        
          <div className="flex items-center justify-between p-4 border-b">
            <Image
              src="/image/logo_black.png"
              alt="STC Logo"
              width={120}
              height={40}
              className="object-contain"
            />

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
                            href="#"
                            className="flex items-center gap-3 text-gray-600 hover:text-[#38b6ff] hover:translate-x-3">
                                <Headphones className="w-5 h-5" />
                                Support
                                </Link>
                                
                                {/* Notifications */}
                                <Link
                                href="#"
                                className="flex items-center gap-3 text-gray-600 hover:text-[#38b6ff] hover:translate-x-3">
                                    <Bell className="w-5 h-5" />
                                    Notifications
                                    <span className="ml-auto w-2.5 h-2.5 bg-red-500 rounded-full"></span>
                                    </Link>
                                    
                                    {/* Logout */}
                                    <Link
                                    href="#"
                                    className="flex items-center gap-3 text-gray-600 hover:text-[#38b6ff] hover:translate-x-3">
                                        <LogOut className="w-5 h-5" />
                                        Logout
                                        </Link>
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
            {[
              { icon: Bell, label: "Notifications" },
              { icon: UserRound, label: "User" },
            ].map(({ icon: Icon, label }, i) => (
              <div
                key={i}
                className="group relative p-2 rounded-full hover:bg-gray-100 cursor-pointer transition"
              >
                <Icon className="w-5 h-5 text-gray-600" />

                {/* Tooltip */}
                <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 text-xs text-white bg-gray-700 px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition pointer-events-none">
                  {label}
                </div>
              </div>
            ))}

            <Image
              src="/image/testimonial3.jpg"
              alt="Avatar"
              width={32}
              height={32}
              className="rounded-full cursor-pointer"
            />
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
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
