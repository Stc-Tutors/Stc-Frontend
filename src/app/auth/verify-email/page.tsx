import VerifyEmailStatus from "@/components/forms/verify-email-status";
import AuthCardLayout from "@/components/layout/auth-layout";

export default async function VerifyEmailPage() {
    return (
        <AuthCardLayout title="Verify Email">
            <VerifyEmailStatus />
        </AuthCardLayout>
    );
}
