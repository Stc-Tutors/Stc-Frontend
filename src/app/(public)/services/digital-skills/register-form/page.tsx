export default function RegisterFormPage() {
  return (
    <div className="container mx-auto px-6 py-10">
      <h1 className="text-2xl font-bold text-center mb-6">
        Enroll in Digital Skills Training
      </h1>

      <div className="w-full max-w-4xl mx-auto">
        <iframe
          src="https://docs.google.com/forms/d/e/1FAIpQLSeVT8PHj3bAWD_Wcony7JFiHeY4TeV1P7giBN_w9UZZZ5bl9A/viewform"
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