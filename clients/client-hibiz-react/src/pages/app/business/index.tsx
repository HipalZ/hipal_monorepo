import HipeopleLogo from "@/assets/hibizNewLogo.png";
import hipalHandLogo from "@/assets/login/hand.png";
import Header from "@/components/molecules/header";
import useBusinessData from "@/components/store/useBusinessData";
import { useOwnerLogin } from "@/components/store/useOwnerLogin";
import type { IBusinessData } from "@/components/types/businessData";
import { PAGE_TYPES, routePathsWithId } from "@/components/utils/routes";
import { apiRpc } from "@hi/common";
import { useQuery } from "@tanstack/react-query";
import { memo, startTransition } from "react";
import { FaArrowLeft } from "react-icons/fa";
import { IoWarning } from "react-icons/io5";
import { TbHomePlus } from "react-icons/tb";
import { useNavigate } from "react-router-dom";

const Business = () => {
  const setBusinessData = useBusinessData((s) => s.setBusinessData);
  const user = useOwnerLogin((s) => s.user);
  const navigate = useNavigate();
  const handleRoute = async (business: IBusinessData) => {
    setBusinessData(business);
    startTransition(() => {
      navigate(routePathsWithId[PAGE_TYPES.BUSINESS_DETAILS](business._id));
    });
  };

  function addBusiness() {
    startTransition(() => {
      navigate("/app/business/add");
    });
  }

  const {
    data: sample,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["getBusinesses", user._id],
    queryFn: () =>
      apiRpc.businesses
        .$get({ query: { id: user._id } })
        .then((res) => res.json()),
    enabled: !!user._id,
  });
  return (
    <main className="h-screen">
      <div className="business_gradient">
        <section className="sticky top-0 z-10 w-full px-0 pb-4">
          <Header
            leftIcon={<FaArrowLeft />}
            centerImage={HipeopleLogo}
            rightImage={HipeopleLogo}
            isIconBusinessShow={user.role !== "RESTAURANT_MANAGER"}
          />
        </section>
        <section className="business_gradient_hero_section">
          <div className="h-[4rem] w-[4rem] rounded-full bg-[#000000] pt-4 text-center text-xl capitalize">
            {user?.name?.charAt(0)}
          </div>
          <article className="pl-4">
            <div className="flex h-[1.25rem] w-full items-center text-2xl text-[#000000]">
              <img
                width={16}
                height={16}
                src={hipalHandLogo}
                alt="hipalHandLogo"
              />
              <span className="ml-2 font-bold">Hi</span>
            </div>
            <div className="text-base font-medium leading-8 text-[#000000]">
              {user.name}
            </div>
          </article>
        </section>
      </div>
      <div className="parent_business_cards">
        {sample?.data?.map((ele: IBusinessData) => (
          <button
            type="button"
            onClick={() => handleRoute(ele)}
            key={ele._id}
            className={`${
              ele?.status
                ? "pointer-events-auto"
                : "pointer-events-none opacity-75"
            } child_business_card`}
          >
            <div className="text-xl capitalize">
              {/* {ele?.status && (
                <div className="flex items-center text-sm text-red-500">
                  <IoWarning /> Under verification
                </div>
              )} */}
              {/* {ele?.status && (
                <div className="flex items-center text-sm text-[#1877F2]">
                  <TbHomePlus /> Branch @Old Tree Cafe...
                </div>
              )} */}
              <div>{ele?.name}</div>
            </div>
            <div className="aspect-square h-[4rem] w-[4rem] overflow-hidden rounded-full pb-6">
              {ele?.logo && (
                <img
                  src={ele?.logo}
                  width={66}
                  height={66}
                  alt="Business_logo"
                  loading="lazy"
                  className="aspect-square h-[4rem] w-[4rem]"
                />
              )}
            </div>
          </button>
        ))}
      </div>
      <button
        type="button"
        onClick={addBusiness}
        className="bottom_btn on_active_bounce"
      >
        + Add Business
      </button>
    </main>
  );
};

const MemoizedBusiness = memo(Business);
export default MemoizedBusiness;
