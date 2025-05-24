"use client";
import { motion } from 'framer-motion';
import Image from 'next/image';
import styles from './CommunitySection.module.css';

const CommunitySection = () => {
  return (
    <section className={styles.community}>
      <div className={styles.container}>
        <div className={styles.contentWrapper}>
          {/* Text Content */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className={styles.textContent}
          >
            <p className={styles.eyebrow}>Be part of a dynamic learning community</p>
            <h2 className={styles.title}>
              Join our community of<br />
              <span className={styles.highlight}>8000+ learners</span>
            </h2>
            <p className={styles.description}>
              Our vibrant network of over 8,000 learners, expert instructors, and industry 
              professionals creates an enriching environment for growth and collaboration
            </p>
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
              className={styles.ctaButton}
            >
              Start Learning
            </motion.button>
          </motion.div>

          {/* Image Grid */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
            className={styles.imageGrid}
          >
            <div className={styles.imageColumn}>
              <div className={styles.imageWrapper}>
                <Image
                  src="/image/community1.jpeg"
                  alt="Students collaborating"
                  width={250}
                  height={300}
                  className={styles.image}
                />
              </div>
              <div className={styles.imageWrapper}>
                <Image
                  src="/image/community5.jpeg"
                  alt="Online learning session"
                  width={250}
                  height={300}
                  className={styles.image}
                />
              </div>
            </div>
            <div className={styles.imageColumn}>
              <div className={styles.imageWrapper}>
                <Image
                  src="/image/community6.jpeg"
                  alt="Group discussion"
                  width={250}
                  height={300}
                  className={styles.image}
                />
              </div>
              <div className={styles.imageWrapper}>
                <Image
                  src="/image/community7.jpeg"
                  alt="Tutor helping student"
                  width={250}
                  height={300}
                  className={styles.image}
                />
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default CommunitySection;