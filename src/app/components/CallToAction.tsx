"use client";
import { useRouter } from "next/navigation";

const CallToAction = () => {
  const router = useRouter();

  return (
    <section className="py-10 px-4 mb-10">
      <div className="max-w-2xl mx-auto text-center bg-[#38b6ff] text-white rounded-xl p-8 shadow-lg">
        <h2 className="text-3xl font-bold mb-4">Ready to Join the STC Community?</h2>
        <p className="mb-6 text-lg">Take the first step toward quality virtual learning with vetted tutors.</p>
        <button
          onClick={() => router.push("/signup")}
          className="bg-white text-blue-900 font-semibold px-6 py-3 rounded shadow hover:bg-gray-200 transition"
        >
          Enroll Today
        </button>
      </div>
      </section>
  );
};

export default CallToAction;