import { lazy, memo, useEffect } from "react";
import { apiRpc } from "@hi/common";
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
const BottomButton = lazy(() => import("@/components/atom/bottomButton"));
const ContactInfo = lazy(
  () => import("@/components/templates/businessInformation/contactInfo.tsx"),
);
const BasicInformationSection = lazy(
  () =>
    import("@/components/templates/businessInformation/basicInformation.tsx"),
);

const MemoBizJewelleryInfo = () => {
  const outletInfo = useBusinessData((s) => s.outletInfo);
  const setToggleBizInfo = useExploreStore((s) => s.setToggleBizInfo);
  const toggleBizInfo = useExploreStore((s) => s.toggleBizInfo);
  const toggleExplorePages = useExploreStore((s) => s.toggleExplorePages);
  const setToggleExplorePages = useExploreStore((s) => s.setToggleExplorePages);
  const isLoading = useExploreTemp((s) => s.isLoading);
  const setIsLoading = useExploreTemp((s) => s.setIsLoading);
  const queryClient = useQueryClient();
  const showErrorToasts = useShowErrorToasts();
  const description = useExploreTemp((s) => s.description);
  const phone = useExploreTemp((s) => s.phone);
  const location = useExploreTemp((s) => s.location);
  const avgPricingForTwo = useExploreTemp((s) => s.avgPricingForTwo);
  const tags = useExploreTemp((s) => s.tags);
  const amenities = useExploreTemp((s) => s.amenities);
  const address = useExploreTemp((s) => s.address);
  const openTimings = useExploreTemp((s) => s.openTimings);
  const showCustomTime = useExploreTemp((s) => s.showCustomTime);
  const customTimings = useExploreTemp((s) => s.customTimings);
  const fixedTime = useExploreTemp((s) => s.fixedTime);
  const updateBizInfo = useExploreTemp((s) => s.updateBizInfo);
  const currencyCode = useExploreTemp((s) => s.currencyCode);
  const currencySymbol = useExploreTemp((s) => s.currencySymbol);
  const bizInfo = useExploreStore((s) => s.bizInfo);
  const setBizInfo = useExploreStore((s) => s.setBizInfo);

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
      ...(outletInfo?.outLetType !== "HOTEL"
        ? { amenities: amenities }
        : { newAmenities: amenities }),
      fixOpenTime: fixedTime?.openTime,
      fixCloseTime: fixedTime?.closeTime,
      customTiming: customTimings,
      address: address,
      currencyCode: currencyCode,
      currencySymbol: currencySymbol,
    });
    toast.success("Timings saved");
    handleTimings();
  };

  const handleCreateInfo = async (e) => {
    e.preventDefault();
    if (!outletInfo.businessId) return;
    setIsLoading(true);
    const payload: IBizPayload = {
      businessId: outletInfo.businessId || "",
      isCustomTime: showCustomTime,
      description: description,
      phone: phone,
      location: location,
      avgPricingForTwo: avgPricingForTwo,
      tags: tags.filter((tag) => tag.trim() !== ""),
      ...(outletInfo?.outLetType !== "HOTEL"
        ? { amenities: amenities }
        : { newAmenities: amenities }),
      fixOpenTime: fixedTime?.openTime,
      fixCloseTime: fixedTime?.closeTime,
      customTiming: customTimings.filter(
        (timing) => timing.openTime || timing.closeTime,
      ),
      address: address,
      currencyCode: currencyCode,
      currencySymbol: currencySymbol,
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
          businessId: outletInfo.businessId || "",
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

const BizJewelleryInformation = memo(MemoBizJewelleryInfo);
export default BizJewelleryInformation;
