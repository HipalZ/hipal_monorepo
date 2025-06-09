"use client";
import Image from "next/image";
import Trustcred from "@/assets/bluetick/Trustcred.png";
import Star from "@/assets/bluetick/Star.png";
import Popular from "@/assets/bluetick/popular.png";
import Compare from "@/assets/bluetick/compare.png";
import p1 from "@/assets/bluetick/p1.png";
import p2 from "@/assets/bluetick/p2.png";
import p3 from "@/assets/bluetick/p3.png";
import p4 from "@/assets/bluetick/p4.png";
import p5 from "@/assets/bluetick/p5.png";

const NewWay = () => {
  return (
    <>
      <section className="px-4 sm:px-6 lg:px-12 py-16 bg-[#232323]">
        {/* Company logos */}
        <span
          className="flex flex-wrap justify-center md:justify-between gap-6 md:gap-8 mb-16"
          aria-label="Company Logos"
        >
          <Image src={p1} alt="Cube" width={200} priority />
          <Image src={p2} alt="Cube" width={150} priority />
          <Image src={p3} alt="Cube" width={100} priority />
          <Image src={p4} alt="Cube" width={100} priority />
          <Image src={p5} alt="Cube" width={100} priority />
        </span>

        <div className="flex flex-col lg:flex-row items-center pt-20 text-center justify-evenly gap-y-4">
          <h1 className="w-full text-3xl lg:text-4xl 2xl:text-6xl font-bold lg:text-start text-center">
            Why Blue
            <br /> Tick Matters
          </h1>
          <figure className="w-96 lg:w-full">
            <Image src={Compare} alt="Laptop" priority />
          </figure>
          <p className="w-full text-lg lg:text-xl 2xl:text-2xl lg:text-end">
            WhatsApp Blue Tick verification transforms your business
            communication
          </p>
        </div>

        {/* Main heading and description */}
      </section>

      <header className=" text-black text-center gap-8 my-16 bg-[#f9f5f0]">
        <h1 className="flex flex-col lg:flex-row items-center justify-center">
          <span className="text-3xl sm:text-4xl font-bold leading-tight block">
            Unlock Powerful
          </span>
          <span className="text-3xl sm:text-4xl font-bold leading-tight block">
            Business Advantages
          </span>
        </h1>
        <p className="text-black text-sm sm:text-base flex justify-center items-center">
          Get exclusive features that transform your WhatsApp business
          communication
        </p>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-2 items-center justify-center lg:grid-cols-3 gap-6 mb-16">
        <article className="p-6 flex flex-col items-center text-center h-full bg-[#323232] border border-dashed rounded-lg">
          <Image src={Trustcred} alt="Laptop" width={60} height={60} priority />
          <h2 className="text-lg font-semibold mb-2">
            Employee Experience First
          </h2>
          <p className="text-sm text-gray-300">
            Ensuring a helpful remote experience for employees is our top
            priority. We create a personalized space to discuss when moving your
            remote talented. Some companies like it.
          </p>
        </article>

        <article className="p-6 flex flex-col items-center text-center h-full bg-[#1E1E1E] border border-dashed rounded-lg">
          <Image src={Star} alt="Laptop" width={60} height={60} priority />
          <h2 className="text-lg font-semibold mb-2">
            Enable & Support HR Team
          </h2>
          <p className="text-sm text-gray-300">
            Helping all valuable time and resources of your HR team through our
            relocation solution allows them to focus on core business duties.
          </p>
        </article>

        <article className="p-6 flex flex-col items-center text-center h-full bg-[#323232] border border-dashed rounded-lg">
          <Image src={Popular} alt="Laptop" width={60} height={60} priority />
          <h2 className="text-lg font-semibold mb-2">
            Scale Your Business with Ease
          </h2>
          <p className="text-sm text-gray-300">
            Planning to expand your team across borders? Our solution helps
            scale your business as it grows, making sure your best talent is in
            the right place at the right time.
          </p>
        </article>
      </div>
    </>
  );
};

export default NewWay;
