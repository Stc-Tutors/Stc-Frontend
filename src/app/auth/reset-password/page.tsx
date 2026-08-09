import ResetPasswordForm from "@/components/forms/reset-password-form";
import AuthCardLayout from "@/components/layout/auth-layout";

export default async function ResetPasswordPage() {
    return (
        <AuthCardLayout title="Reset Password" subtitle="Enter your new password below" >
            <ResetPasswordForm />
        </AuthCardLayout>
    );
}
