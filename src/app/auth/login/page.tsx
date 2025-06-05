import LoginForm from "@/components/forms/login-form";
import AuthCardLayout from "@/components/layout/auth-layout";

export default async function LoginPage() {
    return (
        <AuthCardLayout title="Login" >
            <LoginForm />
        </AuthCardLayout>
    );
}