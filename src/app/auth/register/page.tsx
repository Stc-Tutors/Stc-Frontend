import RegisterForm from "@/components/forms/register-form";
import AuthCardLayout from "@/components/layout/auth-layout";

export default async function RegisterPage() {
    return (
        <AuthCardLayout title="Register" >
            <RegisterForm />
        </AuthCardLayout>
    );
}