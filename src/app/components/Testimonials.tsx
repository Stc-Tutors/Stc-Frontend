"use client";
import { motion } from 'framer-motion';
import { useState } from 'react';
import Image from 'next/image';
import './Testimonials.css';

const testimonials = [
  {
    id: 1,
    quote: "“After six months of tutoring, my grades jumped from D to B+ in Mathematics. The tutors here really know how to explain complex topics simply”",
    author: "Aminat Ayobo",
    program: "IJMB | 365",
    image: "/image/testimonial4.jpg"
  },
  {
    id: 2,
    quote: "“The Project Management course changed my career path completely. Within three months, I secured a better position. Worth every penny.”",
    author: "John Adams",
    program: "JUPEB | 329",
    image: "/image/testimonial2.jpg"
  },
  {
    id: 3,
    quote: "“The career counseling gave me clear direction and a solid plan for my future. Now I'm confidently pursuing my goals”",
    author: "Oji Clara",
    program: "IJMB | 365",
    image: "/image/testimonial3.jpg"
  }
];

const Testimonials = () => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const nextTestimonial = () => {
    setCurrentIndex((prev) => (prev === testimonials.length - 1 ? 0 : prev + 1));
  };

  const prevTestimonial = () => {
    setCurrentIndex((prev) => (prev === 0 ? testimonials.length - 1 : prev - 1));
  };

  return (
    <section className="Testimonialsection">
      <div className="Testimonialcontainer">
        {/* Centered Header */}
        <div className="Testimonialheader">
          <h2 className="Testimonialtitle">Testimonials</h2>
          <p className="Testimonialsubtitle">What our customers say</p>
        </div>

        {/* Carousel */}
        <div className="Testimonialcarousel">
          <button 
            onClick={prevTestimonial}
            className="navButton"
            aria-label="Previous testimonial"
          >
            &lt;
          </button>

          <div className="testimonialWrapper">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={testimonial.id}
                className="testimonialCard"
                initial={{ opacity: 0 }}
                animate={{ 
                  opacity: index === currentIndex ? 1 : 0,
                  scale: index === currentIndex ? 1 : 0.9
                }}
                transition={{ duration: 0.5 }}
                style={{ 
                  display: index === currentIndex ? 'flex' : 'none',
                }}
              >
                <div className="profileImage">
                  <Image
                    src={testimonial.image}
                    alt={testimonial.author}
                    width={100}
                    height={100}
                    className="image"
                    style={{
                      width: "100%",
                      height: "auto"
                    }}
                  />
                </div>
                <div className="testimonialContent">
                  <blockquote className="quote">
                    {testimonial.quote}
                  </blockquote>
                  <div className="authorInfo">
                    <p className="author">{testimonial.author}</p>
                    <p className="program">{testimonial.program}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          <button 
            onClick={nextTestimonial}
            className="navButton"
            aria-label="Next testimonial"
          >
            &gt;
          </button>
        </div>

        {/* Pagination Dots */}
        <div className="pagination">
          {testimonials.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`dot ${index === currentIndex ? "activeDot" : ''}`}
              aria-label={`View testimonial ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;