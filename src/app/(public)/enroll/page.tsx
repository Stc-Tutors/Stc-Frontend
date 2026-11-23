import type { Metadata } from "next";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { GetUserAction } from "@/server/user";
import { GetMyStudentsAction } from "@/server/bootstrap";
import { EnrollmentStatus } from "@/types/student";
import { UserRole } from "@/types/user";
import { lmsDashboardPath } from "@/config/routes";
import EnrollStart, { type EnrollAccount } from "./EnrollStart";

export const metadata: Metadata = { title: "Enrol" };

// First-time enrolment on one stepped page: create the account, pick the
// service, the learner, subjects and times, then pay. Each step is saved as
// the family goes (the account at step 1, the enrolment as a draft from the
// learner step on). Email verification is still required - but only before
// the LMS opens, not before they can enrol and pay (see stcbe's
// AuthService.registerForEnrollment and unverified-lock.ts).
export default async function EnrollPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const one = (key: string) => (typeof params[key] === "string" ? (params[key] as string) : undefined);
  const service = one("service");
  const ref = one("ref");

  const token = (await cookies()).get("token")?.value;
  let account: EnrollAccount | null = null;

  if (token) {
    const [res] = await GetUserAction();
    const user = res?.data;
    if (user) {
      if (user.role !== UserRole.PARENT && user.role !== UserRole.STUDENT) redirect(lmsDashboardPath(user.role));
      // A verified family already has the full LMS - enrol from there.
      if (user.emailVerified !== false) redirect(service ? `/dashboard/enroll?service=${encodeURIComponent(service)}` : "/dashboard/enroll");

      // Signed up here earlier but hasn't verified yet: pick up where they left off instead of starting a second enrolment.
      if (!one("continue")) {
        const [students] = await GetMyStudentsAction();
        const open = (students ?? [])
          .filter((s) => s.enrollmentStatus === EnrollmentStatus.DRAFT || s.enrollmentStatus === EnrollmentStatus.PENDING)
          .sort((a, b) => String(b.createdAt ?? "").localeCompare(String(a.createdAt ?? "")))[0];
        if (open) redirect(`/enroll?continue=${open.id}&step=subjects`);
      }

      account = {
        role: user.role,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email ?? "",
        phone: user.phone ?? "",
        dateOfBirth: (user as { dateOfBirth?: string }).dateOfBirth ? String((user as { dateOfBirth?: string }).dateOfBirth).slice(0, 10) : "",
        termsAccepted: user.termsAccepted !== false,
      };
    }
  }

  return <EnrollStart initialAccount={account} service={service} referralCode={ref} />;
}
