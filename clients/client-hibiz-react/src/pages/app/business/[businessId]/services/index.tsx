import MemoizedHeader from "@/components/molecules/header";
import useBusinessData from "@/components/store/useBusinessData";
import { memo } from "react";
import { FaArrowLeft } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import Hi from "@/assets/svg/hi.svg";
import Manager from "@/assets/menuManager.png";
import Card from "@/assets/cards/card62.png";
import service from "@/assets/services/services.png";

const menuArray = [
  {
    id: 1,
    title: "Services",
    subTitle: "Organize services for efficient management and presentation",
    navigate: "allservices",
    image: service,
  },
  {
    id: 2,
    title: "Service Manager",
    subTitle:
      "Organize dishes and categories for efficient menu management and presentation",
    navigate: "serviceManager",
    image: Manager,
  },
  //   {
  //     id: 3,
  //     title: "Menu Banners",
  //     subTitle:
  //       "Promote what makes your place special across different timings and situations",
  //     navigate: "menubanners",
  //     image: Card,
  //   },
];

const MemoService = () => {
  const businessData = useBusinessData((s) => s.businessData);
  const navigate = useNavigate();
  const handleBack = () => {
    navigate(`/app/business/${businessData?._id}`);
  };
  return (
    <main className="">
      <div className="sticky top-0 z-50 w-full linear_gradient_background">
        <MemoizedHeader
          title="Services Menu"
          onBack={handleBack}
          leftIcon={<FaArrowLeft />}
          rightImage={Hi}
        />
      </div>
      <section>
        <div className="flex flex-wrap">
          {menuArray.map((menu) => {
            return (
              <button
                type="button"
                key={menu.id}
                className="w-[90%] md:w-[45%] lg:w-[30%] m-4 bg-white shadow-md rounded-lg text-left"
                onClick={() =>
                  navigate(
                    `/app/business/${businessData?._id}/${menu.navigate}`,
                  )
                }
              >
                <img
                  src={menu.image}
                  alt={menu.title}
                  className="w-full h-[200px] object-cover object-center rounded-t-lg"
                />
                <div className="p-4">
                  <h2 className="text-xl font-bold">{menu.title}</h2>
                  <p className="text-sm text-gray-500">{menu.subTitle}</p>
                  <button
                    type="button"
                    className="px-4 py-2 mt-2 text-white bg-black rounded-lg"
                  >
                    Go to {menu.title}
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
const Services = memo(MemoService);
export default Services;
