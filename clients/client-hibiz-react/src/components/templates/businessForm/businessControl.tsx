import useBusinessCtrl from "@/components/store/useBusinessCtrl";
import Img from "@/assets/background.png";
import { memo, startTransition, useCallback } from "react";
import { FaArrowRight } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { businessCtrlServices } from "./businessCtrlStore";
import useBusinessData from "@/components/store/useBusinessData";

const BusinessControl = () => {
  const setStep = useBusinessCtrl((state) => state.setStep);
  const businessData = useBusinessData((state) => state.businessData);
  const { setPrimaryColor, setSecondaryColor, setExploreLayout, setMenuLayout } = useBusinessCtrl(s => ({
    setPrimaryColor: s.setPrimaryColor,
    setSecondaryColor: s.setSecondaryColor,
    setExploreLayout: s.setExploreLayout,
    setMenuLayout: s.setMenuLayout
  }));

  const navigate = useNavigate();
  const goToNextStep = useCallback((step: number) => {
    setStep(step);
    if (step === 1) {
      setPrimaryColor(businessData?.primaryColor || "#000000");
      setSecondaryColor(businessData?.secondaryColor || "#ffffff");
      setExploreLayout(businessData?.exploreLayout);
      setMenuLayout(businessData?.menuLayout);
    }
  }, []);

  const navigateService = useCallback((service: string) => {
    startTransition(() => {
      navigate(`/app/business/${businessData?._id}/${service}`);
    });
  }, []);

  return (
    <>
      <article className="card-background">
        <figcaption className="card">
          <h4>Set the theme</h4>
          <small>Set your layout & themes</small>
          <button
            type="button"
            onClick={() => goToNextStep(1)}
            className="w-16 px-4 py-1 mt-2 text-white bg-black rounded-3xl"
          >
            Set
          </button>
        </figcaption>
        <figcaption className="big-card">
          <h3>Set the theme</h3>
          <h4>Set your layout & themes</h4>
          <button
            type="button"
            onClick={() => goToNextStep(1)}
            className="w-24 px-6 py-1 mt-6 text-xl text-white bg-black rounded-3xl"
          >
            Set
          </button>
        </figcaption>
        <img className="image-class" src={Img} alt="Avatar" />
      </article>
      <section className="px-6 pt-6 text-xl font-semibold pb-[5rem]">
        <h3>Your Features</h3>
        <div className="business_control_services_grid">
          {businessCtrlServices.map((service) => (
            <article key={service.Title} className="business_control_services">
              <figure>
                <img
                  width={60}
                  height={60}
                  src={service.image}
                  alt={service.Title}
                />
              </figure>
              <figcaption className="ml-4">
                <h4 className="text-lg font-medium">{service.Title}</h4>
                {service.navigation && (
                  <FaArrowRight
                    onClick={() => navigateService(service.navigation)}
                    className="absolute right-4 top-4"
                  />
                )}
                <div className="flex flex-wrap">
                  {service.tags.map((tag) => (
                    <div
                      key={tag}
                      className="px-4 py-2 m-1 text-xs text-[#6F649B] bg-[#F2F1F6] rounded-full"
                    >
                      {tag}
                    </div>
                  ))}
                </div>
              </figcaption>
            </article>
          ))}
        </div>
      </section>
    </>
  );
};

const MemoBusinessControl = memo(BusinessControl);

export default MemoBusinessControl;
