import ResetPasswordForm from "@/components/forms/reset-password-form";
import AuthCardLayout from "@/components/layout/auth-layout";

export default async function ForgotPasswordPage() {
    return (
        <AuthCardLayout title="Reset Password" subtitle="Enter the token sent to your mail and your new password" >
            <ResetPasswordForm />
        </AuthCardLayout>
    );
}