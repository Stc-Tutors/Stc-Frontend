"use client";
import { motion } from 'framer-motion';
import Image from 'next/image';
import styles from './CommunitySection.module.css';
import { useRouter } from 'next/navigation';

const CommunitySection = () => {
  const router = useRouter();
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
              <span className={styles.highlight}>learners globally</span>
            </h2>
            <p className={styles.description}>
            Be part of a dynamic network of students, expert tutors, and industry professionals working together 
            to inspire growth, foster collaboration, and unlock future-ready skills.
            </p>
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
              className={styles.ctaButton} onClick={() => router.push("/signup")}
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
                  src="/image/community5.jpg"
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
                  src="/image/community3.jpg"
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