import MemoizedHeader from "@/components/molecules/header";
import useBusinessData from "@/components/store/useBusinessData";
import { FaArrowLeft } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import Hi from "@/assets/svg/hi.svg";
import { routeToDashboard } from "@/components/utils/routes";
import template from "@/assets/template.jpg";
import { memo, useCallback } from "react";

const MemoWhatsapp = () => {
  const businessData = useBusinessData((s) => s.businessData);
  const navigate = useNavigate();

  const handleBack = useCallback(() => {
    navigate(routeToDashboard(businessData?._id as string));
  }, [navigate, businessData?._id]);

  const Templates = [
    {
      id: 1,
      title: "WhatsApp Template",
      subTitle: "Create and manage your templates to send messages quickly",
      navigate: "templates",
      image: template,
    },
  ];

  return (
    <main>
      <div className="sticky top-0 z-50 w-full linear_gradient_background">
        <MemoizedHeader
          title="WhatsApp"
          onBack={handleBack}
          leftIcon={<FaArrowLeft />}
          rightImage={Hi}
        />
      </div>
      <section>
        <div className="flex flex-wrap">
          {Templates.map((card) => {
            return (
              <button
                type="button"
                key={card.id}
                className="w-[90%] md:w-[45%] lg:w-[30%] m-4 bg-white shadow-md rounded-lg text-left"
                onClick={() =>
                  navigate(
                    `/app/business/${businessData?._id}/${card.navigate}`,
                  )
                }
              >
                <img
                  src={card.image}
                  alt={card.title}
                  className="w-full h-[200px] object-cover object-center rounded-t-lg"
                />
                <div className="p-4">
                  <h2 className="text-xl font-bold">{card.title}</h2>
                  <p className="text-sm text-gray-500">{card.subTitle}</p>
                  <button
                    type="button"
                    className="px-4 py-2 mt-2 text-white bg-black rounded-lg"
                  >
                    Go to {card.title}
                  </button>
                </div>
              </button>
            );
          })}
        </div>
      </section>
    </main>
  );
};

const Whatsapp = memo(MemoWhatsapp);
export default Whatsapp;
