"use client";
import { motion } from 'framer-motion';
import Image from 'next/image';
import './CommunitySection.css';
import { usePageSection } from '@/hooks/use-page-section';
import { CommunityContent, PageSectionKey } from '@/types/content';
import { sanitizeRichText } from '@/lib/sanitize-html';

const DEFAULT_COMMUNITY: CommunityContent = {
  eyebrow: "Be part of a dynamic learning community",
  title: "Join our community of",
  highlightText: "learners globally",
  description:
    "Be part of a dynamic network of students, expert tutors, and industry professionals working together to inspire growth, foster collaboration, and unlock future-ready skills.",
  buttonText: "Start Learning",
  buttonLink: "https://docs.google.com/forms/d/e/1FAIpQLSeVT8PHj3bAWD_Wcony7JFiHeY4TeV1P7giBN_w9UZZZ5bl9A/viewform",
  images: ["/image/community1.jpeg", "/image/community5.jpg", "/image/community3.jpg", "/image/community7.jpeg"],
};

const CommunitySection = () => {
  const content = usePageSection(PageSectionKey.COMMUNITY, DEFAULT_COMMUNITY);
  const images = content.images.length > 0 ? content.images : DEFAULT_COMMUNITY.images;
  const [colOne, colTwo] = [images.slice(0, 2), images.slice(2, 4)];

  return (
    <section className="community">
      <div className="container">
        <div className="contentWrapper">
          {/* Text Content */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="textContent"
          >
            <p className="eyebrow">{content.eyebrow}</p>
            <h2 className="title">
              {content.title}<br />
              {content.highlightText && <span className="highlight">{content.highlightText}</span>}
            </h2>
            <p className="description" dangerouslySetInnerHTML={{ __html: sanitizeRichText(content.description) }} />
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
              className="communitycta"
              onClick={() => window.open(content.buttonLink, "_blank")}
            >
              {content.buttonText}
            </motion.button>
          </motion.div>

          {/* Image Grid */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
            className="imageGrid"
          >
            <div className="imageColumn">
              {colOne.map((src) => (
                <div className="imageWrapper" key={src}>
                  <Image src={src} alt="Community" width={250} height={300} className="image" />
                </div>
              ))}
            </div>
            <div className="imageColumn">
              {colTwo.map((src) => (
                <div className="imageWrapper" key={src}>
                  <Image src={src} alt="Community" width={250} height={300} className="image" />
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default CommunitySection;
