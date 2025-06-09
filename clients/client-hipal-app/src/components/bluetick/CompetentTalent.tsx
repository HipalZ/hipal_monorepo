"use client";
import { Medal } from "lucide-react";
import Image from "next/image";
import mobile from "@/assets/bluetick/flowermobile.png";
const CompetentTalent = () => {
  return (
    <section className="px-4 sm:px-6 lg:px-8 pt-16">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
        {/* Left side - Image with green background */}
        <div
          style={{
            borderRadius: "0 50% 0 0",
          }}
          className="relative w-[38rem] h-[711px] md:w-[608px] lg:h-[511px] lg:w-[408px] xl:h-[711px] xl:w-[608px] bg-[#6532FF] z-0"
        >
          <div className="absolute w-[10rem] h-[20rem] left-0 bg-[#fff] top-0 z-10" />
          <div className="absolute w-[20rem] h-[10rem] left-0 bg-[#6532FF] top-0 z-20 rounded-b-full" />
          <div className="absolute w-[20rem] h-[10rem] left-0 bg-[#6532FF] top-[10rem] z-20 rounded-t-full" />

          <figure className="absolute w-[20.5rem] right-[13rem] h-[34rem] md:-right-12 top-[8rem] z-30">
            <Image
              src={mobile}
              alt="whatsAppImage"
              width={328}
              height={617}
              className="object-contain w-full h-full"
            />
          </figure>
        </div>

        {/* Right side - Content */}
        <div className="text-[#232323]">
          <h2 className="text-3xl sm:text-4xl font-bold mb-6 leading-tight">
            Why You Need a Blue Tick
          </h2>

          {/* Feature boxes */}
          <ul className="space-y-8">
            {/* Feature 1 */}
            <li className="flex items-start gap-4">
              <div className="mt-1 min-w-6">
                <div className="w-6 h-6 bg-purple-600 rounded flex items-center justify-center">
                  <div className="blue-point w-3 h-3" />
                </div>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Instant Trust:</h3>
                <p className="text-sm ">
                  Customers trust verified businesses 3x more than unverified
                  ones
                </p>
              </div>
            </li>

            {/* Feature 2 */}
            <li className="flex items-start gap-4">
              <div className="mt-1 min-w-6">
                <div className="w-6 h-6 bg-purple-600 rounded flex items-center justify-center">
                  <div className="blue-point w-3 h-3" />
                </div>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Higher Engagement:</h3>
                <p className="text-sm ">
                  Verified accounts see 70% more customer interactions
                </p>
              </div>
            </li>

            <li className="flex items-start gap-4">
              <div className="mt-1 min-w-6">
                <div className="w-6 h-6 bg-purple-600 rounded flex items-center justify-center">
                  <div className="blue-point w-3 h-3" />
                </div>
              </div>
              <div>
                <h3 className="font-semibold mb-2">
                  Professional Credibility:
                </h3>
                <p className="text-sm ">
                  Stand out from competitors with official verification
                </p>
              </div>
            </li>

            <li className="flex items-start gap-4">
              <div className="mt-1 min-w-6">
                <div className="w-6 h-6 bg-purple-600 rounded flex items-center justify-center">
                  <div className="blue-point w-3 h-3" />
                </div>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Better Reach: </h3>
                <p className="text-sm ">
                  WhatsApp prioritizes verified business messages
                </p>
              </div>
            </li>
          </ul>
        </div>
      </div>
    </section>
  );
};

export default CompetentTalent;
