import ForgotPasswordForm from "@/components/forms/forgot-password-form";
import AuthCardLayout from "@/components/layout/auth-layout";

export default async function ForgotPasswordPage() {
    return (
        <AuthCardLayout title="Forgot Password" subtitle="Enter your email address to reset your password" >
            <ForgotPasswordForm />
        </AuthCardLayout>
    );
}