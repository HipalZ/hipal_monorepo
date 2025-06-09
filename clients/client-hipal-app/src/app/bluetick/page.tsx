import BlueTickHero from "@/components/bluetick/BlueTickHero";
import Bottom from "@/components/bluetick/Bottom";
import CompetentTalent from "@/components/bluetick/CompetentTalent";
import Faq from "@/components/bluetick/Faq";
import MissionSection from "@/components/bluetick/MissionSection";
import Navbar from "@/components/bluetick/Navbar";
import NewWay from "@/components/bluetick/NewWay";
import TestimonialSection from "@/components/bluetick/TestimonialSection";
import { BUSINESS_KEYID } from "@/configs/index";

export async function generateMetadata() {
  const description =
    "Boost your brand with a verified WhatsApp account (blue tick) in just 7 days. Start campaigns confidently — only 10% upfront.";
  const name = "Hipalz BlueTick";

  return {
    title: name,
    description,
    icons: {
      icon: "/favicon.ico",
    },
    alternates: {
      canonical: `${BUSINESS_KEYID}/bluetick`,
    },
    openGraph: {
      title: name,
      description,
      url: `${BUSINESS_KEYID}/bluetick`,
      type: "website",
    },
  };
}

const page = () => {
  return (
    <section className="bg-[#F9F5F0] overflow-hidden">
      <Navbar />
      <section className="bg-[#F9F5F0] max-w-7xl mx-auto">
        <BlueTickHero />
        <NewWay />
        <CompetentTalent />
        <MissionSection />
        <Faq />
        <TestimonialSection />
      </section>
      <Bottom />
    </section>
  );
};

export default page;
