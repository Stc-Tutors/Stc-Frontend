import { UserRole } from "@/types/user";

export interface TourStep {
  // CSS selector for the sidebar/topbar element to spotlight. Omitted for the
  // opening/closing cards, which are centered instead of pointing at anything.
  // A step whose target isn't in the DOM (hidden by a permission, or a child
  // login with a trimmed-down sidebar) is skipped automatically - see
  // OnboardingTour's step resolution.
  target?: string;
  title: string;
  content: string;
  placement?: "top" | "bottom" | "left" | "right";
}

const STUDENT_STEPS: TourStep[] = [
  {
    title: "Welcome to STC Tutors!",
    content: "Here's a 60-second look around your dashboard so you know exactly where everything lives.",
  },
  { target: "tour-dashboard", title: "Dashboard", content: "Your home base - a snapshot of upcoming sessions, progress and announcements.", placement: "right" },
  { target: "tour-schedule", title: "Schedule", content: "See every upcoming class here, and request a reschedule if something comes up.", placement: "right" },
  { target: "tour-classroom", title: "Classroom", content: "When it's time for a session, join your live class from here.", placement: "right" },
  { target: "tour-assignments", title: "Assignments", content: "Track and submit the assignments your tutor sets for you.", placement: "right" },
  { target: "tour-messages", title: "Messages", content: "Message your tutor or the support team directly, any time.", placement: "right" },
  { target: "tour-wallet", title: "Wallet", content: "Top up your wallet and keep an eye on your balance and referral earnings.", placement: "right" },
  { target: "tour-profile", title: "Profile", content: "Keep your details and photo up to date here.", placement: "right" },
  { target: "tour-notifications", title: "Notifications", content: "The bell keeps you posted on anything that needs your attention.", placement: "left" },
  {
    title: "You're all set!",
    content: "That's the tour - everything else is one click away in the sidebar. Enjoy learning!",
  },
];

const TUTOR_STEPS: TourStep[] = [
  {
    title: "Welcome to STC Tutors!",
    content: "Here's a 60-second look around your dashboard so you know exactly where everything lives.",
  },
  { target: "tour-dashboard", title: "Dashboard", content: "Your home base - a snapshot of today's sessions and what needs your attention.", placement: "right" },
  { target: "tour-schedule", title: "Schedule", content: "See every upcoming class here, and handle reschedule requests.", placement: "right" },
  { target: "tour-pending-assignments", title: "Pending Assignments", content: "New student assignments waiting on you show up here.", placement: "right" },
  { target: "tour-classroom", title: "Classroom", content: "Join your live classes from here when it's time to teach.", placement: "right" },
  { target: "tour-hours", title: "My Hours", content: "Track your verified teaching hours here.", placement: "right" },
  { target: "tour-messages", title: "Messages", content: "Message students, parents or support directly.", placement: "right" },
  { target: "tour-account", title: "Your Account", content: "Manage your profile and account details here.", placement: "right" },
  { target: "tour-notifications", title: "Notifications", content: "The bell keeps you posted on anything that needs your attention.", placement: "left" },
  {
    title: "You're all set!",
    content: "That's the tour - everything else is one click away in the sidebar. Happy teaching!",
  },
];

const PARENT_STEPS: TourStep[] = [
  {
    title: "Welcome to STC Tutors!",
    content: "Here's a 60-second look around your dashboard so you know exactly where everything lives.",
  },
  { target: "tour-dashboard", title: "Dashboard", content: "Your home base - a snapshot of your children's sessions and progress.", placement: "right" },
  { target: "tour-enrollment", title: "Enrollment", content: "Register a child for a new subject or service from here.", placement: "right" },
  { target: "tour-tutors", title: "Tutors", content: "Browse and manage the tutors assigned to your children.", placement: "right" },
  { target: "tour-schedule", title: "Schedule", content: "See every upcoming class here, and request a reschedule if you need to.", placement: "right" },
  { target: "tour-child-switcher", title: "Switch Child", content: "Have more than one child? Switch between their accounts here.", placement: "bottom" },
  { target: "tour-wallet", title: "Wallet", content: "Top up your wallet and keep an eye on your balance and referral earnings.", placement: "right" },
  { target: "tour-messages", title: "Messages", content: "Message a tutor or the support team directly, any time.", placement: "right" },
  { target: "tour-notifications", title: "Notifications", content: "The bell keeps you posted on anything that needs your attention.", placement: "left" },
  {
    title: "You're all set!",
    content: "That's the tour - everything else is one click away in the sidebar. Enjoy!",
  },
];

const ADMIN_STEPS: TourStep[] = [
  {
    title: "Welcome to the Admin Console!",
    content: "Here's a 60-second look around, based on what you have access to. Some steps below only show up if you're granted that area.",
  },
  { target: "tour-dashboard", title: "Dashboard", content: "Your home base - a snapshot of what's happening across the platform.", placement: "right" },
  { target: "tour-students", title: "Students", content: "Manage student records and enrollments from here.", placement: "right" },
  { target: "tour-enrollments", title: "Enrollments", content: "Review and manage registration/enrollment requests here.", placement: "right" },
  { target: "tour-finance", title: "Finance", content: "Payments, payouts and the referral ledger live here.", placement: "right" },
  { target: "tour-reports", title: "Reports", content: "Operational and revenue reporting for the platform.", placement: "right" },
  { target: "tour-profile", title: "Profile", content: "Manage your own account details here.", placement: "right" },
  { target: "tour-notifications", title: "Notifications", content: "The bell keeps you posted on anything that needs your attention.", placement: "left" },
  {
    title: "You're all set!",
    content: "That's the tour - everything else is one click away in the sidebar.",
  },
];

export function getTourSteps(role: UserRole | undefined): TourStep[] {
  switch (role) {
    case UserRole.STUDENT:
      return STUDENT_STEPS;
    case UserRole.TUTOR:
      return TUTOR_STEPS;
    case UserRole.PARENT:
      return PARENT_STEPS;
    case UserRole.HOD:
    case UserRole.STC_ADMIN:
    case UserRole.TUTOR_ADMIN:
    case UserRole.SUPER_ADMIN:
    case UserRole.ALMIGHTY_ADMIN:
      return ADMIN_STEPS;
    default:
      return [];
  }
}
