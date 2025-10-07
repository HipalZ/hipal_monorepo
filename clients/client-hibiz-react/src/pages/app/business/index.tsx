import useBusinessData from "@/components/store/useBusinessData";
import { useOwnerLogin } from "@/components/store/useOwnerLogin";
import type {
  IBusinessData,
  IOutletInfo,
} from "@/components/types/businessData";
import { PAGE_TYPES, routePathsWithId } from "@/components/utils/routes";
import { apiRpc } from "@hi/common";
import { useQuery } from "@tanstack/react-query";
import { memo } from "react";
import { IoWarning } from "react-icons/io5";
import { useNavigate } from "react-router-dom";
import logoPlaceholder from "@/assets/hisite/logoPlaceholder.png";
import { TbHomePlus } from "react-icons/tb";
import useBusinessCtrl from "@/components/store/useBusinessCtrl";
import type { LoyaltyType } from "@hi/db-models/src/validators";
import { useCategoryStore } from "@/components/store/useCategoryStore";
import { useExploreStore } from "@/components/store/useExploreStore";
import MemoizedHeader from "@/components/molecules/header";

const Business = () => {
  const setBanners = useExploreStore((s) => s.setBanners);
  const setBusinessData = useBusinessData((s) => s.setBusinessData);
  const setExistingLoyalty = useBusinessData((s) => s.setExistingLoyalty);
  const { reset } = useBusinessCtrl();
  const user = useOwnerLogin((s) => s.user);
  const navigate = useNavigate();

  const getLoyaltyData = async (business: IBusinessData) => {
    const response = await apiRpc.businesses[":businessId"].loyalty.$get({
      param: {
        businessId: business?._id,
      },
    });
    const loyaltyData = (await response.json()).data as LoyaltyType;
    if (response.status === 200 || response.status === 201) {
      setExistingLoyalty(loyaltyData);
    }
    if (response.status === 404) {
      setExistingLoyalty(null);
    }
    return loyaltyData;
  };

  const getBusinessInfo = async (id: string) => {
    const res = await apiRpc.businesses.outletInfo[":businessId"].$get({
      param: {
        businessId: id,
      },
    });
    const response = await res.json();
    const outletInfo = response.data as IOutletInfo;

    console.log("outletInfo", outletInfo);
    if (res.status === 200 || res.status === 201) {
      useBusinessData.getState().setOutletInfo(outletInfo);

      if (["MENU", "FOOD", "OTHER"].includes(outletInfo?.outLetType)) {
        return navigate(routePathsWithId[PAGE_TYPES.BUSINESS_DETAILS](id));
      }

      if (outletInfo?.outLetType === "HOTEL") {
        return navigate(`/app/hotel/${id}`);
      }

      if (outletInfo?.outLetType === "JEWELLERY") {
        return navigate(`/app/j/${id}`, { replace: true } );
      }
    }
  };

  const handleRoute = async (business: IBusinessData) => {
    setBusinessData(business);
    getLoyaltyData(business);
    useCategoryStore.persist.clearStorage();
    setBanners([]);
    getBusinessInfo(business._id);
  };

  function addBusiness() {
    reset();
    navigate("/app/business/add");
  }

  const { data: sample } = useQuery({
    queryKey: ["getBusinesses", user._id],
    queryFn: () =>
      apiRpc.businesses
        .$get({ query: { id: user._id } })
        .then((res) => res.json()),
    enabled: !!user._id,
  });
  return (
    <section className="min-h-screen">
      <section className="sticky top-0 z-10 w-full px-0">
        <header className="linear_gradient_background">
          <MemoizedHeader title="Businesses" />
        </header>
      </section>
      <div className="parent_business_cards">
        {sample?.data?.map((ele: IBusinessData) => (
          <button
            type="button"
            onClick={() => handleRoute(ele)}
            key={ele._id}
            className={`${
              ele?.status || ele.isActive
                ? "pointer-events-auto"
                : "pointer-events-none opacity-90"
            } child_business_card`}
          >
            <div className="text-xl capitalize">
              {!ele?.status && (
                <div className="flex items-center text-sm text-red-500">
                  <IoWarning /> Under verification
                </div>
              )}
              {!ele?.outlet && (
                <div className="flex items-center text-sm text-[#1877F2]">
                  <TbHomePlus /> Branch @ {ele.parentOutLetId.name}
                </div>
              )}
              <div>{ele?.name}</div>
            </div>
            <div className="aspect-square h-[4rem] w-[4rem] overflow-hidden rounded-full pb-6">
              {ele?.logo ? (
                <img
                  src={ele?.logo}
                  width={66}
                  height={66}
                  alt="Business_logo"
                  loading="lazy"
                  className="aspect-square h-[4rem] w-[4rem]"
                />
              ) : (
                <img
                  src={logoPlaceholder}
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
        className="fixed z-10 px-4 py-3 text-white transform -translate-x-1/2 bg-black rounded-full bottom-4 left-1/2 w-[92%] max-w-[30rem]"
      >
        + Add Business
      </button>
    </section>
  );
};

const MemoizedBusiness = memo(Business);
export default MemoizedBusiness;
