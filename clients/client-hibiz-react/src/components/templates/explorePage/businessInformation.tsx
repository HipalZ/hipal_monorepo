import { lazy, memo, useEffect } from "react";
import { apiRpc } from "@hi/common";
import { useParams } from "react-router-dom";
import {
  ExplorePages,
  useExploreStore,
} from "@/components/store/useExploreStore";
import toast from "react-hot-toast";
import useShowErrorToasts from "@/components/atom/errorToasts";
import type { IBizPayload } from "@/components/types/businessData";
import LoadingSpinner from "@/components/atom/loadingSpinner";
import { useExploreTemp } from "@/components/store/useExploreTemp";
import { useBizInfoChanges } from "../../helpers/bizInforHelpers";
import { filterPayload } from "@/components/utils/helper";
import { useQueryClient } from "@tanstack/react-query";
import useBusinessData from "@/components/store/useBusinessData";

const PopUp = lazy(() => import("@/components/atom/popUp"));
const BasicInformationSection = lazy(
  () => import("../businessInformation/basicInformation"),
);
const BottomButton = lazy(() => import("@/components/atom/bottomButton"));
const ContactInfo = lazy(() => import("../businessInformation/contactInfo"));
const CustomTimings = lazy(
  () => import("../businessInformation/customTimings"),
);

const MemoBizInfo = () => {
  const outletInfo = useBusinessData((s) => s.outletInfo);
  const {
    setToggleBizInfo,
    toggleBizInfo,
    toggleExplorePages,
    setToggleExplorePages,
  } = useExploreStore((state) => ({
    toggleBizInfo: state.toggleBizInfo,
    setToggleBizInfo: state.setToggleBizInfo,
    toggleExplorePages: state.toggleExplorePages,
    setToggleExplorePages: state.setToggleExplorePages,
  }));

  const {
    isLoading,
    setIsLoading
  } = useExploreTemp((s) => ({
    isLoading: s.isLoading,
    setIsLoading: s.setIsLoading
  }))

  const queryClient = useQueryClient();
  const { businessId, hotelId } = useParams();
  const showErrorToasts = useShowErrorToasts();
  // Temporary state variables
  const {
    description,
    phone,
    location,
    avgPricingForTwo,
    tags,
    amenities,
    address,
    openTimings,
    showCustomTime,
    customTimings,
    fixedTime,
    updateBizInfo,
  } = useExploreTemp((s) => ({
    description: s.description,
    phone: s.phone,
    setPhone: s.setPhone,
    location: s.location,
    avgPricingForTwo: s.avgPricingForTwo,
    tags: s.tags,
    amenities: s.amenities,
    address: s.address,
    openTimings: s.openTimings,
    showCustomTime: s.showCustomTime,
    customTimings: s.customTimings,
    fixedTime: s.fixedTime,
    updateBizInfo: s.updateBizInfo,
  }));

  const { bizInfo, setBizInfo } = useExploreStore((s) => ({
    bizInfo: s.bizInfo,
    setBizInfo: s.setBizInfo,
  }));

  const { handleTimings } = useBizInfoChanges();

  useEffect(() => {
    updateBizInfo(bizInfo);
  }, []);

  const handleSaveChanges = () => {
    setBizInfo({
      ...bizInfo,
      description: description,
      phone: phone,
      location: location,
      avgPricingForTwo: avgPricingForTwo,
      tags: tags.filter((tag) => tag.trim() !== ""),
      ...(outletInfo?.outLetType !== "HOTEL" ? { amenities: amenities } : { newAmenities: amenities }),
      fixOpenTime: fixedTime?.openTime,
      fixCloseTime: fixedTime?.closeTime,
      customTiming: customTimings,
      address: address,
    });
    toast.success("Timings saved");
    handleTimings();
  };

  const handleCreateInfo = async (e) => {
    e.preventDefault();
    if (!businessId && !hotelId) return;
    setIsLoading(true);
    const payload: IBizPayload = {
      businessId: businessId || hotelId,
      isCustomTime: showCustomTime,
      description: description,
      phone: phone,
      location: location,
      avgPricingForTwo: avgPricingForTwo,
      tags: tags.filter((tag) => tag.trim() !== ""),
      ...(outletInfo?.outLetType !== "HOTEL" ? { amenities: amenities } : { newAmenities: amenities }),
      fixOpenTime: fixedTime?.openTime,
      fixCloseTime: fixedTime?.closeTime,
      customTiming: customTimings.filter(
        (timing) => timing.openTime || timing.closeTime,
      ),
      address: address,
    };
    const filteredPayload = filterPayload(payload);

    let res: { status: number };
    if (bizInfo?._id === "") {
      res = await apiRpc.businesses.outletInfo.$post({
        json: filteredPayload,
      });
    }

    if (bizInfo?._id !== "" || (res && res.status === 409)) {
      const outletInfo = await apiRpc.businesses.outletInfo.update[
        ":businessId"
      ].$put({
        json: filteredPayload,
        param: {
          businessId: businessId || hotelId,
        },
      });
      const outletInfoData: IBizPayload = await outletInfo.json();
      if (outletInfo.status === 200 || outletInfo.status === 201) {
        queryClient.invalidateQueries({ queryKey: ["bizInfo"] });
        toast.success("Data saved successfully");
        setToggleBizInfo(!toggleBizInfo);
        if (toggleExplorePages === ExplorePages.BIZINFO) {
          setToggleExplorePages(ExplorePages.MAINFORM);
        }
      } else if (outletInfo.status === 400) {
        showErrorToasts(outletInfoData?.error);
      }
    }
    setIsLoading(false);
  };

  return (
    <form onSubmit={handleCreateInfo} className="px-4">
      <BasicInformationSection />
      <ContactInfo />
      <button
        className="fixed bottom-2 w-[88%] rounded-full bg-black text-white text-center py-3 left-6 right-6 md:max-w-[26rem]
         md:left-0 md:right-0 md:mx-auto"
        type="submit"
      >
        Save
      </button>
      <br />
      <PopUp show={openTimings} onClose={handleTimings}>
        <section className="p-4 h-[80vh] overflow-y-scroll bg-gray-100 rounded-2xl pb-[5rem]">
          <CustomTimings />
          <BottomButton
            buttons={[
              {
                text: "Save",
                onClick: handleSaveChanges,
                type: "button",
              },
            ]}
          />
        </section>
      </PopUp>
      {isLoading && <LoadingSpinner />}
    </form>
  );
};

const BizInformation = memo(MemoBizInfo);
export default BizInformation;
