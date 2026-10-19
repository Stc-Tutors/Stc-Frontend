"use client";
import { motion } from 'framer-motion';
import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';
import './TutorsSection.css';

import { useRouter } from 'next/navigation';
import { GetFeaturedTutorsAction } from '@/server/content';
import { usePageSection } from '@/hooks/use-page-section';
import { FeaturedTutor, PageSectionKey, TutorsSectionContent } from '@/types/content';

interface DisplayTutor {
  id: string;
  name: string;
  subject: string;
  image: string;
  experience: string;
  rating: number;
}

const DEFAULT_TUTORS_SECTION: TutorsSectionContent = {
  eyebrow: "Building a Network of 1000+ Carefully Vetted Tutors",
  heading: "Get expert tutoring from qualified educators",
  body: "We’re curating a strong pool of dedicated, qualified educators, each selected through a rigorous screening process to ensure high-quality, student-focused learning experiences.",
  buttonText: "Find Tutor",
  buttonLink: "/lms-home/student/dashboard",
};

function toDisplayTutor(t: FeaturedTutor): DisplayTutor {
  const user = typeof t.tutor === "object" ? t.tutor : null;
  const name = user ? `${user.firstName} ${user.lastName}` : "STC Tutor";
  const subject = t.teachingCombinations[0]?.subjectsTaught[0] ?? "Multiple subjects";
  return {
    id: t.id,
    name,
    subject,
    image: user?.avatarUrl || "/image/tutor1.jpg",
    experience: t.yearsOfExperience ? `${t.yearsOfExperience}+ years experience` : "Experienced tutor",
    rating: t.rating.totalRatings > 0 ? t.rating.averageRating : 5,
  };
}

const TutorsSection = () => {
  const content = usePageSection(PageSectionKey.TUTORS_SECTION, DEFAULT_TUTORS_SECTION);
  // Only real tutors an admin has marked "show on homepage" - the carousel stays hidden until there is at least one.
  const [tutors, setTutors] = useState<DisplayTutor[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const carouselRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    GetFeaturedTutorsAction().then(([res]) => {
      if (res?.data && res.data.length > 0) setTutors(res.data.map(toDisplayTutor));
    });
  }, []);

  const nextSlide = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === tutors.length - 1 ? 0 : prevIndex + 1
    );
  };

  const prevSlide = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === 0 ? tutors.length - 1 : prevIndex - 1
    );
  };

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
  };

  return (
    <section className="section">
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="content"
        >
          <div className="textContent">
            <p className="bigheading">{content.eyebrow}</p>
            <h1 className="heading">{content.heading}</h1>
            <p className="subheading">{content.body}</p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="tutorcta" onClick={() => router.push(content.buttonLink)}
            >
              {content.buttonText}
            </motion.button>
          </div>

          {tutors.length > 0 && (
          <div className="carouselContainer">
            <div
              ref={carouselRef}
              className="carousel"
              style={{
                transform: `translateX(-${currentIndex * 100}%)`
              }}
            >
              {tutors.map((tutor) => (
                <motion.div
                  key={tutor.id}
                  whileHover={{ y: -5 }}
                  className="tutorCard"
                >
                  <div className="tutorImage">
                    <Image
                      src={tutor.image}
                      alt={tutor.name}
                      width={280}
                      height={350}
                      className="image"
                    />
                  </div>
                  <div className="tutorInfo">
                    <h2>{tutor.name}</h2>
                    <p className="subject">{tutor.subject}</p>
                    <div className="rating">
                      {[...Array(5)].map((_, i) => (
                        <span
                          key={i}
                          className={i < Math.floor(tutor.rating) ? "starFilled" : "starEmpty"}
                        >
                          ★
                        </span>
                      ))}
                      <span className="ratingValue">{tutor.rating}</span>
                    </div>
                    <p className="experience">{tutor.experience}</p>
                  </div>
                </motion.div>
              ))}
            </div>

            <button
              onClick={prevSlide}
              className="carouselButton prevButton"
              aria-label="Previous tutor"
            >
              &lt;
            </button>
            <button
              onClick={nextSlide}
              className="carouselButton nextButton"
              aria-label="Next tutor"
            >
              &gt;
            </button>

            <div className="dots">
              {tutors.map((_, index) => (
                <button
                  key={index}
                  onClick={() => goToSlide(index)}
                  className={`dot ${index === currentIndex ? "activeDot" : ''}`}
                  aria-label={`Go to slide ${index + 1}`}
                />
              ))}
            </div>
          </div>
          )}
        </motion.div>
      </div>
    </section>
  );
};

export default TutorsSection;
