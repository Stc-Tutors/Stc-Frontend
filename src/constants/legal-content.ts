import { DEFAULT_CONTACT } from "@/constants/default-contact";

// The wording of the Terms & Conditions and the Privacy Policy. One source, so the sign-in "Terms" gate, the public
// /terms page and the /privacy page can never disagree. If a Super Admin saves their own Terms in Site Content
// (key "terms-and-conditions"), that text takes precedence over TERMS_SECTIONS everywhere it is shown.

export const TERMS_CONTENT_KEY = "terms-and-conditions";
export const LEGAL_LAST_UPDATED = "22 September 2026";

export interface LegalSection {
  id: string;
  heading: string;
  paragraphs?: string[];
  items?: string[];
  closing?: string[];
}

const EMAIL = DEFAULT_CONTACT.emails[0];
const PHONE = DEFAULT_CONTACT.phones[0];

export const TERMS_INTRO =
  "These Terms explain the rules for using STC Tutors, what you can expect from us, and what we expect from you. Please read them carefully.";

export const TERMS_SECTIONS: LegalSection[] = [
  {
    id: "about",
    heading: "1. About these Terms",
    paragraphs: [
      'These Terms & Conditions (the "Terms") govern your use of the STC Tutors website and learning platform (the "Platform"). The Platform is operated by STC Edu Consult, an education initiative of Statcomm TC Limited ("STC", "we" or "us").',
      "By creating an account, enrolling a child or student, applying to teach, or otherwise using the Platform, you agree to these Terms and to our Privacy Policy. If you do not agree, please do not use the Platform.",
      "If you register a child, you accept these Terms on the child's behalf and are responsible for their use of the Platform.",
    ],
  },
  {
    id: "accounts",
    heading: "2. Accounts",
    items: [
      "You must be at least 18 years old to open a parent, tutor or adult-learner account. A child under 18 can use the Platform only through a login created and supervised by a parent or guardian.",
      "The information you give us must be true, complete and kept up to date. We may ask you to verify it.",
      "Keep your password confidential. You are responsible for everything done through your account, and you must tell us straight away if you think someone else has used it.",
      "One person, one account. Do not share a login or create duplicate accounts.",
    ],
  },
  {
    id: "service",
    heading: "3. What STC provides",
    paragraphs: [
      "STC Tutors is an online platform that connects students and their parents with vetted tutors for live, online lessons, and provides the tools to enrol, schedule, attend, pay for and review those lessons. Our services include academic tutoring, exam preparation, technology training, digital and soft skills, career coaching, language and culture, music and adult education.",
      "We review and approve tutors, class schedules and tutor allocations, so a requested schedule or tutor is not confirmed until we (or the relevant Head of Department) have approved it and you have been told.",
      "We work to make lessons effective, but learning outcomes depend on many factors and we cannot promise particular results, grades or exam success.",
    ],
  },
  {
    id: "parents-students",
    heading: "4. Parents, guardians and students",
    items: [
      "A parent or guardian is responsible for supervising a child during lessons and for the child's behaviour on the Platform.",
      "Parents should make sure a child has a suitable device, a reliable connection and a quiet place to learn, and should be reachable during the child's lessons where appropriate.",
      "Children's logins are for the child's own learning. Payments, wallet top-ups, referral earnings and subscription changes are handled by the parent from their own account.",
      "Students and parents must be honest about the child's level, needs and availability so that we can match the right tutor.",
    ],
  },
  {
    id: "tutors",
    heading: "5. Tutors",
    paragraphs: [
      "Tutors apply through our application and vetting process, which can include identity and qualification checks, references and a vetting questionnaire. We may approve, reject or withdraw approval at our discretion, and approval to join is not a guarantee of any number of lessons or students.",
      "Unless we agree otherwise in writing, tutors work with us as independent contractors, not employees.",
      "As a tutor you agree to:",
    ],
    items: [
      "keep your profile, qualifications, availability and payout details accurate (some profile changes need our approval before they go live);",
      "start and end lessons on time, prepare properly, and follow the class schedule agreed on the Platform;",
      "treat students and parents with respect and put student safety and wellbeing first;",
      "keep all communication with students and parents on the Platform, and not arrange lessons or take payment outside it for students you met through STC;",
      "protect students' personal information and use it only to deliver their lessons; and",
      "give as much notice as possible if you must change or cancel a lesson.",
    ],
  },
  {
    id: "scheduling",
    heading: "6. Booking, rescheduling and cancellation",
    paragraphs: [
      "Lessons are booked against a weekly schedule that we approve. To reschedule or cancel a lesson you must give at least 24 hours' notice through the Platform.",
      "A lesson cancelled or changed with less than 24 hours' notice, or missed without notice, may be counted as delivered, and a late-notice surcharge may apply to tutors who reschedule at short notice. A reschedule proposed by a tutor must be confirmed by the parent or student and approved by us before it takes effect.",
      "If a lesson does not take place because of a fault on our side or the tutor's, we will arrange a replacement or correct the charge.",
    ],
  },
  {
    id: "payments",
    heading: "7. Fees, payments and your wallet",
    items: [
      "Prices are shown on the Platform in the currency stated. A course or service is sold at the price shown at checkout, including any coupon or discount that applies to you.",
      "Card and bank payments are processed by our payment provider, Paystack. We do not store your full card details.",
      "Money you add to your wallet can be used to pay for lessons and services on the Platform. A top-up is credited once the payment provider confirms it.",
      "If you think you have been charged incorrectly, or a paid lesson did not take place, contact us promptly. We will look into it and, where the error is ours, correct the charge or credit your wallet. We do not refund lessons that were delivered.",
      "We may suspend access to lessons while a payment is overdue.",
    ],
  },
  {
    id: "referrals",
    heading: "8. Referral programme",
    paragraphs: [
      "You can share your personal referral link. When someone you referred makes their first payment, you may earn a commission at the percentage shown in your Refer & Earn page. Commission is held until it has cleared our checks and can then be withdrawn following our approval process.",
      "We can change the commission rate at any time for future referrals. We may withhold or reverse commission that arises from self-referral, false or duplicate accounts, refunded payments, or any other misuse of the programme.",
    ],
  },
  {
    id: "payouts",
    heading: "9. Tutor earnings and payouts",
    paragraphs: [
      "Tutors are paid the agreed rate or revenue share for lessons they complete, less any deductions described on the Platform (for example late-notice surcharges). Earnings are calculated from lessons recorded as completed on the Platform.",
      "A withdrawal request is reviewed and approved by us before it is paid to the bank account or payout method you have provided, so it is important that those details are correct. We are not responsible for a payment sent to details you supplied in error.",
      "Tutors are responsible for any tax that applies to what they earn.",
    ],
  },
  {
    id: "conduct",
    heading: "10. Behaviour and safety",
    paragraphs: ["Everyone using the Platform must:"],
    items: [
      "be respectful - no harassment, bullying, discrimination, threats or abusive language;",
      "never share, request or display sexual, violent or otherwise inappropriate content, or anything unlawful;",
      "not record, screenshot or share a lesson or another person's images or information without the consent of everyone involved;",
      "not try to gain access to accounts, data or parts of the Platform that are not theirs, interfere with its operation, or copy it by automated means; and",
      "not use the Platform to promote other services or to collect personal details from other users.",
    ],
    closing: [
      "If something worries you - a safeguarding concern, a complaint, or behaviour that breaks these rules - please use the Complaints / Support section of your account or contact us directly. We take child-safety reports seriously and may act immediately, including suspending accounts and informing the relevant authorities.",
    ],
  },
  {
    id: "content",
    heading: "11. Content and intellectual property",
    paragraphs: [
      "The Platform, its design, software and the learning materials we provide belong to STC or our licensors and are protected by law. You may use them only for your own learning or teaching on the Platform, and may not copy, sell or distribute them.",
      "You keep ownership of content you upload (such as a profile photo, documents or assignment work). You give us a non-exclusive licence to store, display and process it as needed to run the Platform and to provide the services to you.",
      "Materials a tutor creates and uploads to the Platform for STC students may be used by STC for the students it serves, unless we agree otherwise in writing.",
    ],
  },
  {
    id: "communications",
    heading: "12. Messages and communications",
    paragraphs: [
      "You agree that we may send you service messages by email, SMS and in-app notification - for example lesson reminders, payment receipts, schedule approvals and account security alerts.",
      "Messages sent through the Platform may be reviewed by authorised STC staff to keep students safe, to handle complaints and to maintain quality. Contact details of students, parents and tutors are limited to what each person needs to see.",
    ],
  },
  {
    id: "suspension",
    heading: "13. Suspension and ending your account",
    paragraphs: [
      "You can stop using the Platform at any time and can ask us to delete your account (see our Privacy Policy for what that involves).",
      "We may suspend or close an account, with or without notice, if we reasonably believe these Terms have been broken, that someone's safety is at risk, that information given to us is false, or that we are required to by law. Money that is properly due to you will still be paid or credited in line with these Terms.",
    ],
  },
  {
    id: "liability",
    heading: "14. Disclaimers and limits of liability",
    paragraphs: [
      'The Platform is provided "as is" and "as available". We do not promise it will be uninterrupted or error-free, and lessons can be affected by things outside our control such as internet or power outages.',
      "Tutors are responsible for the quality of the teaching they give. To the fullest extent the law allows, STC is not liable for indirect or consequential loss, or for loss of profit, opportunity or data, and our total liability to you for any claim is limited to the fees you paid to us for the lessons the claim relates to.",
      "Nothing in these Terms limits any liability that cannot lawfully be limited, including for fraud or for death or personal injury caused by negligence.",
    ],
  },
  {
    id: "changes",
    heading: "15. Changes to these Terms",
    paragraphs: [
      "We may update these Terms from time to time. When we make a material change we will ask you to read and accept the new version the next time you sign in. If you keep using the Platform after a change takes effect, you are treated as having accepted it.",
    ],
  },
  {
    id: "law",
    heading: "16. Governing law and disputes",
    paragraphs: [
      "These Terms are governed by the laws of the Federal Republic of Nigeria. If you have a complaint, please contact us first so we can try to resolve it informally. If we cannot, the courts of Nigeria have jurisdiction, without affecting any mandatory consumer rights you have where you live.",
    ],
  },
  {
    id: "contact",
    heading: "17. Contact us",
    paragraphs: [`Questions about these Terms? Email ${EMAIL} or call ${PHONE}, or use the form on our Contact page.`],
  },
];

export const PRIVACY_INTRO =
  "This policy explains what personal information STC Tutors collects, why we collect it, who we share it with, and the choices and rights you have. We take particular care with children's information.";

export const PRIVACY_SECTIONS: LegalSection[] = [
  {
    id: "who-we-are",
    heading: "1. Who we are",
    paragraphs: [
      'STC Tutors is operated by STC Edu Consult, an education initiative of Statcomm TC Limited ("STC", "we" or "us"). We are the data controller for the personal information described in this policy.',
      "This policy applies to the STC Tutors website and learning platform (the \"Platform\") and is written to meet the requirements of the Nigeria Data Protection Act 2023 and, where it applies to you, similar data-protection laws in the country where you live.",
    ],
  },
  {
    id: "what-we-collect",
    heading: "2. Information we collect",
    paragraphs: ["What we collect depends on how you use the Platform."],
    items: [
      "Account details - name, email address, phone number, and a password (stored only in scrambled, hashed form).",
      "Parents and students - for each child or learner: name, date of birth, gender, country and language, grade or level, subjects and learning goals, school or curriculum details, and an optional profile photo. Parents also give us their own contact details.",
      "Tutors - profile and biography, qualifications, education and teaching history, certifications, availability, teaching setup (devices and internet), references, vetting questionnaire answers, and identity and supporting documents such as a government ID and CV. We also hold the bank or payout details tutors give us so we can pay them.",
      "Lessons and learning - schedules, attendance and clock-in records, assignments, assessments, feedback and reports, and lesson links.",
      "Payments - what was paid, when, and for what, wallet balances and transactions, subscriptions, referral earnings and payout requests. Card details are entered with, and held by, our payment provider - we do not store full card numbers.",
      "Messages and support - messages sent through the Platform, complaints, and anything you send us through the Contact form.",
      "Technical information - your IP address, device and browser type, and diagnostic logs, collected to keep the Platform secure and working.",
    ],
  },
  {
    id: "how-we-use",
    heading: "3. How we use your information",
    items: [
      "to create and run your account and provide the tutoring service - matching students with suitable tutors, scheduling, delivering and recording lessons;",
      "to vet tutors and to keep children and other users safe;",
      "to process payments, wallet top-ups, subscriptions, referral commission and tutor payouts;",
      "to send service messages such as lesson reminders, receipts, approvals and security alerts;",
      "to handle support requests and complaints and to review the quality of lessons;",
      "to understand how the Platform is used so we can fix problems and improve it, using aggregated reports wherever possible; and",
      "to meet our legal, accounting and regulatory obligations and to prevent fraud and misuse.",
    ],
    closing: ["We do not sell your personal information, and we do not use it to show third-party advertising."],
  },
  {
    id: "lawful-basis",
    heading: "4. Our lawful basis",
    paragraphs: ["We process personal information because:"],
    items: [
      "it is necessary to provide the services you or your child have signed up for (contract);",
      "you, or a parent on behalf of a child, have given consent - for example when you accept this policy or the terms of an application - and you can withdraw it at any time;",
      "we have a legitimate interest in keeping the Platform and its users safe and secure, preventing fraud and improving our services, balanced against your rights; and",
      "we are required to by law (legal obligation), for example to keep financial records.",
    ],
  },
  {
    id: "children",
    heading: "5. Children's information",
    paragraphs: [
      "Children's accounts are created and controlled by a parent or guardian, and the parent's consent covers the child's information. We collect only what is needed to teach the child well and keep them safe.",
      "Tutors and staff can see only the information about a child that they need for the lessons or tasks they are responsible for. We limit the contact details shown to tutors and staff to what they need, and lesson communication takes place through the Platform. A parent can ask to see, correct or delete their child's information at any time (see \"Your rights\").",
    ],
  },
  {
    id: "sharing",
    heading: "6. Who we share information with",
    paragraphs: ["We share personal information only where it is needed and only with:"],
    items: [
      "the tutors, parents and students involved in a lesson, limited to what each needs to see;",
      "STC staff, including Heads of Department, who are given access to specific tutors, students or reports only as their role requires;",
      "service providers who help us run the Platform, under agreements that limit their use of your information: Paystack (payment processing), Cloudinary (storage of images and documents you upload), Resend (delivery of email), MongoDB Atlas (database hosting), our hosting and logging providers, and the video-conferencing service used for a lesson; and",
      "courts, regulators, law-enforcement or other authorities where the law requires it, or where it is necessary to protect a child or another person from harm.",
    ],
    closing: ["If we ever reorganise or transfer the business, your information may pass to the new owner, who must honour this policy."],
  },
  {
    id: "transfers",
    heading: "7. Where your information is stored",
    paragraphs: [
      "Some of our providers store or process information outside Nigeria. Where that happens we take reasonable steps, such as contractual protections, to make sure your information receives an adequate level of protection.",
    ],
  },
  {
    id: "retention",
    heading: "8. How long we keep it",
    paragraphs: [
      "We keep your information while your account is active and for as long afterwards as is needed for the purposes above. Financial records such as payments, payouts and related audit logs are kept for the period required for accounting and legal compliance.",
      "When an account is deleted at your request we remove or scramble the personal details on it (see \"Your rights\"), and keep only the records we are legally or financially required to keep.",
    ],
  },
  {
    id: "security",
    heading: "9. How we protect it",
    paragraphs: [
      "We protect personal information with measures that include hashed passwords, encrypted connections, role-based access so staff see only what they need, and monitoring for misuse. No system is perfectly secure, so please use a strong, unique password and keep it private. If a breach affects your information we will tell you and the regulator as the law requires.",
    ],
  },
  {
    id: "rights",
    heading: "10. Your rights",
    paragraphs: ["Subject to the law that applies to you, you can:"],
    items: [
      "see the personal information we hold about you - you can download a copy from your account, or ask us to send it;",
      "ask us to correct information that is wrong or incomplete - most details can be edited directly in your profile;",
      "ask us to delete your account. We remove or scramble your name, email, phone number, password and photo and close the account; records we must keep for financial or legal reasons (such as payments and audit logs) are kept without those personal details being readable;",
      "object to, or ask us to restrict, some uses of your information, and withdraw consent you have given; and",
      "complain to the Nigeria Data Protection Commission (NDPC), or to the data-protection authority where you live, if you think we have not handled your information properly.",
    ],
    closing: [`To use any of these rights, email ${EMAIL}. We may need to confirm who you are first, and will reply within the time the law allows.`],
  },
  {
    id: "cookies",
    heading: "11. Cookies and similar technology",
    paragraphs: [
      "We use a small number of essential cookies and browser storage to keep you signed in, remember basic preferences and keep the Platform secure. We do not use advertising or third-party tracking cookies. You can block cookies in your browser settings, but you will then not be able to sign in.",
    ],
  },
  {
    id: "changes",
    heading: "12. Changes to this policy",
    paragraphs: [
      "We may update this policy as our services or the law change. The date at the top shows when it was last updated, and we will let you know about significant changes.",
    ],
  },
  {
    id: "contact",
    heading: "13. Contact us",
    paragraphs: [`Questions or requests about your information? Email ${EMAIL} or call ${PHONE}, or use the form on our Contact page.`],
  },
];

// Plain-text form, for places that show the text in a single scrolling block (the sign-in Terms gate).
export function legalSectionsToText(intro: string, sections: LegalSection[]): string {
  return [
    intro,
    ...sections.map((section) =>
      [
        section.heading,
        ...(section.paragraphs ?? []),
        ...(section.items ?? []).map((item) => `• ${item}`),
        ...(section.closing ?? []),
      ].join("\n\n")
    ),
  ].join("\n\n\n");
}
