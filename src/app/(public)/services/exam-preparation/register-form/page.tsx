export default function RegisterFormPage() {
  return (
    <div className="container mx-auto px-6 py-10">
      <h1 className="text-2xl font-bold text-center mb-6">
        Enroll in Exam Preparation
      </h1>

      <div className="w-full max-w-4xl mx-auto">
        <iframe
          src="https://docs.google.com/forms/d/e/1FAIpQLScB_Z0v-NeEEQcEi_03EBspIWy0XFAV_5JpxCS9KfDokXqy-Q/viewform"
          width="100%"
          height="800"
          frameBorder="0"
          marginHeight={0}
          marginWidth={0}
        >
          Loading…
        </iframe>
      </div>
    </div>
  );
}