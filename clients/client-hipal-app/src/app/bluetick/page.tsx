"use client";

import BlueTickHero from "@/components/bluetick/BlueTickHero";
import Bottom from "@/components/bluetick/Bottom";
import CompetentTalent from "@/components/bluetick/CompetentTalent";
import Faq from "@/components/bluetick/Faq";
import MissionSection from "@/components/bluetick/MissionSection";
import Navbar from "@/components/bluetick/Navbar";
import NewWay from "@/components/bluetick/NewWay";
import TestimonialSection from "@/components/bluetick/TestimonialSection";

const page = () => {
  return (
    <section className="bg-[#F9F5F0] overflow-hidden">
      <Navbar />
      <BlueTickHero />
      <NewWay />
      <CompetentTalent />
      <MissionSection />
      <Faq />
      <TestimonialSection />
      <Bottom />
    </section>
  );
};

export default page;
