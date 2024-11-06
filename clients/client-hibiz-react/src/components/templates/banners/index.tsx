import { lazy, memo, Suspense } from "react";
import { useParams } from "react-router-dom";
import type { IBannerPayload } from "@/components/types/businessData";
import { apiRpc } from "@hi/common";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { FaTrash } from "react-icons/fa";
import { cn } from "@/components/utils/helper";
import toast from "react-hot-toast";
import { PiSealWarningFill } from "react-icons/pi";
import { useBannersApi } from "@/hooks/useBanner";
import {
  useCardClickOperations,
  useModalOperations,
  useNewBanner,
} from "@/components/helpers/allBannersHelper";
import { useBannerTemp } from "@/components/store/useBannerTemp";
import HeaderBannerSection from "./headerBanners";
import DeleteConfirmPopup from "./deleteBannerPopup";

// Lazy load components
const LoadingSpinner = lazy(() => import("@/components/atom/loadingSpinner"));
const BannersExplorePage = lazy(() => import("../createdBannerLayouts"));

const MemoBanners = () => {
  const { isArrangeMode, setIsArrangeMode, firstCardIndex, setFirstCardIndex } =
    useBannerTemp((s) => ({
      isArrangeMode: s.isArrangeMode,
      setIsArrangeMode: s.setIsArrangeMode,
      firstCardIndex: s.firstCardIndex,
      setFirstCardIndex: s.setFirstCardIndex,
    }));

  const { bannersApi } = useBannersApi();
  const businessId = useParams()?.businessId;
  // setting banner page and layout
  const { handleNewBanner } = useNewBanner();

  // filtering banners and card clicking functionalities
  const { handleCardClick, filteredBanners, handleArrangeSequence } =
    useCardClickOperations();

  // modal operations
  const { openModal } = useModalOperations();

  const queryClient = useQueryClient();

  const saveSequence = async (sequence: string[]) => {
    const response = await apiRpc.settings.banners.sequence.$put({
      json: {
        sequenceOfBannerIds: sequence,
      },
    });
    return response.json();
  };

  const { mutateAsync: saveSequenceMutation } = useMutation({
    mutationFn: saveSequence,
    onSuccess: () => {
      toast.success("Sequence saved successfully");
      queryClient.invalidateQueries({ queryKey: ["banners"] });
    },
    onError: (error) => {
      toast.error("Failed to save sequence");
      console.error("Error saving sequence:", error);
    },
  });

  const handleSaveSequence = async () => {
    const sequence = filteredBanners.map((banner) => banner._id);
    setIsArrangeMode(false);
    setFirstCardIndex(null);
    try {
      await saveSequenceMutation(sequence);
    } catch (error) {
      console.error("Error in handleSaveSequence:", error);
    }
  };

  useQuery({
    queryKey: ["banners", businessId],
    queryFn: bannersApi,
    enabled: !!businessId,
  });

  return (
    <Suspense fallback={<LoadingSpinner />}>
      <main className="relative h-screen mb-[2rem]">
        <HeaderBannerSection />
        <article className="max-w-[69rem] flex justify-end">
          <button
            type="button"
            className="z-20 h-8 px-4 py-2 mr-4 text-xs text-white bg-[#7D68FE] rounded-full"
            onClick={isArrangeMode ? handleSaveSequence : handleArrangeSequence}
          >
            {isArrangeMode ? "Save Sequence" : "Arrange Sequence"}
          </button>
          {isArrangeMode && (
            <button
              type="button"
              className="z-20 px-4 py-2 mb-4 mr-4 text-xs text-white bg-red-500 rounded-full"
              onClick={handleArrangeSequence}
            >
              Cancel
            </button>
          )}
        </article>
        {isArrangeMode && (
          <center className="px-4 text-sm py-2 mt-2 text-[#da0606] bg-[#da060630] flex items-center justify-center">
            <PiSealWarningFill size={32} className="mr-2" />
            Click on the first card, then click on the second <br />
            card to swap their positions.
          </center>
        )}
        &nbsp;
        <section
          className={
            "!mx-4 !w-[92%] lg:!ml-10 !md:w-[100%] banner-cards pb-[5rem]"
          }
        >
          {filteredBanners && filteredBanners?.length > 0 ? (
            filteredBanners.map((banner: IBannerPayload, index: number) => (
              <div
                key={`banner?._id+${index.toString()}`}
                className={cn(
                  "relative overflow-hidden",
                  firstCardIndex === index
                    ? "border-2 border-[#7D68FE]  rounded-2xl"
                    : "",
                )}
                onClick={() => handleCardClick(index)}
                onKeyDown={() => handleCardClick(index)}
              >
                <BannersExplorePage key={banner?._id} banner={banner} />
                {isArrangeMode && (
                  <div className="absolute inset-0 flex items-center justify-center text-2xl font-bold text-white bg-gray-500 bg-opacity-50 z-1000 rounded-2xl">
                    {index + 1}
                  </div>
                )}
                <button
                  className="absolute text-red-600 top-2 right-2"
                  type="button"
                  onClick={() => {
                    openModal(banner?._id || "");
                  }}
                >
                  <FaTrash />
                </button>
              </div>
            ))
          ) : (
            <center className="absolute -translate-x-1/2 top-1/2 left-1/2">
              No Banners
            </center>
          )}
        </section>
        <DeleteConfirmPopup />
      </main>
      <button
        type="button"
        className={cn(
          "pointer-events-auto bottom_btn",
          isArrangeMode ? "opacity-50" : "",
        )}
        onClick={handleNewBanner}
        disabled={isArrangeMode}
      >
        Add New Spotlight
      </button>
    </Suspense>
  );
};

const Banners = memo(MemoBanners);
export default Banners;
