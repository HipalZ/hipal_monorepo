import { useState, useEffect, useRef,memo, useCallback } from "react";
import useBusinessData from "@/components/store/useBusinessData";
import { useOwnerLogin } from "@/components/store/useOwnerLogin";
import CardOne from "@/assets/cards/card21.png";
import CardTwo from "@/assets/cards/card22.png";
import CardThree from "@/assets/cards/card23.png";
import { useLoyalty } from "@/components/store/useLoyalty";

const points = [
  "Create a loyalty card in 5 easy steps 😋",
  "Join countless businesses enhancing their customer relationships with our easy-to-use loyalty card system🔥",
  "Create your personalized card in minutes & customize it to stand out 💯",
  "Don’t miss out—start building lasting connections that drive repeat business 🚀",
];

const cards = [CardOne, CardTwo, CardThree];


const MemoGetStarted = () => {

    const [currentCard, setCurrentCard] = useState(0);
    const [fade, setFade] = useState(true);
    const cardRef = useRef<HTMLDivElement>(null);
    const businessData = useBusinessData((s) => s.businessData);
    const userDetails = useOwnerLogin((s) => s.user);

    const {  setSelectedPage } = useLoyalty();

    const goToCardSelection = useCallback(() => {
        setSelectedPage("CARD_SELECTION");
      },[]);

    useEffect(() => {
        const intervalId = setInterval(() => {
          setFade(false);
          setTimeout(() => {
            setCurrentCard((prevCard) => (prevCard + 1) % cards.length);
            setFade(true);
          }, 500);
        }, 3000);
    
        return () => clearInterval(intervalId);
      }, []);
  return (
    <section className="loyalty_background">
    <main className="flex items-center justify-center">
      <h3 className="absolute top-[3rem] md:text-2xl lg:text-3xl z-10 text-xl text-white transform -translate-x-1/2 -translate-y-1/2 left-1/2">
        Loyalty Cardz
      </h3>
      <div className="circle_Loyalty_page md:hidden" />
      <article
        ref={cardRef}
        className="relative z-10 w-[20rem] max-w-[24rem] md:scale-110 loyalty_card_rotate bg-[#ffffff50] h-[11.5rem] rounded-2xl"
        style={{
          transformStyle: "preserve-3d",
          transformOrigin: "center",
          top: "17dvh",
        }}
      >
        <img
          src={cards[currentCard]}
          alt={`Card ${currentCard + 1}`}
          className={`object-cover w-full h-full rounded-2xl transition-all duration-1000 ease-in-out ${
            fade
              ? "opacity-100 filter-none"
              : "opacity-0 filter-grayscale"
          }`}
        />
        <figure className="absolute text-white top-4 left-4 h-[5rem] aspect-square w-[5rem] rounded-xl">
          <img
            className="rounded-xl"
            width={75}
            height={75}
            src={businessData?.logo}
            alt=" logo"
          />
        </figure>
        <h3 className="absolute text-white bottom-4 left-4">
          {userDetails.name || "name"}
        </h3>
      </article>
      <article
        style={{ height: "calc(100dvh - 22rem)" }}
        className="fixed bottom-0 bg-[#f3f3f3] z-0 w-full max-w-[30rem] md:!h-[55vh]"
      >
        <div className="w-full bg-[#FDB853] rounded-[50%] -mt-[1.75rem] h-[3.5rem]" />
        <h3 className="text-[#000000] text-lg font-[600] mt-4 ml-6 md:text-2xl">
          Unlock the Power of Customer Loyalty
        </h3>
        <section className="mx-6">
          {points.map((point) => (
            <p
              key={crypto.randomUUID()}
              className="text-[#000000] text-sm font-[600] opacity-75 md:text-lg mt-1 relative pl-4 before:content-['\2022'] before:absolute before:left-0 before:text-black"
            >
              {point}
            </p>
          ))}
        </section>
      </article>
      <button onClick={goToCardSelection} type="button" className="bottom_btn md:!w-[28rem]">
        Get Started
      </button>
    </main>
  </section>
  )
}

const GetStarted = memo(MemoGetStarted)

export default GetStarted