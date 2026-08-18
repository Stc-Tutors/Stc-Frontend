"use client";
import { Mail, Phone, MapPin, Clock } from "lucide-react";
import { motion } from "framer-motion";
import { useState } from "react";
import { FaWhatsapp, FaInstagram, FaFacebook, FaLinkedin, FaTiktok, FaGlobe } from "react-icons/fa";
import { usePageSection } from "@/hooks/use-page-section";
import { ContactInfoContent, PageSectionKey } from "@/types/content";

const DEFAULT_CONTACT: ContactInfoContent = {
  phone: "+234 706 055 4954",
  email: "stc.consult24@gmail.com",
  socialLinks: [
    { platform: "WhatsApp", url: "https://wa.me/2347089118528" },
    { platform: "Instagram", url: "https://instagram.com/stc.consult01" },
    { platform: "Facebook", url: "https://web.facebook.com/stc.consult01/" },
    { platform: "LinkedIn", url: "https://linkedin.com/company/yourcompany" },
    { platform: "TikTok", url: "https://www.tiktok.com/@stc.consult01" },
  ],
};

const SOCIAL_ICON: Record<string, typeof FaGlobe> = {
  whatsapp: FaWhatsapp,
  instagram: FaInstagram,
  facebook: FaFacebook,
  linkedin: FaLinkedin,
  tiktok: FaTiktok,
};

const Contact = () => {
  const content = usePageSection(PageSectionKey.CONTACT_INFO, DEFAULT_CONTACT);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: "" });
  };

  const validate = () => {
    const newErrors: { [key: string]: string } = {};
    if (!formData.name) newErrors.name = "Name is required";
    if (!formData.email || !/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = "Valid email is required";
    if (!formData.message) newErrors.message = "Message is required";
    return newErrors;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setSubmitted(true);
    setFormData({ name: "", email: "", subject: "", message: "" });

    // Optional: send to backend/API
  };

  return (
    <section className="bg-white py-20 px-6 md:px-12 lg:px-20">
      <div className="max-w-7xl mx-auto">
        <motion.h2
          className="text-4xl font-bold text-center text-gray-900 mb-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          Contact Us
        </motion.h2>

        <motion.p
          className="text-center text-gray-600 max-w-xl mx-auto mb-12"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          Have a question or need help? We'd love to hear from you.
        </motion.p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          {/* Left: Info */}
          <motion.div
            className="space-y-6"
            initial={{ opacity: 0, x: -40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="flex items-center gap-4">
              <Phone className="text-[#38b6ff]" />
              <span className="text-gray-700">{content.phone}</span>
            </div>
            <div className="flex items-center gap-4">
              <Mail className="text-[#38b6ff]" />
              <span className="text-gray-700">{content.email}</span>
            </div>
            {content.address && (
              <div className="flex items-center gap-4">
                <MapPin className="text-[#38b6ff]" />
                <span className="text-gray-700">{content.address}</span>
              </div>
            )}
            {content.hours && (
              <div className="flex items-center gap-4">
                <Clock className="text-[#38b6ff]" />
                <span className="text-gray-700">{content.hours}</span>
              </div>
            )}

             {/* Social Links */}
      <div className="flex gap-4 mt-6">
        {content.socialLinks.map((social) => {
          const Icon = SOCIAL_ICON[social.platform.toLowerCase()] ?? FaGlobe;
          return (
            <motion.a
              key={social.platform + social.url}
              href={social.url}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={social.platform}
              className="text-[#38b6ff] hover:text-indigo-800 transition-colors p-2 rounded-full hover:bg-indigo-50"
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.95 }}
            >
              <Icon size={20} />
            </motion.a>
          );
        })}
      </div>
          </motion.div>

          {/* Right: Form */}
          <motion.form
            onSubmit={handleSubmit}
            className="space-y-4 bg-gray-50 p-6 rounded-xl shadow-lg"
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div>
              <input
                type="text"
                name="name"
                placeholder="Your Name"
                value={formData.name}
                onChange={handleChange}
                className={`w-full p-3 border rounded-md ${
                  errors.name ? "border-red-500" : "border-gray-300"
                }`}
              />
              {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
            </div>
            <div>
              <input
                type="email"
                name="email"
                placeholder="Your Email"
                value={formData.email}
                onChange={handleChange}
                className={`w-full p-3 border rounded-md ${
                  errors.email ? "border-red-500" : "border-gray-300"
                }`}
              />
              {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
            </div>
            <input
              type="text"
              name="subject"
              placeholder="Subject (Optional)"
              value={formData.subject}
              onChange={handleChange}
              className="w-full p-3 border border-gray-300 rounded-md"
            />
            <div>
              <textarea
                name="message"
                placeholder="Your Message"
                value={formData.message}
                onChange={handleChange}
                className={`w-full p-3 border rounded-md h-32 ${
                  errors.message ? "border-red-500" : "border-gray-300"
                }`}
              />
              {errors.message && <p className="text-red-500 text-sm mt-1">{errors.message}</p>}
            </div>
            <button
              type="submit"
              className="bg-[#38b6ff] text-white px-6 py-3 rounded-md hover:bg-indigo-700 transition"
            >
              Send Message
            </button>
            {submitted && (
              <p className="text-green-600 mt-3 text-sm">
                Message sent! We'll get back to you soon.
              </p>
            )}
          </motion.form>
        </div>
      </div>
    </section>
  );
};

export default Contact;
