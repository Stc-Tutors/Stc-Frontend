"use client";
import React from "react";
import Image from "next/image";
import styles from "./Hero.module.css";
import { motion } from "framer-motion";
import Link from "next/link";

const Hero = () => {
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
      className={styles.hero}
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      {/* Left Side - Image */}
      <motion.div 
        className={styles.imageContainer}
        variants={itemVariants}
      >
        <Image 
          src="/image/kids.jpeg"
          alt="Student learning online"
          width={500}
          height={500}
          className={styles.heroImage}
          priority
        />
        
        {/* Floating Labels */}
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
        </motion.span>
      </motion.div>

      {/* Right Side - Text */}
      <motion.div 
        className={styles.textContainer}
        variants={itemVariants}
      >
        <motion.h1 variants={itemVariants}>
          We Bring <span className={styles.highlight}>Excellence</span> to Your
          Doorstep
        </motion.h1>
        <motion.p variants={itemVariants}>
          We offer comprehensive solutions including{" "}
          <strong>academic tutoring</strong>,{" "}
          <strong>professional development</strong>,{" "}
          <strong>technology training</strong>, skill acquisition, and personal
          counseling.
        </motion.p>
        <motion.div 
          className={styles.buttons}
          variants={itemVariants}
        >
          <Link href="/register" passHref>
            <motion.button 
              className={styles.primaryButton}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Get Started
            </motion.button>
          </Link>
          <Link href="/subjects" passHref>
            <motion.button 
              className={styles.secondaryButton}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Browse Subjects
            </motion.button>
          </Link>
        </motion.div>
      </motion.div>
    </motion.section>
  );
};

export default Hero;