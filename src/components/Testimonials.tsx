"use client";

import {
  MotionDiv,
  MotionStaggerContainer,
  MotionHeading,
} from "@/components/ui/motion-content";
import useEmblaCarousel from "embla-carousel-react";
import { useCallback, useEffect, useState } from "react";
import { useLanguage } from "@/lib/language-context";

// Define the testimonial type
interface Testimonial {
  name: string;
  title: string;
  quote: string;
  rating?: number;
}

// Fallback testimonials data in case translations are not loaded
const fallbackTestimonials: Testimonial[] = [
  {
    name: "Nasrin Mohammadi",
    title: "Forex Trader",
    quote:
      "After using the signals from this site, my trading profits increased significantly. I'm really satisfied!",
    rating: 4,
  },
  {
    name: "Vahid Ahmadi",
    title: "Beginner in Currency Market",
    quote:
      "As a beginner, these signals helped me enter trades with more confidence. Great support and accurate analysis!",
    rating: 5,
  },
  {
    name: "Michale Tomson",
    title: "Professional Trader",
    quote:
      "The accuracy of the signals is exceptional. I've used various sites, but none have been as successful as this one.",
    rating: 5,
  },
];

export function Testimonials() {
  const { t, language } = useLanguage();

  // Configure the carousel with RTL support
  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: "start",
    loop: true,
    containScroll: "trimSnaps",
    slidesToScroll: 1,
    direction: language === "fa" ? "rtl" : "ltr",
    skipSnaps: false,
  });

  const [selectedIndex, setSelectedIndex] = useState(0);
  const [scrollSnaps, setScrollSnaps] = useState<number[]>([]);

  const scrollTo = useCallback(
    (index: number) => emblaApi && emblaApi.scrollTo(index),
    [emblaApi]
  );

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;

    setScrollSnaps(emblaApi.scrollSnapList());
    emblaApi.on("select", onSelect);
    onSelect();

    return () => {
      emblaApi.off("select", onSelect);
    };
  }, [emblaApi, onSelect]);

  // Reinitialize the carousel when language changes
  useEffect(() => {
    if (emblaApi) {
      emblaApi.reInit();
    }
  }, [language, emblaApi]);

  // Function to render stars based on rating
  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }).map((_, i) => (
      <span key={i} className="text-yellow-400 text-xl">
        {i < rating ? "★" : "☆"}
      </span>
    ));
  };

  // Get testimonials data from translations with proper type checking
  const translatedTestimonials = t("testimonials");
  const testimonialsData = Array.isArray(translatedTestimonials)
    ? (translatedTestimonials as Testimonial[])
    : fallbackTestimonials;

  // Ensure we don't show too many testimonials - limit to 4 to avoid overflow
  const displayTestimonials = testimonialsData.slice(0, 4);

  return (
    <section
      dir={language === "fa" ? "rtl" : "ltr"}
      className="py-16 bg-black border-none relative overflow-hidden"
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
      <div className="container mx-auto px-4 relative z-10">
        <MotionStaggerContainer className="text-center mb-12">
          <MotionHeading className="text-3xl font-bold text-white text-center">
            {t("testimonialHeading")}
          </MotionHeading>
        </MotionStaggerContainer>

        <div className="relative mx-auto max-w-5xl">
          <div className="overflow-hidden w-full px-4" ref={emblaRef}>
            <div className="flex py-4">
              {displayTestimonials.map(
                (testimonial: Testimonial, index: number) => (
                  <div
                    className="min-w-[300px] md:min-w-[320px] max-w-[400px] flex-shrink-0 mx-4"
                    key={index}
                  >
                    <MotionDiv
                      className="bg-[#1a1a3a] border border-[#2c2c50] shadow-lg rounded-lg p-6 h-full flex flex-col"
                      delay={index * 0.1}
                    >
                      <div className="flex items-center mb-5">
                        <div className="flex flex-col w-full">
                          <div
                            className={`flex items-center gap-3 ${language === "fa" ? "flex-row-reverse" : "flex-row"}`}
                          >
                            <div className="w-12 h-12 rounded-full overflow-hidden">
                              <img
                                src={`https://i.pravatar.cc/150?img=${
                                  index + 10
                                }`}
                                alt={testimonial.name}
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <div
                              className={
                                language === "fa" ? "text-right" : "text-left"
                              }
                            >
                              <h4 className="font-bold text-white">
                                {testimonial.name}
                              </h4>
                              <p className="text-xs text-gray-400">
                                {testimonial.title}
                              </p>
                            </div>
                          </div>
                          <div
                            className={`flex mt-3 ${language === "fa" ? "justify-end" : "justify-start"}`}
                          >
                            {renderStars(testimonial.rating || 5)}
                          </div>
                        </div>
                      </div>
                      <div className="flex-grow">
                        <p
                          className={`text-gray-300 ${language === "fa" ? "text-right" : "text-left"}`}
                        >
                          &ldquo;{testimonial.quote}&rdquo;
                        </p>
                      </div>
                    </MotionDiv>
                  </div>
                )
              )}
            </div>
          </div>

          <div className="flex justify-center mt-8 gap-2">
            {Array.from({ length: displayTestimonials.length }).map(
              (_, index) => (
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
              )
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
