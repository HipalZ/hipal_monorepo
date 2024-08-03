import WhatsApp from "@/assets/footer/whatsapp.png";
import Call from "@/assets/footer/call.png";
import Email from "@/assets/footer/gmail.png";
import Love from "@/assets/footer/made_love.png";
import Hipal from "@/assets/footer/big_hipal.png";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { startTransition } from "react";

const Footer = () => {
  const router = useRouter();
  const handleWhatsAppClick = () => {
    alert("Contact us on WhatsApp: +91 73861 42525");
  };

  const handleCallClick = () => {
    alert("Call us at: +91 73861 42525");
  };

  const goToTermsAndCondition = () => {
    startTransition(() => {
      router.push("/hipalzTerms");
    })
  }

  return (
    <section className="footer_container lg:px-[25vh]">
      <button onClick={goToTermsAndCondition} type="button" className="footer_container_love_cont">
        <Image
          className="footer_container_love"
          width={520}
          height={350}
          src={Love}
          alt="Made with love"
        />
      </button>
      <section>
        <section className="footer_container_love_cont">
          <Image
            className="footer_container_hipal_Logo"
            src={Hipal}
            alt="Hipal logo"
          />
        </section>
        <section className="footer_container_hipal">
          <Image
            className="footer_container_hipal_Image"
            width={30}
            height={30}
            src={WhatsApp}
            alt="WhatsApp"
            onClick={handleWhatsAppClick}
          />
          <Image
            className="footer_container_hipal_Image"
            width={30}
            height={30}
            src={Email}
            alt="Email"
          />
          <Image
            className="footer_container_hipal_Image"
            width={30}
            height={30}
            src={Call}
            alt="Call"
            onClick={handleCallClick}
          />
        </section>
      </section>
    </section>
  );
};

export default Footer;
