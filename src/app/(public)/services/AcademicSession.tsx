// components/ServicesGrid.tsx
import Image from 'next/image';
import Link from 'next/link';

const services = [
  {
    id: 1,
    title: "Academic Tutoring",
    number: "1+1=",
    description: [
      "We offer personalized tutoring across different levels of basic education from Basic school to post-high school across different curricula, helping students master core subjects, boost performance, and build lasting academic confidence"
    ],
    image: "/image/tutoring.jpg",
    link: "/services/academic-tutoring"
  },

  {
    id: 2,
    title: "Exam Preparation",
    description: [
      "Ace Your Exams",
      "Prepare with confidence for major international exams, including IGCSE, A-Levels, WAEC, JAMB, SAT, ACT, NECO, and others. Our targeted prep programs include practice tests, strategy sessions, and expert guidance."
    ],
    image:"/image/exam prep.jpg",
    link: "/services/exam-preparation"
  },

  {
    id: 3,
    title: "Tech Training for Kids",
    description: [
      "Master Modern Technology",
      "Get certified by equipping learners between the ages of 5 and 20 with essential digital skills from coding and robotics to video editing and app development. Ideal for students and teens ready to thrive in today’s tech-driven world."
    ],
    image:"/image/tech.jpg",
    link: "/services/tech-training"
  },

  {
    id: 4,
    title: "Tech Training for Adults",
    description: [
      "Master Modern Technology",
      "Get certified by equipping learners between the ages of 25 and above with essential digital skills from coding and robotics to video editing and app development. Ideal for students and teens ready to thrive in today’s tech-driven world."
    ],
    image:"/image/adult-learners.jpg",
    link: "/services/tech-adult"
  },

  {
    id: 5,
    title: "Music Training",
    description: [
      "Explore Your Musical Inherent With Professional Guidance",
      "Learn to play an instrument, improve your voals, or compose music under the guidance of experienced tutors."
    ],
    image:"/image/music.jpg",
    link: "/services/music-training"
  },

  {
    id: 6,
    title: "Adult Education",
    description: [
      "Learning Has No Age Limit",
      "It’s never too late to learn. Our adult education programs are tailored for personal development, literacy improvement, and practical skill-building for everyday life and career advancement."
    ],
    image: "/image/adult education.jpg",
    link: "/services/adult-education"
  },

  {
    id: 7,
    title: "Language and Culture",
    description: [
      "Speak Any Language With Confidence",
      "Master new languages with the help of experienced instructors. We offer courses in French, Spanish, Portuguese, Swahili, Zulu, and major Nigerian languages and culture like Yoruba, Hausa, and Igbo, designed for beginners to advanced learners."
    ],
    image:"/image/culture.jpg",
    link: "/services/language-culture"
  },

  {
    id: 8,
    title: "Soft Skill Development",
    description: [
      "Build Professional Excellence",
      "Gain practical skills and hands-on experience to excel in your career with expert-led job training programs."
    ],
    image:"/image/skills.jpg",
    link: "/services/soft-skill"
  },

  {
    id: 9,
    title: "Career Coaching",
    description: [
      "Guidance At Your Convenience",
      "We help learners prepare for future opportunities with CV reviews, interview prep, public speaking, digital literacy, and personalized coaching. Perfect for teens, graduates, and job seekers."
    ],
    image:"/image/career.jpg",
    link: "/services/career-coaching"
  },

  {
    id: 10,
    title: "Self-Development",
    description: [
      "Shape Your Career Path",
      "Enhance your personal and professional growth with courses focused on leadership, productivity, and mindset development."
    ],
    image:"/image/self development.jpg",
    link: "/services/self-development"
  },
];

const AcademicSession = () => {
  return (
    <section className="bg-white py-16 px-4">
      <div className="max-w-6xl mx-auto space-y-24">
        {services.map((service, index) => (
          <div 
            key={service.id}
            className={`grid md:grid-cols-2 gap-12 ${index % 2 === 0 ? '' : 'md:[&>div:first-child]:order-2'}`}
          >
            {/* Text Content */}
            <div className="flex flex-col justify-center">
              <h2 className="text-4xl font-bold text-gray-900 mb-6">{service.number}</h2>
              <h3 className="text-3xl font-bold text-gray-900 mb-4">{service.title}</h3>
              <p className="text-xl text-gray-600 mb-6">
                {service.description[0]}<br />
                {service.description[1]}
              </p>
              <Link 
                href={service.link}
                className="flex items-center text-[#38b6ff] font-medium hover:text-indigo-300 transition-colors w-fit"
              >
                Learn More <span className="ml-2">→</span>
              </Link>
            </div>

            {/* Image - Alternates sides */}
            <div className="relative h-80 rounded-lg overflow-hidden">
              <Image
                src={service.image}
                alt={service.title}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 50vw"
              />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default AcademicSession;