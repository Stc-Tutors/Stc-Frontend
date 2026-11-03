import RegisterForm from "@/components/forms/register-form";
import { IntakeGate } from "@/components/intake-closed";
import AuthCardLayout from "@/components/layout/auth-layout";

export default async function RegisterPage() {
    return (
        <AuthCardLayout title="Register" >
            <IntakeGate targets={["PARENT_SIGNUP", "STUDENT_SIGNUP"]} closedAll>
                <RegisterForm />
            </IntakeGate>
        </AuthCardLayout>
    );
}