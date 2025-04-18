"use client";

import { Users } from "lucide-react";
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
  },
  {
    name: "Sara Ahmadi",
    title: "Beginner in Currency Market",
    quote:
      "As a beginner, these signals helped me enter trades with more confidence. Great support and accurate analysis!",
  },
  {
    name: "Reza Karimi",
    title: "Professional Trader",
    quote:
      "The accuracy of the signals is exceptional. I've used various sites, but none have been as successful as this one.",
  },
  {
    name: "Mina Taheri",
    title: "Day Trader",
    quote:
      "These signals have transformed my trading strategy. The precision and timing are impressive!",
  },
  {
    name: "Amir Hosseini",
    title: "Expert Analyst",
    quote:
      "As someone who analyzes markets daily, I can confirm these signals are based on solid technical analysis.",
  },
  {
    name: "Leila Rahimi",
    title: "Part-time Trader",
    quote:
      "Even with my busy schedule, I've been able to make consistent profits following these signals.",
  },
  {
    name: "Mohammad Javad",
    title: "Financial Advisor",
    quote:
      "I recommend this service to my clients who are interested in forex trading. The results speak for themselves.",
  },
];

export function Testimonials() {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: "start",
    loop: false,
    dragFree: true,
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
            User Testimonials
          </MotionHeading>
          <MotionParagraph className="text-gray-400 mt-4 max-w-2xl mx-auto text-center">
            What our users say about our signals
          </MotionParagraph>
        </MotionStaggerContainer>

        <div className="relative">
          <div className="overflow-hidden" ref={emblaRef}>
            <div className="flex gap-5 px-2">
              {testimonialsData.map((testimonial, index) => (
                <div
                  className="min-w-[320px] max-w-[280px] flex-grow-0 flex-shrink-0"
                  key={index}
                >
                  <MotionDiv
                    className="bg-gray-900 border-0 shadow-lg rounded-lg p-5 text-left h-full"
                    delay={index * 0.1}
                  >
                    <div className="flex items-center mb-3 justify-between">
                      <div className="text-left">
                        <h4 className="font-bold text-white text-left text-sm">
                          {testimonial.name}
                        </h4>
                        <p className="text-xs text-gray-400 text-left">
                          {testimonial.title}
                        </p>
                      </div>
                      <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center text-primary font-bold">
                        <Users className="h-5 w-5" />
                      </div>
                    </div>
                    <p className="text-gray-400 text-left text-sm">
                      &ldquo;{testimonial.quote}&rdquo;
                    </p>
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
                    : "bg-gray-600 hover:bg-gray-500"
                }`}
                onClick={() => scrollTo(index)}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>

          <div className="text-center mt-4 text-gray-400 text-sm">
            <p>Drag to see more testimonials</p>
          </div>
        </div>
      </div>
    </section>
  );
}
