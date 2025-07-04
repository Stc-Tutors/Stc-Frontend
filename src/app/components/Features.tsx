"use client";
import { motion } from 'framer-motion';
import './Features.css';

const steps = [
  {
    title: "Register",
    description: "Register with STC Tutors. Quick and personalized learning starts now",
    icon: "📝"
  },
  {
    title: "Get Tutor",
    description: "Get a perfect tutor expertly matched to your learning needs",
    icon: "👩‍🏫"
  },
  {
    title: "Start Learning",
    description: "Unleash an enjoyable learning experience and high grades in your exams",
    icon: "🎓"
  }
];

const Features = () => {
  return (
    <section className="section">
      <div className="featuresContainer">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="featuresHeader"
        >
          <h2 className="title">Want to know how?</h2>
          <p className="subtitle">Get excellent results in three simple steps</p>
        </motion.div>

        <div className="stepsContainer">
          {steps.map((step, index) => (
            <motion.div
              key={step.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.15 }}
              viewport={{ once: true }}
              className="stepCard"
            >
              <div className="stepNumber">{index + 1}</div>
              <div className="stepIcon">{step.icon}</div>
              <h3 className="stepTitle">{step.title}</h3>
              <p className="stepDescription">{step.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;