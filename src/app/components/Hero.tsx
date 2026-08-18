"use client";
import Image from "next/image";
import "./Hero.css";
import { motion } from "framer-motion";
import Link from "next/link";
import { usePageSection } from "@/hooks/use-page-section";
import { HeroContent, PageSectionKey } from "@/types/content";

const DEFAULT_HERO: HeroContent = {
  headline: "Empowering",
  highlightText: "Learners,",
  headlineSuffix: "Anywhere, Anytime",
  body: "Unlock academic success, professional growth, and digital skills through expert-led tutoring, tech training, personal development, and career support, all delivered virtually at your convenience.",
  imageUrl: "/image/kids.jpeg",
  primaryButtonText: "Get Started",
  primaryButtonLink: "/services",
  secondaryButtonText: "Login",
  secondaryButtonLink: "/services",
};

const Hero = () => {
  const content = usePageSection(PageSectionKey.HERO, DEFAULT_HERO);

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.3
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.6,
        ease: "easeOut"
      }
    }
  };

  return (
    <motion.section
      className="hero"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      {/* Left Side - Image */}
      <motion.div
        className="imageContainer"
        variants={itemVariants}
      >
        <Image
          src={content.imageUrl}
          alt="Student learning online"
          width={500}
          height={500}
          className="heroImage"
          priority
        />

        {/* Floating Labels
        <motion.span 
          className={`${styles.label} ${styles.labelTop}`}
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.5 }}
        >
          Online
        </motion.span>
        <motion.span 
          className={`${styles.label} ${styles.labelMiddle}`}
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 1, duration: 0.5 }}
        >
          Offline
        </motion.span>
        <motion.span 
          className={`${styles.label} ${styles.labelBottom}`}
          initial={{ x: 20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 1.2, duration: 0.5 }}
        >
          One-on-One
        </motion.span> */}
      </motion.div>

      {/* Right Side - Text */}
      <motion.div
        className="textContainer"
        variants={itemVariants}
      >
        <motion.h1 variants={itemVariants}>
          {content.headline}{" "}
          {content.highlightText && <span className="highlight">{content.highlightText}</span>}{" "}
          {content.headlineSuffix}
        </motion.h1>
        <motion.p variants={itemVariants}>{content.body}</motion.p>
        <motion.div
          className="buttons"
          variants={itemVariants}
        >
          <Link href={content.primaryButtonLink}>
            <motion.button
              className="primaryButton"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {content.primaryButtonText}
            </motion.button>
          </Link>

          <Link href={content.secondaryButtonLink}>
            <motion.button
              className="secondaryButton"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}>
              {content.secondaryButtonText}
            </motion.button>
          </Link>
        </motion.div>
      </motion.div>
    </motion.section>
  );
};

export default Hero;