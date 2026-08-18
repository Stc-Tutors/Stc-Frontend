"use client";

import { useEffect, useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Autoplay } from "swiper/modules";

import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

import { GetHomepageSlidesAction, HomepageSlide } from "@/server/site-content";

// Top-of-page promotional carousel, admin-managed (Stc-SuperAdmin's Site
// Content > Homepage Slides, platform-owner-only). Replaces the old
// WelcomeModal popup - same Swiper setup, but rendered inline as a normal
// page section instead of a dismissible overlay, and each slide's image
// links out to its configured URL instead of being static.
export default function HomeSlideshow() {
  const [slides, setSlides] = useState<HomepageSlide[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    GetHomepageSlidesAction().then(([res]) => {
      setSlides(res?.data ?? []);
      setIsLoading(false);
    });
  }, []);

  // No configured slides yet (or still loading) - collapse entirely rather
  // than showing an empty carousel shell.
  if (isLoading || slides.length === 0) return null;

  return (
    <section className="w-full">
      <Swiper
        modules={[Navigation, Pagination, Autoplay]}
        navigation
        pagination={{ clickable: true }}
        autoplay={{ delay: 5000 }}
        loop={slides.length > 1}
        className="w-full h-[40vh] md:h-[55vh]"
      >
        {slides.map((slide) => (
          <SwiperSlide key={slide.id}>
            {slide.linkUrl ? (
              <a href={slide.linkUrl} target="_blank" rel="noopener noreferrer" className="block w-full h-full">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={slide.imageUrl} alt={slide.caption || "Promotion"} className="w-full h-full object-cover" />
              </a>
            ) : (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img src={slide.imageUrl} alt={slide.caption || "Promotion"} className="w-full h-full object-cover" />
            )}
          </SwiperSlide>
        ))}
      </Swiper>
    </section>
  );
}
