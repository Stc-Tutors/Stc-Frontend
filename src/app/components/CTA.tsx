"use client";
import Image from "next/image";
import { useState } from "react";
import { usePageSection } from "@/hooks/use-page-section";
import { SendContactMessageAction } from "@/server/contact";
import { CTAContent, PageSectionKey } from "@/types/content";

const DEFAULT_CTA: CTAContent = {
  imageUrl: "/image/happy.jpg",
  headline: "Unlock your potential with skilled instructors.",
  subtext: "Book a class with us today",
  overallGrade: "A+",
  grades: [
    { subject: "Maths", score: "94%" },
    { subject: "Physics", score: "92%" },
    { subject: "Chemistry", score: "96%" },
  ],
  namePlaceholder: "Enter your name",
  emailPlaceholder: "Enter your email address",
  subjectPlaceholder: "Subject (optional)",
  messagePlaceholder: "Enter your message",
  submitText: "Send Message",
  successText: "Thanks - your message has been sent. We'll get back to you soon.",
};

const CTA = () => {
  const content = usePageSection(PageSectionKey.CTA, DEFAULT_CTA);
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
  const [isSending, setIsSending] = useState(false);
  const [status, setStatus] = useState<{ ok: boolean; text: string } | null>(null);

  // This form used to have no submit handler at all - visitors filled it in and the message went nowhere. It now sends through
  // the same public contact endpoint as the Contact page (stored + delivered to the admins).
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSending(true);
    setStatus(null);
    const [, error] = await SendContactMessageAction({
      name: form.name,
      email: form.email,
      subject: form.subject || undefined,
      message: form.message,
    });
    setIsSending(false);
    if (error) {
      setStatus({ ok: false, text: error });
      return;
    }
    setForm({ name: "", email: "", subject: "", message: "" });
    setStatus({ ok: true, text: content.successText ?? DEFAULT_CTA.successText! });
  };

  return (
    <section className="py-16 px-8 bg-gray-100">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center gap-8">
        {/* Left Side: Image & Floating Elements */}
        <div className="relative flex-1">
          <Image
            src={content.imageUrl}
            alt="Student with Phone"
            width={500}
            height={500}
            className="w-full rounded-lg"
          />

          {/* Floating Trophy */}
          <div className="absolute top-10 left-[-10%] bg-white p-4 rounded-lg shadow-lg">
            🏆
          </div>

          {/* Floating Grade Card */}
          <div className="absolute bottom-5 left-[-10%] bg-white p-4 rounded-lg shadow-lg text-sm">
            {content.overallGrade && <p>{content.overallGrade}</p>}
            {content.grades.map((grade) => (
              <p key={grade.subject}>
                {grade.subject} - {grade.score}
              </p>
            ))}
          </div>
        </div>

        {/* Right Side: Contact Form */}
        <div className="flex-1 bg-white p-6 md:p-8 rounded-lg shadow-lg">
          <h2 className="text-2xl font-semibold text-[#38b6ff]">{content.headline}</h2>
          <p className="mt-2 mb-4">{content.subtext}</p>
          <form className="space-y-4" onSubmit={handleSubmit}>
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder={content.namePlaceholder}
              required
              className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              placeholder={content.emailPlaceholder}
              required
              className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
            <input
              type="text"
              name="subject"
              value={form.subject}
              onChange={(e) => setForm({ ...form, subject: e.target.value })}
              placeholder={content.subjectPlaceholder}
              className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
            <textarea
              name="message"
              value={form.message}
              onChange={(e) => setForm({ ...form, message: e.target.value })}
              placeholder={content.messagePlaceholder}
              rows={4}
              required
              className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
            ></textarea>
            <button
              type="submit"
              disabled={isSending}
              className="w-full bg-[#38b6ff] text-white py-3 rounded-md text-lg hover:bg-[#1c2574] transition disabled:opacity-60"
            >
              {isSending ? "Sending..." : content.submitText}
            </button>
            {status && <p className={`text-sm ${status.ok ? "text-green-600" : "text-red-600"}`}>{status.text}</p>}
          </form>
        </div>
      </div>
    </section>
  );
};

export default CTA;
