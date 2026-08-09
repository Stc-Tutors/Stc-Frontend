"use client";

import { useRouter } from "next/navigation";
import { useUser } from "@/contexts/user-context";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface RegisterCTAProps {
  serviceType: string;
  label?: string;
  className?: string;
  icon?: React.ReactNode;
}

// The one "Register"/"Enroll" entry point shared by every public service
// page, routing into the real enrollment + Paystack payment flow instead of
// the old disconnected Google Form iframes. A signed-in student/parent goes
// straight into the wizard with the service pre-selected; a logged-out
// visitor is sent to sign up first, carrying the chosen service through the
// register -> login -> dashboard hop via the `service` query param (see
// register-form.tsx and login-form.tsx).
export default function RegisterCTA({ serviceType, label = "Register Now", className, icon }: RegisterCTAProps) {
  const router = useRouter();
  const { user, isLoading } = useUser();

  const handleClick = () => {
    if (isLoading) return;
    router.push(
      user ? `/dashboard/enroll?service=${serviceType}` : `/auth/register?service=${serviceType}`
    );
  };

  return (
    <Button
      onClick={handleClick}
      disabled={isLoading}
      className={cn(
        "inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition h-auto",
        className
      )}
    >
      {icon}
      {label}
    </Button>
  );
}
