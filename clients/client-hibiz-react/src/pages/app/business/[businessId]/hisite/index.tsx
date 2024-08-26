import HiSiteMiddleImage from "@/assets/hisite/hisiteHeader.png";
import { hisiteServices } from "@/components/templates/businessForm/businessCtrlStore";
import { lazy, memo, useCallback } from "react";
import { FaArrowLeft, FaArrowRight } from "react-icons/fa";
import { useNavigate, useParams } from "react-router-dom";
const HisiteHeader = lazy(() => import("@/components/molecules/hisiteHeader"));

const MemoHiSites = () => {
  const businessId = useParams()?.businessId || "";

  const navigate = useNavigate();

  const handleRoute = useCallback(
    (navigateTo: string) => {
      navigate(`/app/business/${businessId}/${navigateTo}`);
    },
    [businessId],
  );

  const handleThemes = useCallback(() => {
    navigate(`/app/business/${businessId}/businesscontrol`);
  }, [businessId]);

  const goBack = useCallback(() => {
    navigate(`/app/business/${businessId}`);
  }, [businessId]);

  return (
    <main>
      <header className="pb-4 linear_gradient_background">
        <HisiteHeader
          onBack={goBack}
          leftIcon={<FaArrowLeft />}
          rightButton={
            <button
              onClick={handleThemes}
              type="button"
              className="px-4 py-1 scale-75 bg-white rounded-full shadow-lg"
            >
              Themes & Layout
            </button>
          }
          isIconBusinessShow={false}
        >
          <img src={HiSiteMiddleImage} alt="HiSiteMiddleImage" loading="lazy" />
          <h1 className="mt-4 mb-2 text-2xl font-semibold">Hi-sites</h1>
          <p className="mx-16 text-[#7D7D7D]">
            Manage Your business, dishes, offers, rewards and many more
          </p>
        </HisiteHeader>
      </header>
      <section className="flex flex-col gap-4 p-4 lg:flex-row">
        {hisiteServices.map((service) => {
          return (
            <button
              type="button"
              onClick={() => handleRoute(service?.navigateTo)}
              key={service?._id}
              className="shadow-lg w-full max-w-[28rem] rounded-2xl bg-white p-4"
            >
              <header className="relative flex items-center mb-4 space-x-4">
                <img src={service?.icon} alt={service?.icon} loading="lazy" />
                <h1 className="text-lg">{service?.title}</h1>
                <div className="absolute -rotate-45 right-2 top-2">
                  <FaArrowRight />
                </div>
              </header>
              <p className="text-base opacity-50 float-start">
                {service?.description}
              </p>
            </button>
          );
        })}
      </section>
    </main>
  );
};

const HiSites = memo(MemoHiSites);
export default HiSites;
