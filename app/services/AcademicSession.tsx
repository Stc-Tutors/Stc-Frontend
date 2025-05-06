// components/ServicesGrid.tsx
import Image from 'next/image';
import Link from 'next/link';

const services = [
  {
    id: 1,
    title: "Academic Tutoring",
    number: "1+1=",
    description: [
      "Get Expert Academic Support",
      "Get personalized tutoring from experienced educators across all subjects. From basic concepts to advanced topics, we ensure comprehensive understanding and improved grades."
    ],
    image: "/image/tutoring.jpg",
    link: "/services/AcademicTutoring"
  },

  {
    id: 2,
    title: "Exam Preparation",
    //number: "3.14",
    description: [
      "Ace Your Exams",
      "Comprehensive test prep for SAT, ACT, GRE, and more with proven strategies and mock tests."
    ],
    image:"/image/exam.jpg",
    link: "/services/Exam"
  },

  {
    id: 3,
    title: "Adult Education",
    //number: "4/58",
    description: [
      "Learning Has No Age Limit",
      "Flexible education programs designed for adults seeking to advance their knowledge or complete their academic journey. Study at your own pace with dedicated support"
    ],
    image: "/image/adult education.jpg",
    link: "/services/AdultEducation"
  },

  {
    id: 4,
    title: "Tech Training",
    //number: "3.14",
    description: [
      "Master Modern Technology",
      "Stay ahead in the tech industry with hands-on training in the latest tools, programming languages, and industry trends."
    ],
    image:"/image/tech.jpg",
    link: "/services/Tech"
  },

  {
    id: 5,
    title: "Language and Culture",
    //number: "3.14",
    description: [
      "Speak Any Language With Confidence",
      "Achieve fluency with expert language coaches and immersive learning techniques tailored to your pae and goals."
    ],
    image:"/image/culture.jpg",
    link: "/services/LanguageCulture"
  },

  {
    id: 6,
    title: "Music Training",
    //number: "3.14",
    description: [
      "Explore Your Musical Inherent With Professional Guidance",
      "Learn to play an instrument, improve your voals, or compose music under the guidance of experienced tutors."
    ],
    image:"/image/music.jpg",
    link: "/services/MusicTraining"
  },

  {
    id: 7,
    title: "Soft Skill Development",
    //number: "3.14",
    description: [
      "Build Professional Excellence",
      "Gain practical skills and hands-on experience to excel in your career with expert-led job training programs."
    ],
    image:"/image/skills.jpg",
    link: "/services/SoftSkill"
  },

  {
    id: 8,
    title: "Career Coaching",
    //number: "3.14",
    description: [
      "Guidance At Your Convenience",
      "Get personalized career coaching and mentorship to navigate career transitions and achieve professional success."
    ],
    image:"/image/career.jpg",
    link: "/services/Career"
  },

  {
    id: 9,
    title: "Self-Development",
    //number: "3.14",
    description: [
      "Shape Your Career Path",
      "Enhance your personal and professional growth with courses focused on leadership, productivity, and mindset development."
    ],
    image:"/image/self development.jpg",
    link: "/services/SelfDevelopment"
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
                className="flex items-center text-indigo-600 font-medium hover:text-indigo-800 transition-colors w-fit"
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