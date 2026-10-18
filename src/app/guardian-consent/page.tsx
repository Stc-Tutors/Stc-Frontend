import { cookies } from "next/headers";
import GuardianConsentForm from "@/components/forms/guardian-consent-form";
import AuthCardLayout from "@/components/layout/auth-layout";

// The parent opens this from the email sent when a 16-17 year old signs up. It lives outside /auth on purpose: the proxy sends a
// signed-in visitor away from /auth pages, and the parent has to be signed in to confirm.
export default async function GuardianConsentPage({ searchParams }: { searchParams: Promise<{ token?: string }> }) {
  const { token } = await searchParams;
  const signedIn = !!(await cookies()).get("token")?.value;
  return (
    <AuthCardLayout title="Confirm a student account">
      <GuardianConsentForm token={token ?? ""} signedIn={signedIn} />
    </AuthCardLayout>
  );
}
