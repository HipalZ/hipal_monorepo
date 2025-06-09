"use client";

import Image from "next/image";
import { useState, useEffect } from "react";
import Varun from "@/assets/bluetick/varun.png";
// Sample testimonial data
const testimonials = [
  {
    id: 1,
    quote:
      "Trust Verify helped us get our WhatsApp Blue Tick in just 5 days. Our customer trust increased dramatically, and we saw a 60% boost in customer inquiries within the first month",
    name: "Varun",
    role: "Coffee cup Owner",
    avatar: Varun,
  },
  // {
  //   id: 2,
  //   quote:
  //     'The analytics platform transformed how we understand customer behavior. Our conversion rates improved by 35% in just two months.',
  //   name: 'Alex Johnson',
  //   role: 'Marketing Director',
  //   avatar: '/avatars/alex.jpg',
  // },
  // {
  //   id: 3,
  //   quote:
  //     'Intuitive dashboards and actionable insights helped us make data-driven decisions that boosted our revenue significantly.',
  //   name: 'Sarah Williams',
  //   role: 'E-commerce Manager',
  //   avatar: '/avatars/sarah.jpg',
  // },
];

const TestimonialSection = () => {
  const [activeIndex, setActiveIndex] = useState(0);

  // Auto-rotate testimonials
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveIndex((prevIndex) => (prevIndex + 1) % testimonials.length);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  return (
    <section className="bg-[#f8f6f1] py-12 md:py-16 lg:py-20 px-4 md:px-8">
      {/* <div className="max-w-6xl mx-auto"> */}
      <div className="text-center mb-10">
        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
          What our clients say
        </h2>
        <p className="text-gray-600 max-w-3xl mx-auto">
          Real success stories from businesses we've helped get verified
        </p>
      </div>

      <div className="mt-12">
        {testimonials.map((testimonial, index) => (
          <div
            key={testimonial.id}
            className={`transition-opacity duration-500 ${
              index === activeIndex ? "block opacity-100" : "hidden opacity-0"
            }`}
          >
            <div className="flex flex-col md:flex-row items-center md:items-start gap-8 md:gap-12">
              <div className="w-32 h-32 md:w-40 md:h-40 lg:w-48 lg:h-48 relative flex-shrink-0">
                <div className="absolute top-0 left-0 w-full h-full rounded-full bg-white flex items-center justify-center overflow-hidden">
                  {/* Placeholder for avatar - in production, use next/image */}
                  <div className="w-full h-full bg-gray-200 relative">
                    <Image
                      src={Varun}
                      alt={testimonial.name}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 128px, (max-width: 1024px) 160px, 192px"
                    />
                  </div>
                </div>
                <div className="absolute -top-4 -right-2 bg-white rounded-full p-2 shadow-md">
                  <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 text-gray-400"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                </div>
              </div>

              <div className="flex-1">
                <blockquote className="text-xl font-medium text-gray-900 mb-4">
                  "{testimonial.quote}"
                </blockquote>
                <div className="mt-4">
                  <p className="font-bold text-gray-900">{testimonial.name}</p>
                  <p className="text-gray-600">{testimonial.role}</p>
                </div>
              </div>
            </div>
          </div>
        ))}

        <div className="flex justify-center mt-8 space-x-2">
          {testimonials.map((_, index) => (
            <button
              key={index}
              onClick={() => setActiveIndex(index)}
              className={`w-2.5 h-2.5 rounded-full transition-colors duration-300 ${
                index === activeIndex ? "bg-purple-600" : "bg-gray-300"
              }`}
              aria-label={`Go to testimonial ${index + 1}`}
            />
          ))}
        </div>
      </div>
      {/* </div> */}
    </section>
  );
};

export default TestimonialSection;
