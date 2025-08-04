"use client";
import { motion } from 'framer-motion';
import Image from 'next/image';
import { useRef, useState } from 'react';
import './TutorsSection.css';

import { useRouter } from 'next/navigation';

const tutors = [
  {
    id: 1,
    name: "Dr. Sarah Johnson",
    subject: "Mathematics",
    image: "/image/tutor4.jpg",
    experience: "10+ years experience",
    rating: 4.9
  },
  {
    id: 2,
    name: "Prof. Michael Chen",
    subject: "Physics",
    image: "/image/tutor1.jpg",
    experience: "8 years experience",
    rating: 4.8
  },
  {
    id: 3,
    name: "Ms. Emily Wilson",
    subject: "English Literature",
    image:"/image/tutor2.jpg",
    experience: "5 years experience",
    rating: 4.7
  },
  {
    id: 4,
    name: "Mr. David Kim",
    subject: "Chemistry",
    image: "/image/tutor3.jpg",
    experience: "7 years experience",
    rating: 4.8
  },
  {
    id: 5,
    name: "Dr. Lisa Rodriguez",
    subject: "Biology",
    image: "/image/tutor1.jpg",
    experience: "9 years experience",
    rating: 4.9
  }
];

const TutorsSection = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const carouselRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

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
            <p className="bigheading">Building a Network of 1000+ Carefully Vetted Tutors</p>
            <h1 className="heading">Get expert tutoring from qualified educators</h1>
            <p className="subheading">
              We’re curating a strong pool of dedicated, qualified educators, each selected through a rigorous screening 
              process to ensure high-quality, student-focused learning experiences.
            </p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="tutorcta" onClick={() => router.push("/lms-home/student/overview")}
            >
              Find Tutor
            </motion.button>
          </div>

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
                    <h3>{tutor.name}</h3>
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
        </motion.div>
      </div>
    </section>
  );
};

export default TutorsSection;