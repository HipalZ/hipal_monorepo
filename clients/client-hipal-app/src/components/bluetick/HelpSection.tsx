'use client';

import Image from 'next/image';

const HelpSection = () => {
  return (
    <section className="bg-white py-12 md:py-16 lg:py-20 px-4 md:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Section Title */}
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900">
            How can we help you?
          </h2>
        </div>

        {/* Help Options */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          {/* Left Column - Options */}
          <div className="space-y-8">
            {/* Option 1 */}
            <div className="border-b border-gray-200 pb-8">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-semibold mb-2">Save Valuable Time</h3>
                  <p className="text-gray-600 text-sm">
                    Delight your employees and HR teams, making onboarding a rewarding experience.
                  </p>
                </div>
                <div className="flex-shrink-0">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M14 5l7 7m0 0l-7 7m7-7H3"
                    />
                  </svg>
                </div>
              </div>
            </div>

            {/* Option 2 */}
            <div className="border-b border-gray-200 pb-8">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-semibold mb-2">Attract & Retain Top Talent</h3>
                  <p className="text-gray-600 text-sm">
                    Provide exceptional support to attract and keep the best international talent.
                  </p>
                </div>
                <div className="flex-shrink-0">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M14 5l7 7m0 0l-7 7m7-7H3"
                    />
                  </svg>
                </div>
              </div>
            </div>

            {/* Option 3 */}
            <div>
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-semibold mb-2">Engagement Productivity</h3>
                  <p className="text-gray-600 text-sm">
                    Boost employee engagement and productivity through seamless integration.
                  </p>
                </div>
                <div className="flex-shrink-0">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M14 5l7 7m0 0l-7 7m7-7H3"
                    />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Featured Option */}
          <div className="relative">
            {/* Purple Background */}
            <div className="bg-purple-600 rounded-lg p-6 h-64 md:h-72 lg:h-80 relative overflow-hidden">
              <div className="absolute inset-0 flex items-center justify-center">
                <Image
                  src="/images/clock-person.jpg"
                  alt="Person with clock"
                  width={300}
                  height={300}
                  className="object-cover"
                />
              </div>
            </div>

            {/* Info Box */}
            <div className="bg-gray-900 text-white p-6 rounded-tr-full absolute bottom-0 left-0 right-0 transform translate-y-1/4 mx-4">
              <h3 className="text-xl font-semibold mb-2">Save Valuable Time</h3>
              <p className="text-gray-300 text-sm">
                Managing international talent can take up to 3-5x more time than managing local
                talent.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HelpSection;
