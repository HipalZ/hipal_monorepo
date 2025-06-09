'use client';

import Link from 'next/link';

const InfoSection = () => {
  return (
    <section className="bg-[#f9f871] py-12 md:py-16 lg:py-20 px-4 md:px-8 relative">
      <div className="flex flex-col md:flex-row items-center justify-between gap-8 md:gap-12 lg:gap-16">
        {/* Left content */}
        <div className="w-full md:w-1/2 z-10">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
            Understand your cashflow business
          </h2>
          <p className="text-gray-800 mb-6 max-w-lg">
            Gain complete visibility into your financial operations with our comprehensive analytics
            platform.
          </p>
        </div>

        {/* Right content */}
        <div className="w-full md:w-1/2 z-10">
          <div className="bg-white p-6 md:p-8 rounded-lg shadow-md">
            <p className="text-gray-800 mb-6">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed ac velit eget leo
              vulputate felis. Aliquam rhoncus.
            </p>
            <Link
              href="/started"
              className="inline-block bg-purple-600 hover:bg-purple-700 text-white font-medium py-3 px-6 rounded-full transition-colors duration-300"
            >
              Get Started Free
            </Link>
          </div>
        </div>
      </div>

      {/* Decorative shape at the bottom */}
      <div className="absolute bottom-0 left-0 right-0 h-16 md:h-24 lg:h-32 w-full">
        <svg
          viewBox="0 0 1440 74"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="absolute bottom-0 w-full h-auto"
          preserveAspectRatio="none"
        >
          <path
            d="M0,37 C240,74 480,0 720,37 C960,74 1200,0 1440,37 L1440,74 L0,74 Z"
            fill="#1F1F1F"
          />
        </svg>
      </div>
    </section>
  );
};

export default InfoSection;
