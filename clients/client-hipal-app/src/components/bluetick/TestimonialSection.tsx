"use client";

import Image from "next/image";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Star,
  Quote,
  ChevronLeft,
  ChevronRight,
  CheckCircle,
} from "lucide-react";
import Varun from "@/assets/bluetick/varun.png";

// Enhanced testimonial data
const testimonials = [
  {
    id: 1,
    quote:
      "Trust Verify helped us get our WhatsApp Blue Tick in just 5 days. Our customer trust increased dramatically, and we saw a 60% boost in customer inquiries within the first month",
    name: "Varun Sharma",
    role: "Coffee Cup Owner",
    company: "Brew Masters",
    avatar: Varun,
    rating: 5,
    metrics: {
      timeToVerify: "5 days",
      inquiryIncrease: "60%",
      trustScore: "95%",
    },
    tags: ["Quick Process", "Excellent Support", "Great Results"],
  },
  // {
  //   id: 2,
  //   quote:
  //     "The verification process was seamless and professional. Our business credibility improved instantly, and customers now trust our communications much more.",
  //   name: "Sarah Johnson",
  //   role: "Marketing Director",
  //   company: "TechFlow Solutions",
  //   avatar: "/placeholder.svg?height=200&width=200",
  //   rating: 5,
  //   metrics: {
  //     timeToVerify: "3 days",
  //     inquiryIncrease: "75%",
  //     trustScore: "98%",
  //   },
  //   tags: ["Professional", "Fast", "Reliable"],
  // },
  // {
  //   id: 3,
  //   quote:
  //     "Outstanding service! The team guided us through every step. Our customer engagement has never been better since getting verified.",
  //   name: "Michael Chen",
  //   role: "CEO",
  //   company: "Digital Dynamics",
  //   avatar: "/placeholder.svg?height=200&width=200",
  //   rating: 5,
  //   metrics: {
  //     timeToVerify: "4 days",
  //     inquiryIncrease: "80%",
  //     trustScore: "97%",
  //   },
  //   tags: ["Expert Guidance", "Amazing Results", "Highly Recommended"],
  // },
];

const TestimonialSection = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  // Auto-rotate testimonials
  useEffect(() => {
    if (!isAutoPlaying) return;

    const interval = setInterval(() => {
      setActiveIndex((prevIndex) => (prevIndex + 1) % testimonials.length);
    }, 6000);

    return () => clearInterval(interval);
  }, [isAutoPlaying]);

  const nextTestimonial = () => {
    setActiveIndex((prevIndex) => (prevIndex + 1) % testimonials.length);
    setIsAutoPlaying(false);
  };

  const prevTestimonial = () => {
    setActiveIndex(
      (prevIndex) =>
        (prevIndex - 1 + testimonials.length) % testimonials.length,
    );
    setIsAutoPlaying(false);
  };

  const currentTestimonial = testimonials[activeIndex];

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-[#f8f6f1] via-[#f5f2eb] to-[#f0ede5] py-16 md:py-20 lg:py-24 px-4 md:px-8">
      {/* Background Elements */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-purple-100 rounded-full blur-3xl opacity-20 -translate-x-1/2 -translate-y-1/2"></div>
      <div className="absolute bottom-0 right-0 w-80 h-80 bg-blue-100 rounded-full blur-3xl opacity-20 translate-x-1/2 translate-y-1/2"></div>

      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <motion.div
            className="inline-flex items-center gap-2 bg-purple-100 text-purple-700 px-4 py-2 rounded-full text-sm font-medium mb-6"
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Star className="w-4 h-4 fill-current" />
            Client Success Stories
          </motion.div>

          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
            What our clients say
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Real success stories from businesses we've helped get verified and
            grow their customer trust
          </p>
        </motion.div>

        {/* Main Testimonial */}
        <div className="relative">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeIndex}
              initial={{ opacity: 0, x: 100 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -100 }}
              transition={{ duration: 0.5, ease: "easeInOut" }}
              className="bg-white rounded-3xl shadow-2xl p-8 md:p-12 lg:p-16 relative overflow-hidden"
            >
              {/* Quote Icon */}
              <div className="absolute top-8 right-8 w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center">
                <Quote className="w-8 h-8 text-purple-600" />
              </div>

              <div className="flex flex-col lg:flex-row items-center lg:items-start gap-8 lg:gap-12">
                {/* Avatar Section */}
                <motion.div
                  className="relative flex-shrink-0"
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                >
                  <div className="w-32 h-32 md:w-40 md:h-40 lg:w-48 lg:h-48 relative">
                    <div className="absolute inset-0 bg-gradient-to-br from-purple-400 to-blue-500 rounded-full p-1">
                      <div className="w-full h-full rounded-full bg-white p-2">
                        <div className="w-full h-full rounded-full overflow-hidden">
                          <Image
                            src={
                              currentTestimonial.avatar || "/placeholder.svg"
                            }
                            alt={currentTestimonial.name}
                            width={200}
                            height={200}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Verification Badge */}
                  <div className="absolute -bottom-2 -right-2 bg-green-500 rounded-full p-2 shadow-lg">
                    <CheckCircle className="w-6 h-6 text-white" />
                  </div>
                </motion.div>

                {/* Content Section */}
                <div className="flex-1 text-center lg:text-left">
                  {/* Rating */}
                  <motion.div
                    className="flex justify-center lg:justify-start gap-1 mb-6"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.3 }}
                  >
                    {[...Array(currentTestimonial.rating)].map((_, i) => (
                      <Star
                        key={i}
                        className="w-5 h-5 text-yellow-400 fill-current"
                      />
                    ))}
                  </motion.div>

                  {/* Quote */}
                  <motion.blockquote
                    className="text-xl md:text-2xl lg:text-3xl font-medium text-gray-900 mb-8 leading-relaxed"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.4 }}
                  >
                    "{currentTestimonial.quote}"
                  </motion.blockquote>

                  {/* Author Info */}
                  <motion.div
                    className="mb-8"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.5 }}
                  >
                    <p className="font-bold text-xl text-gray-900">
                      {currentTestimonial.name}
                    </p>
                    <p className="text-gray-600 text-lg">
                      {currentTestimonial.role} at {currentTestimonial.company}
                    </p>
                  </motion.div>

                  {/* Tags */}
                  <motion.div
                    className="flex flex-wrap justify-center lg:justify-start gap-2 mb-8"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.6 }}
                  >
                    {currentTestimonial.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-sm font-medium"
                      >
                        {tag}
                      </span>
                    ))}
                  </motion.div>

                  {/* Metrics */}
                  <motion.div
                    className="grid grid-cols-3 gap-4"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.7 }}
                  >
                    <div className="text-center p-4 bg-gray-50 rounded-xl">
                      <div className="text-2xl font-bold text-purple-600">
                        {currentTestimonial.metrics.timeToVerify}
                      </div>
                      <div className="text-sm text-gray-500">
                        Verification Time
                      </div>
                    </div>
                    <div className="text-center p-4 bg-gray-50 rounded-xl">
                      <div className="text-2xl font-bold text-green-600">
                        {currentTestimonial.metrics.inquiryIncrease}
                      </div>
                      <div className="text-sm text-gray-500">
                        Inquiry Increase
                      </div>
                    </div>
                    <div className="text-center p-4 bg-gray-50 rounded-xl">
                      <div className="text-2xl font-bold text-blue-600">
                        {currentTestimonial.metrics.trustScore}
                      </div>
                      <div className="text-sm text-gray-500">Trust Score</div>
                    </div>
                  </motion.div>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Navigation Arrows */}
          {testimonials.length > 1 && (
            <>
              <button
                type="button"
                onClick={prevTestimonial}
                className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white rounded-full shadow-lg flex items-center justify-center hover:bg-gray-50 transition-colors duration-300"
                aria-label="Previous testimonial"
              >
                <ChevronLeft className="w-6 h-6 text-gray-600" />
              </button>
              <button
                type="button"
                onClick={nextTestimonial}
                className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white rounded-full shadow-lg flex items-center justify-center hover:bg-gray-50 transition-colors duration-300"
                aria-label="Next testimonial"
              >
                <ChevronRight className="w-6 h-6 text-gray-600" />
              </button>
            </>
          )}
        </div>

        {/* Dots Navigation */}
        {testimonials.length > 1 && (
          <motion.div
            className="flex justify-center mt-12 space-x-3"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.8 }}
          >
            {testimonials.map((_, index) => (
              <button
                type="button"
                key={index}
                onClick={() => {
                  setActiveIndex(index);
                  setIsAutoPlaying(false);
                }}
                className={`relative w-3 h-3 rounded-full transition-all duration-300 ${
                  index === activeIndex
                    ? "bg-purple-600 scale-125"
                    : "bg-gray-300 hover:bg-gray-400"
                }`}
                aria-label={`Go to testimonial ${index + 1}`}
              >
                {index === activeIndex && (
                  <motion.div
                    className="absolute inset-0 rounded-full bg-purple-600"
                    layoutId="activeIndicator"
                    transition={{ duration: 0.3 }}
                  />
                )}
              </button>
            ))}
          </motion.div>
        )}
      </div>
    </section>
  );
};

export default TestimonialSection;
