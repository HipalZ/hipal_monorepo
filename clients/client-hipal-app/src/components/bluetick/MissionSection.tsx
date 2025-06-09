"use client";

import Image from "next/image";

const MissionSection = () => {
  return (
    <section className="bg-[#f8f6f1] py-12 md:py-16 lg:py-20 px-4 md:px-8 text-[#252223]">
      {/* Mission Statement */}
      <div className="flex flex-col lg:flex-row  justify-between gap-8 lg:gap-16 mb-16">
        <h2 className="text-2xl md:text-3xl lg:text-3xl font-bold mb-4">
          Stand out with trust and credibility{" "}
          <span className="text-gray-400 text-2xl">
            Get your business Meta Verified and elevate customer confidence
            instantly.
          </span>
        </h2>

        <button
          type="button"
          className="bg-[#703BF7] rounded-lg w-full h-fit text-white py-2"
        >
          Connect with us now
        </button>
      </div>

      {/* Stats Section */}
      <div className="border-t border-b border-gray-200 py-10 mb-16 grid grid-cols-1 md:grid-cols-3 gap-8">
        <p className="flex flex-col items-center md:items-start">
          <span className="text-5xl text-[#6532FF] font-extrabold">2x</span>
          <span className="text-sm text-gray-500 mt-2">Reply Rate</span>
        </p>

        <p className="flex flex-col items-center md:items-start">
          <span className="text-5xl text-[#6532FF] font-extrabold">85%</span>

          <span className="text-sm text-gray-500 mt-2">Better Conversion</span>
        </p>

        <p className="flex flex-col items-center md:items-start">
          <span className="text-5xl text-[#6532FF] font-extrabold">132+</span>

          <span className="text-sm text-gray-500 mt-2">
            Verified Businesses
          </span>
        </p>
      </div>
    </section>
  );
};

export default MissionSection;
