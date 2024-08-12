import CardOne from "@/assets/cards/card23.png";
import useBusinessData from "@/components/store/useBusinessData";
import { useOwnerLogin } from "@/components/store/useOwnerLogin";
import { gsap } from "gsap";
import { Draggable } from "gsap/Draggable";
import { useEffect, useRef } from "react";

const points = [
  "Create a loyalty card in 5 easy steps 😋",
  "Join countless businesses enhancing their customer relationships with our easy-to-use loyalty card system🔥",
  "Create your personalized card in minutes & customize it to stand out 💯",
  "Don’t miss out—start building lasting connections that drive repeat business 🚀",
];

const Loyalty = () => {
  const cardRef = useRef<HTMLDivElement>(null);

  const businessData = useBusinessData((s) => s.businessData);
  const userDetails = useOwnerLogin((s) => s.user);

  useEffect(() => {
    gsap.registerPlugin(Draggable);
  
    if (cardRef.current) {
      Draggable.create(cardRef.current, {
        type: "rotation",
        onDrag: (event) => {
          const rotationX = event.deltaY / 5;
          const rotationY = event.deltaX / 5;
          gsap.to(event.target, {
            rotationX: `+=${rotationX}`,
            rotationY: `+=${rotationY}`,
            transformPerspective: 1000,
            ease: "elastic.out(1, 0.3)",
          });
        },
        onThrowUpdate: (event) => {
          const rotationX = event.deltaY / 5;
          const rotationY = event.deltaX / 5;
          gsap.to(event.target, {
            rotationX: `+=${rotationX}`,
            rotationY: `+=${rotationY}`,
            transformPerspective: 1000,
            ease: "elastic.out(1, 0.3)",
          });
        },
      });
    }
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
            src={CardOne}
            alt="CardOne"
            className="object-cover w-full h-full rounded-2xl"
          />
          <figure className="absolute text-white top-4 left-4 h-[5rem] aspect-square w-[5rem] rounded-xl">
            <img className="rounded-xl" width={75} height={75} src={businessData?.logo} alt=" logo" />
          </figure>
          <h3 className="absolute text-white bottom-4 left-4">{userDetails.name || "name"}</h3>
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
        <button type="button" className="bottom_btn md:!w-[28rem]">
          Get Started
        </button>
      </main>
    </section>
  );
};

export default Loyalty;
