"use client";

import {
  MotionDiv,
  MotionStaggerContainer,
  MotionHeading,
} from "@/components/ui/motion-content";
import useEmblaCarousel from "embla-carousel-react";
import { useCallback, useEffect, useState } from "react";
import { useLanguage } from "@/lib/language-context";

export function Testimonials() {
  const { t, language } = useLanguage();
  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: "center",
    loop: true,
    slidesToScroll: 1,
    direction: language === "fa" ? "rtl" : "ltr",
  });
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [scrollSnaps, setScrollSnaps] = useState<number[]>([]);
  const [testimonials, setTestimonials] = useState<any[]>([]);

  // Load testimonials directly from common.json
  useEffect(() => {
    async function loadTestimonials() {
      try {
        const response = await fetch(`/locales/${language}/common.json`);
        const data = await response.json();
        console.log("Loaded translations:", data);

        if (data && data.testimonials && Array.isArray(data.testimonials)) {
          console.log("Found testimonials:", data.testimonials);
          setTestimonials(data.testimonials);
        } else {
          console.error("Testimonials not found or not an array");
          setTestimonials([]);
        }
      } catch (error) {
        console.error("Error loading testimonials:", error);
        setTestimonials([]);
      }
    }

    loadTestimonials();
  }, [language]);

  const scrollTo = useCallback(
    (index: number) => {
      if (!emblaApi) return;
      emblaApi.scrollTo(index);
    },
    [emblaApi]
  );

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  // Initialize or reinitialize carousel when testimonials change or emblaApi is available
  useEffect(() => {
    if (!emblaApi || testimonials.length === 0) return;

    // Reset carousel when testimonials change
    emblaApi.reInit();
    setScrollSnaps(emblaApi.scrollSnapList());
    emblaApi.on("select", onSelect);
    onSelect();

    return () => {
      emblaApi.off("select", onSelect);
    };
  }, [emblaApi, onSelect, testimonials]);

  // Function to render stars based on rating
  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }).map((_, i) => (
      <span key={i} className="text-yellow-400 text-xl">
        {i < rating ? "★" : "☆"}
      </span>
    ));
  };

  // Use these functions for navigation buttons
  const scrollPrev = useCallback(() => {
    if (emblaApi) emblaApi.scrollPrev();
  }, [emblaApi]);

  const scrollNext = useCallback(() => {
    if (emblaApi) emblaApi.scrollNext();
  }, [emblaApi]);

  return (
    <section
      dir={language === "fa" ? "rtl" : "ltr"}
      className="py-16 bg-black border-none relative"
    >
      <div
        className="absolute inset-0 mx-auto my-auto bg-[url('/images/back.jpg')] bg-contain bg-center opacity-20 z-0"
        style={{
          width: "170%",
          height: "120%",
          top: "0%",
          left: "0%",
          transform: "rotate(-8deg) scale(1.3)",
        }}
      ></div>
      <div className="container mx-auto px-4 max-w-3xl relative z-10">
        <MotionStaggerContainer className="text-center mb-12">
          <MotionHeading className="text-3xl font-bold text-white text-center">
            {t("testimonialHeading")}
          </MotionHeading>
        </MotionStaggerContainer>

        <div className="relative">
          <div className="overflow-hidden" ref={emblaRef}>
            <div className="flex gap-5 px-2">
              {testimonials && testimonials.length > 0 ? (
                testimonials.map((testimonial, index) => (
                  <div
                    className="min-w-[85%] sm:min-w-[45%] sm:max-w-[45%] flex-grow-0 flex-shrink-0"
                    key={index}
                  >
                    <MotionDiv
                      className="bg-[#1a1a3a] border border-[#2c2c50] shadow-lg rounded-lg p-6 h-full flex flex-col"
                      delay={index * 0.1}
                    >
                      <div className="flex items-center mb-3 justify-between">
                        <div className="flex flex-col w-full">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-full overflow-hidden">
                              <img
                                src={`https://i.pravatar.cc/150?img=${
                                  index + 10
                                }`}
                                alt={testimonial.name}
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <div>
                              <h4 className="font-bold text-white">
                                {testimonial.name}
                              </h4>
                              <p className="text-xs text-gray-400">
                                {testimonial.title}
                              </p>
                            </div>
                          </div>
                          <div className="flex mt-3">
                            {renderStars(testimonial.rating || 5)}
                          </div>
                        </div>
                      </div>
                      <div className="flex-grow">
                        <p className="text-gray-300">
                          &ldquo;{testimonial.quote}&rdquo;
                        </p>
                      </div>
                    </MotionDiv>
                  </div>
                ))
              ) : (
                <div className="text-white text-center w-full py-8">
                  Loading testimonials...
                </div>
              )}
            </div>
          </div>

          {scrollSnaps.length > 1 && (
            <div className="flex justify-center mt-8 gap-2">
              {scrollSnaps.map((_, index) => (
                <button
                  key={index}
                  className={`w-3 h-3 rounded-full transition-all ${
                    index === selectedIndex
                      ? "bg-primary scale-110"
                      : "bg-white hover:bg-gray-300"
                  }`}
                  onClick={() => scrollTo(index)}
                  aria-label={`Go to slide ${index + 1}`}
                />
              ))}
            </div>
          )}

          {/* Navigation buttons */}
          {testimonials.length > 1 && (
            <div className="flex justify-center items-center mt-8 gap-16">
              <button
                onClick={scrollPrev}
                className="text-white hover:text-blue-500 transition-colors"
                aria-label="Previous testimonial"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="32"
                  height="32"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className={`${language === "fa" ? "rotate-180" : ""}`}
                >
                  <polyline points="15 18 9 12 15 6"></polyline>
                </svg>
              </button>

              <button
                onClick={scrollNext}
                className="text-white hover:text-blue-500 transition-colors"
                aria-label="Next testimonial"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="32"
                  height="32"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className={`${language === "fa" ? "rotate-180" : ""}`}
                >
                  <polyline points="9 18 15 12 9 6"></polyline>
                </svg>
              </button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
