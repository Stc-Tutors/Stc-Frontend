import { usePathname } from "next/navigation";
import { UserProfileDropdown } from '@/components/user-profile-dropdown';
import { ROUTES } from '@/config/routes';
import SignupLogoHeader from '@/app/components/SignupLogo';
import Link from "next/link";

const navLinks = [
  { label: 'Dashboard', href: ROUTES.DASHBOARD.HOME },
  { label: 'Enrollments', href: ROUTES.DASHBOARD.ENROLLMENTS },
  { label: 'Payment History', href: ROUTES.DASHBOARD.PAYMENT_HISTORY },
];

const DashboardHeader = () => {
   const pathname = usePathname();

  const isActive = (href: string) => pathname === href;

  return (
    <header className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <SignupLogoHeader />

            <div className="hidden md:flex items-center space-x-4"> {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`relative no-underline transition-all text-nowrap duration-300 
                  ${isActive(link.href) ? 'text-gray-900 font-semibold after:w-full' : 'hover:text-gray-500 after:w-0'} 
                  after:absolute after:bottom-0 after:left-0 after:h-0.5 after:bg-gray-400 after:transition-[width] after:duration-300`}
              >
                {link.label}
              </Link>
            ))}</div>


            <UserProfileDropdown />
        </div>
      </div>
    </header>
  )
}

export default DashboardHeader