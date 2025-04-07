"use client";
import { motion } from 'framer-motion';
import Image from 'next/image';
import { useRef, useState } from 'react';
import styles from './TutorsSection.module.css';

const tutors = [
  {
    id: 1,
    name: "Dr. Sarah Johnson",
    subject: "Mathematics",
    image: "/image/tutor1.jpeg",
    experience: "10+ years experience",
    rating: 4.9
  },
  {
    id: 2,
    name: "Prof. Michael Chen",
    subject: "Physics",
    image: "/image/tutor2.jpeg",
    experience: "8 years experience",
    rating: 4.8
  },
  {
    id: 3,
    name: "Ms. Emily Wilson",
    subject: "English Literature",
    image:"/image/tutor3.jpeg",
    experience: "5 years experience",
    rating: 4.7
  },
  {
    id: 4,
    name: "Mr. David Kim",
    subject: "Chemistry",
    image: "/image/tutor1.jpeg",
    experience: "7 years experience",
    rating: 4.8
  },
  {
    id: 5,
    name: "Dr. Lisa Rodriguez",
    subject: "Biology",
    image: "/image/tutor2.jpeg",
    experience: "9 years experience",
    rating: 4.9
  }
];

const TutorsSection = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const carouselRef = useRef<HTMLDivElement>(null);

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
    <section className={styles.section}>
      <div className={styles.container}>
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className={styles.content}
        >
          <div className={styles.textContent}>
            <p className={styles.bigheading}>Over 1200+ vetted and carefuly picked tutors</p>
            <h1 className={styles.heading}>Get expert tutoring from qualified educators</h1>
            <p className={styles.subheading}>
              Learn with confidence from our carefully selected tutors who meet the highest standards of expertise and quality
            </p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={styles.ctaButton}
            >
              Find Tutor
            </motion.button>
          </div>

          <div className={styles.carouselContainer}>
            <div 
              ref={carouselRef}
              className={styles.carousel}
              style={{ 
                transform: `translateX(-${currentIndex * 100}%)` 
              }}
            >
              {tutors.map((tutor) => (
                <motion.div 
                  key={tutor.id}
                  whileHover={{ y: -5 }}
                  className={styles.tutorCard}
                >
                  <div className={styles.tutorImage}>
                    <Image
                      src={tutor.image}
                      alt={tutor.name}
                      width={280}
                      height={350}
                      className={styles.image}
                    />
                  </div>
                  <div className={styles.tutorInfo}>
                    <h3>{tutor.name}</h3>
                    <p className={styles.subject}>{tutor.subject}</p>
                    <div className={styles.rating}>
                      {[...Array(5)].map((_, i) => (
                        <span 
                          key={i} 
                          className={i < Math.floor(tutor.rating) ? styles.starFilled : styles.starEmpty}
                        >
                          ★
                        </span>
                      ))}
                      <span className={styles.ratingValue}>{tutor.rating}</span>
                    </div>
                    <p className={styles.experience}>{tutor.experience}</p>
                  </div>
                </motion.div>
              ))}
            </div>

            <button 
              onClick={prevSlide}
              className={`${styles.carouselButton} ${styles.prevButton}`}
              aria-label="Previous tutor"
            >
              &lt;
            </button>
            <button 
              onClick={nextSlide}
              className={`${styles.carouselButton} ${styles.nextButton}`}
              aria-label="Next tutor"
            >
              &gt;
            </button>

            <div className={styles.dots}>
              {tutors.map((_, index) => (
                <button
                  key={index}
                  onClick={() => goToSlide(index)}
                  className={`${styles.dot} ${index === currentIndex ? styles.activeDot : ''}`}
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