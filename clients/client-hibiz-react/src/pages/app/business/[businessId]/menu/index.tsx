import MemoizedHeader from "@/components/molecules/header";
import useBusinessData from "@/components/store/useBusinessData";
import { routeToDashboard } from "@/components/utils/routes";
import { memo, startTransition } from "react";
import { FaArrowLeft } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import Hi from "@/assets/svg/hi.svg";
import DishAndCat from "@/assets/dishAdbcat.png";
import Manager from "@/assets/menuManager.png";

const menuArray = [
  {
    id: 1,
    title: "Dishes and categories",
    subTitle:
      "Organize dishes and categories for efficient menu management and presentation",
    navigate: "dishandcat",
    image: DishAndCat,
  },
  {
    id: 2,
    title: "Menu Manager",
    subTitle:
      "Organize dishes and categories for efficient menu management and presentation",
    navigate: "manager",
    image: Manager,
  },
];

const MemoMenu = () => {
  const businessData = useBusinessData((s) => s.businessData);
  const navigate = useNavigate();
  const handleBack = () => {
    startTransition(() => {
      navigate(routeToDashboard(businessData?._id as string));
    });
  };
  return (
    <main className="">
      <div className="sticky top-0 z-50 w-full linear_gradient_background">
        <MemoizedHeader
          title="Menu"
          onBack={handleBack}
          leftIcon={<FaArrowLeft />}
          centerImage={Hi}
          rightImage={Hi}
          isIconBusinessShow={false}
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
const Menu = memo(MemoMenu);
export default Menu;
