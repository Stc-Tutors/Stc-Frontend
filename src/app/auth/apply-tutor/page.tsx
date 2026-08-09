import ApplyTutorForm from "@/components/forms/apply-tutor-form";
import AuthCardLayout from "@/components/layout/auth-layout";

export default async function ApplyTutorPage() {
  return (
    <AuthCardLayout
      title="Apply to Tutor"
      subtitle="Tell us about your experience. Our team reviews every application."
    >
      <ApplyTutorForm />
    </AuthCardLayout>
  );
}
