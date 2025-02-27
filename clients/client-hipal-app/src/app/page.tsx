"use client";
import Auto from "@/components/landingPage/automateUpSell";
import EcoSystems from "@/components/landingPage/ecoSystem";
import Footer from "@/components/landingPage/footer";
import HeroSection from "@/components/landingPage/herosection";
import Restaurant from "@/components/landingPage/resturant";
import Services from "@/components/landingPage/services";
import UserExp from "@/components/landingPage/userExp";
import Logo from "@/assets/topsection/logo.svg";
import Image from "next/image";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();
  const goToAllBusiness = () => {
    router.push("/biz");
  };

  return (
    <section className="bg-black">
      <center
        onKeyDown={goToAllBusiness}
        onClick={goToAllBusiness}
      >
        <Image
          className="nav_bar_logo_mobile show_mobile"
          width={30}
          height={30}
          src={Logo}
          alt="Logo"
        />
      </center>
      <Image
        className="nav_bar hide_mobile"
        width={60}
        height={60}
        src={Logo}
        alt="Logo"
      />
      <button type="button" className="nav_btn hide_mobile">
        Contact us
      </button>
      <section style={{ position: "relative" }}>
        <HeroSection />
      </section>
      <div className="hide_mobile">
        <Restaurant />
      </div>
      <section
        style={{
          margin: "3rem 0 2rem 0",
        }}
        className="show_mobile"
      >
        <center>
          <button
            type="button"
            style={{
              backgroundColor: "#4990FB",
              color: "white",
              border: "none",
              padding: "0.5rem 1rem",
              borderRadius: "3rem",
              width: "85%",
              margin: "0 auto",
              maxWidth: "30rem",
            }}
          >
            Contact us
          </button>
        </center>
        <center
          style={{
            margin: "3rem 0 1rem 0",
            fontSize: "1.5rem",
            fontWeight: "200",
            color: "#A1C9FF",
          }}
        >
          What can you do with &nbsp;
          <br />
          <span
            style={{
              fontSize: "1.5rem",
            }}
            className="title"
          >
            HipalZ ?
          </span>
        </center>
        <center>
          <video
            style={{
              margin: "3rem 0",
            }}
            width="250"
            height="500"
            loop
            muted
            autoPlay
          >
            <source src="/fin.mp4" type="video/mp4" />
            Your browser does not support the video tag.
          </video>
        </center>
        <center
          style={{
            fontSize: "1.5rem",
            fontWeight: "500",
            color: "#A1C9FF",
          }}
        >
          Engage your customers <br />
          Directly
        </center>
      </section>
      <section className="mx-6">
        <EcoSystems />
        <Auto />
        <UserExp />
        <Services />
        <Footer />
      </section>
    </section>
  );
}
