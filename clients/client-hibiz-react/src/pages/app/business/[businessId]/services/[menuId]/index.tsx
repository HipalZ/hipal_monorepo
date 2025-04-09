import MemoizedHeader from "@/components/molecules/header";
import { memo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Manager from "@/assets/menuManager.png";
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
      "Organize Services and Catalogues for efficient Service management and presentation",
    navigate: "serviceManager",
    image: Manager,
  },
  // Uncomment or add more items as needed:
  // {
  //   id: 3,
  //   title: "Menu Banners",
  //   subTitle:
  //     "Promote what makes your place special across different timings and situations",
  //   navigate: "menubanners",
  //   image: Card,
  // },
];

const MemoService = () => {
  const { businessId } = useParams<{ businessId: string }>();
  const navigate = useNavigate();   
    const goBack = () => {
    navigate(`/app/business/${businessId}`);
    }
  return (
    <main>
      <div className="sticky top-0 z-50 w-full linear_gradient_background">
        <MemoizedHeader title="Services Menu" onBack={goBack} />
      </div>
      <section>
        <div className="flex flex-wrap">
          {menuArray.map((menu) => (
            <div
              key={menu.id}
              className="w-[90%] md:w-[45%] lg:w-[30%] m-4 bg-white shadow-md rounded-lg text-left"
            >
              <img
                src={menu.image}
                alt={menu.title}
                className="w-full h-[200px] object-cover object-center rounded-t-lg"
              />
              <div className="p-4">
                <h2 className="text-xl font-bold">{menu.title}</h2>
                <p className="text-sm text-gray-500 h-[4rem]">{menu.subTitle}</p>
                <button
                  type="button"
                  className="px-4 py-2 mt-2 text-white bg-black rounded-lg"
                  onClick={() => navigate(`${menu.navigate}`)}
                >
                  Go to {menu.title}
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
};

const Services = memo(MemoService);
export default Services;
