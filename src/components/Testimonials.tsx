"use client";

import {
  MotionDiv,
  MotionStaggerContainer,
  MotionHeading,
  MotionParagraph,
} from "@/components/ui/motion-content";
import useEmblaCarousel from "embla-carousel-react";
import { useCallback, useEffect, useState } from "react";

// Additional testimonials data
const testimonialsData = [
  {
    name: "Ali Mohammadi",
    title: "Forex Trader",
    quote:
      "After using the signals from this site, my trading profits increased significantly. I'm really satisfied!",
    rating: 4,
  },
  {
    name: "Sara Ahmadi",
    title: "Beginner in Currency Market",
    quote:
      "As a beginner, these signals helped me enter trades with more confidence. Great support and accurate analysis!",
    rating: 5,
  },
  {
    name: "Reza Karimi",
    title: "Professional Trader",
    quote:
      "The accuracy of the signals is exceptional. I've used various sites, but none have been as successful as this one.",
    rating: 5,
  },
  {
    name: "Mina Taheri",
    title: "Day Trader",
    quote:
      "These signals have transformed my trading strategy. The precision and timing are impressive!",
    rating: 4,
  },
  {
    name: "Amir Hosseini",
    title: "Expert Analyst",
    quote:
      "As someone who analyzes markets daily, I can confirm these signals are based on solid technical analysis.",
    rating: 5,
  },
  {
    name: "Leila Rahimi",
    title: "Part-time Trader",
    quote:
      "Even with my busy schedule, I've been able to make consistent profits following these signals.",
    rating: 4,
  },
  {
    name: "Mohammad Javad",
    title: "Financial Advisor",
    quote:
      "I recommend this service to my clients who are interested in forex trading. The results speak for themselves.",
    rating: 5,
  },
];

export function Testimonials() {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: "center",
    loop: false,
    slidesToScroll: 2,
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

  // Function to render stars based on rating
  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }).map((_, i) => (
      <span key={i} className="text-yellow-400 text-xl">
        {i < rating ? "★" : "☆"}
      </span>
    ));
  };

  return (
    <section dir="ltr" className="py-16 bg-black border-none relative">
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
            What They&apos;re Saying About Us
          </MotionHeading>
          <MotionParagraph className="text-gray-400 mt-4 max-w-2xl mx-auto text-center">
            The heartfelt words of those we&apos;ve touched speak volumes about
            the impact we&apos;ve made together. From empowering individuals to
            transforming
          </MotionParagraph>
        </MotionStaggerContainer>

        <div className="relative">
          <div className="overflow-hidden" ref={emblaRef}>
            <div className="flex gap-5 px-2">
              {testimonialsData.map((testimonial, index) => (
                <div
                  className="min-w-[45%] max-w-[45%] flex-grow-0 flex-shrink-0"
                  key={index}
                >
                  <MotionDiv
                    className="bg-[#1a1a3a] border border-[#2c2c50] shadow-lg rounded-lg p-6 text-left h-full flex flex-col"
                    delay={index * 0.1}
                  >
                    <div className="flex items-center mb-3 justify-between">
                      <div className="flex flex-col">
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
                            <h4 className="font-bold text-white text-left">
                              {testimonial.name}
                            </h4>
                            <p className="text-xs text-gray-400 text-left">
                              {testimonial.title}
                            </p>
                          </div>
                        </div>
                        <div className="flex mt-3">
                          {renderStars(testimonial.rating)}
                        </div>
                      </div>
                    </div>
                    <div className="flex-grow">
                      <p className="text-gray-300 text-left">
                        &ldquo;{testimonial.quote}&rdquo;
                      </p>
                    </div>
                  </MotionDiv>
                </div>
              ))}
            </div>
          </div>

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
        </div>
      </div>
    </section>
  );
}
