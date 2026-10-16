import type { ComponentType, CSSProperties } from "react";
import {
  FaAward,
  FaBehance,
  FaBell,
  FaBookOpen,
  FaBrain,
  FaBriefcase,
  FaBullhorn,
  FaBullseye,
  FaCalculator,
  FaCalendarAlt,
  FaCertificate,
  FaChalkboardTeacher,
  FaChartLine,
  FaCheckCircle,
  FaClock,
  FaCode,
  FaCommentDots,
  FaEnvelope,
  FaEye,
  FaFacebook,
  FaGithub,
  FaGlobe,
  FaGlobeAfrica,
  FaGraduationCap,
  FaHandshake,
  FaHeadset,
  FaHeart,
  FaInstagram,
  FaLanguage,
  FaLaptop,
  FaLightbulb,
  FaLinkedin,
  FaLock,
  FaMapMarkerAlt,
  FaMedal,
  FaMicroscope,
  FaMobileAlt,
  FaMusic,
  FaPalette,
  FaPencilAlt,
  FaPhone,
  FaPinterest,
  FaQuestionCircle,
  FaRocket,
  FaSeedling,
  FaShieldAlt,
  FaSnapchat,
  FaStar,
  FaTelegram,
  FaThumbsUp,
  FaTiktok,
  FaTrophy,
  FaTwitter,
  FaUserGraduate,
  FaUsers,
  FaVideo,
  FaWallet,
  FaWhatsapp,
  FaYoutube,
} from "react-icons/fa";
import { FaXTwitter } from "react-icons/fa6";

type IconComponent = ComponentType<{ size?: number | string; className?: string; style?: CSSProperties }>;

export interface SiteIconEntry {
  label: string;
  Icon: IconComponent;
  group: "Social" | "Contact" | "General";
}

// The icons an admin can choose from in Site Content. The id is what gets stored, so never rename one that may already be saved.
// Mirrored in Stc-SuperAdmin's src/lib/site-icon.tsx (the picker shows these) - keep both lists identical.
export const SITE_ICONS: Record<string, SiteIconEntry> = {
  facebook: { label: "Facebook", Icon: FaFacebook, group: "Social" },
  instagram: { label: "Instagram", Icon: FaInstagram, group: "Social" },
  linkedin: { label: "LinkedIn", Icon: FaLinkedin, group: "Social" },
  twitter: { label: "Twitter", Icon: FaTwitter, group: "Social" },
  x: { label: "X", Icon: FaXTwitter, group: "Social" },
  tiktok: { label: "TikTok", Icon: FaTiktok, group: "Social" },
  youtube: { label: "YouTube", Icon: FaYoutube, group: "Social" },
  whatsapp: { label: "WhatsApp", Icon: FaWhatsapp, group: "Social" },
  telegram: { label: "Telegram", Icon: FaTelegram, group: "Social" },
  snapchat: { label: "Snapchat", Icon: FaSnapchat, group: "Social" },
  pinterest: { label: "Pinterest", Icon: FaPinterest, group: "Social" },
  github: { label: "GitHub", Icon: FaGithub, group: "Social" },
  behance: { label: "Behance", Icon: FaBehance, group: "Social" },
  globe: { label: "Website", Icon: FaGlobe, group: "Contact" },
  email: { label: "Email", Icon: FaEnvelope, group: "Contact" },
  phone: { label: "Phone", Icon: FaPhone, group: "Contact" },
  mobile: { label: "Mobile", Icon: FaMobileAlt, group: "Contact" },
  location: { label: "Location", Icon: FaMapMarkerAlt, group: "Contact" },
  support: { label: "Support", Icon: FaHeadset, group: "Contact" },
  chat: { label: "Chat", Icon: FaCommentDots, group: "Contact" },
  graduation: { label: "Graduation cap", Icon: FaGraduationCap, group: "General" },
  student: { label: "Student", Icon: FaUserGraduate, group: "General" },
  teacher: { label: "Teacher", Icon: FaChalkboardTeacher, group: "General" },
  book: { label: "Book", Icon: FaBookOpen, group: "General" },
  pencil: { label: "Pencil", Icon: FaPencilAlt, group: "General" },
  users: { label: "People", Icon: FaUsers, group: "General" },
  target: { label: "Target", Icon: FaBullseye, group: "General" },
  vision: { label: "Vision", Icon: FaEye, group: "General" },
  heart: { label: "Heart", Icon: FaHeart, group: "General" },
  idea: { label: "Idea", Icon: FaLightbulb, group: "General" },
  star: { label: "Star", Icon: FaStar, group: "General" },
  award: { label: "Award", Icon: FaAward, group: "General" },
  medal: { label: "Medal", Icon: FaMedal, group: "General" },
  trophy: { label: "Trophy", Icon: FaTrophy, group: "General" },
  certificate: { label: "Certificate", Icon: FaCertificate, group: "General" },
  shield: { label: "Safe & secure", Icon: FaShieldAlt, group: "General" },
  lock: { label: "Privacy", Icon: FaLock, group: "General" },
  clock: { label: "Time", Icon: FaClock, group: "General" },
  calendar: { label: "Calendar", Icon: FaCalendarAlt, group: "General" },
  laptop: { label: "Laptop", Icon: FaLaptop, group: "General" },
  video: { label: "Video", Icon: FaVideo, group: "General" },
  code: { label: "Code", Icon: FaCode, group: "General" },
  handshake: { label: "Partnership", Icon: FaHandshake, group: "General" },
  rocket: { label: "Rocket", Icon: FaRocket, group: "General" },
  brain: { label: "Brain", Icon: FaBrain, group: "General" },
  growth: { label: "Growth", Icon: FaSeedling, group: "General" },
  chart: { label: "Progress", Icon: FaChartLine, group: "General" },
  check: { label: "Check", Icon: FaCheckCircle, group: "General" },
  thumbsup: { label: "Thumbs up", Icon: FaThumbsUp, group: "General" },
  briefcase: { label: "Career", Icon: FaBriefcase, group: "General" },
  music: { label: "Music", Icon: FaMusic, group: "General" },
  art: { label: "Art", Icon: FaPalette, group: "General" },
  language: { label: "Language", Icon: FaLanguage, group: "General" },
  world: { label: "World", Icon: FaGlobeAfrica, group: "General" },
  science: { label: "Science", Icon: FaMicroscope, group: "General" },
  maths: { label: "Maths", Icon: FaCalculator, group: "General" },
  announce: { label: "Announcement", Icon: FaBullhorn, group: "General" },
  bell: { label: "Notification", Icon: FaBell, group: "General" },
  wallet: { label: "Payments", Icon: FaWallet, group: "General" },
  question: { label: "Help", Icon: FaQuestionCircle, group: "General" },
};

const IMAGE_VALUE = /^(https?:\/\/|\/)/i;
// A bare word like "snapchat" is an icon NAME, not an emoji - if it isn't in the list we show the fallback instead of printing the word.
const LOOKS_LIKE_NAME = /^[a-z0-9 _-]+$/i;

// Renders whatever an admin picked for an icon: one of the SITE_ICONS ids, a picture (uploaded or linked), or an emoji / short text.
// Pass `fallback` (an icon id) for when nothing usable was chosen, e.g. a social link whose platform has no icon of its own.
export function SiteIcon({ value, size = 20, className, fallback }: { value?: string | null; size?: number; className?: string; fallback?: string }) {
  const v = (value ?? "").trim();
  const entry = v ? SITE_ICONS[v.toLowerCase()] : undefined;
  if (entry) return <entry.Icon size={size} className={className} />;
  if (v && IMAGE_VALUE.test(v)) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={v} alt="" className={className} style={{ width: size, height: size, objectFit: "contain" }} />;
  }
  if (v && !LOOKS_LIKE_NAME.test(v)) return <span className={className} style={{ fontSize: size, lineHeight: 1 }}>{v}</span>;
  const fb = fallback ? SITE_ICONS[fallback] : undefined;
  return fb ? <fb.Icon size={size} className={className} /> : null;
}
