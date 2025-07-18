import { apiRpc } from "@hi/common";
import { filterPayload } from "@/components/utils/helper";
import { type FormEvent, lazy, memo, useRef } from "react";
import { useCheckValidations } from "../../helpers/bannersHelper";
import { useCroppedImg } from "@/components/helpers/explorePageHelpers";
import { useExploreStore } from "@/components/store/useExploreStore";
import { useNavigate, useParams } from "react-router-dom";
import BottomButton from "@/components/atom/bottomButton";
import EasyReactCropper from "@/components/cropper/cropper";
import toast from "react-hot-toast";
import type { CropperRef, IBizPayload } from "@/components/types/businessData";
import useShowErrorToasts from "@/components/atom/errorToasts";
import { useExploreTemp } from "@/components/store/useExploreTemp";
import useBusinessData from "@/components/store/useBusinessData";
import { storeImageAfterSave } from "@/components/uploadAdmin/imageUpload";
const CategoryTopBanner = lazy(() => import("./categoryTopBanner"));

const SocialMediaLinks = lazy(
  () => import("@/components/templates/explorePage/socialMediaLinks"),
);

const BannerSection = lazy(
  () => import("@/components/templates/explorePage/bannerSection"),
);
const ExplorePageTopSection = lazy(
  () => import("@/components/templates/explorePage/explorePageTopSection"),
);
const UniquelyYoursPopUp = lazy(
  () => import("@/components/templates/explorePage/uniquelyYoursPopUp"),
);

const PopUp = lazy(() => import("@/components/atom/popUp"));
const FooterSection = lazy(
  () => import("@/components/templates/explorePage/footerSection"),
);
const UniquelyYoursSection = lazy(
  () => import("@/components/templates/explorePage/uniquelyYoursSection"),
);

const MemoMainForm = () => {
  const { checkValidations } = useCheckValidations();
  const cropperRef = useRef<CropperRef>(null);
  const outletInfo = useBusinessData((s) => s.outletInfo);
  const {
    bizInfo,
    showUniquePopUp,
    setShowUniquePopUp,
    showCropper,
    cropping,
    setShowCropper,
    hotelBanners,
    setHotelBanners,
  } = useExploreStore((s) => ({
    bizInfo: s.bizInfo,
    showUniquePopUp: s.showUniquePopUp,
    showCropper: s.showCropper,
    cropping: s.cropping,
    setShowCropper: s.setShowCropper,
    setShowUniquePopUp: s.setShowUniquePopUp,
    hotelBanners: s.hotelBanners,
    setHotelBanners: s.setHotelBanners,
  }));

  const { setIsLoading } = useExploreTemp((s) => ({
    setIsLoading: s.setIsLoading,
  }));

  const { socialMediaLinks } = useExploreTemp((s) => ({
    socialMediaLinks: s.socialMediaLinks,
  }));

  const navigate = useNavigate();
  const businessId = useParams()?.businessId;
  const hotelId = useParams()?.hotelId;
  const { handleCrop } = useCroppedImg();
  const showErrorToasts = useShowErrorToasts();

  // Update the `socialMediaLinks` state by mapping over the previous links and updating the link that matches the selected social media icon.

  const handleSaveExplorePage = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!businessId && !hotelId) return;
    const { bannerExplore, logoExplore, footerExplore, categoryTopBanner } =
      await checkValidations();

    // Upload base64 previews in hotelBanners
    const uploadedHotelBanners: string[] = [];

    for (let i = 0; i < hotelBanners.length; i++) {
      const base64 = hotelBanners[i];

      if (base64?.startsWith("data:image")) {
        const fileType =
          base64.match(/^data:(image\/\w+);base64,/)?.[1] || "image/jpeg";
        const blob = await (await fetch(base64)).blob();
        const file = new File([blob], "hotel-banner.jpg", { type: fileType });
        const url = await storeImageAfterSave(file, base64);

        const finalUrl = url || "";

        setHotelBanners((prev) => {
          const updated = [...prev];
          updated[i] = finalUrl;
          return updated;
        });

        uploadedHotelBanners.push(finalUrl);
      } else {
        uploadedHotelBanners.push(base64);
      }
    }

    // Validate social links
    const validSocialMediaLinks = socialMediaLinks.filter((item) => item.link);
    for (const item of validSocialMediaLinks) {
      if (!item.link.startsWith("https://")) {
        toast.error(
          `Invalid social media link for ${item.icon}. Link should start with 'https://'`,
        );
        return; // Exit the function early if an invalid link is found
      }
    }

    const filteredSocialMedia = validSocialMediaLinks.map((item) => ({
      icon: item.icon,
      link: item.link,
    }));

    const payload: IBizPayload = {
      businessId: businessId || hotelId,
      logoUrl: logoExplore,
      specialBannerUrl: bannerExplore,
      endBannerUrl: footerExplore,
      categoryTopBannerUrl: categoryTopBanner,
      socialMediaLinks: filteredSocialMedia,
      name: bizInfo?.name,
      fssai: bizInfo?.fssai,
      gst: bizInfo?.gst,
      footerDescription: bizInfo?.footerDescription,
      hotelBanners: uploadedHotelBanners,
    };

    const filteredPayload = filterPayload(payload);
    setIsLoading(true);

    let res: { status: number };

    if (bizInfo?._id === "") {
      res = await apiRpc.businesses.outletInfo.$post({ json: filteredPayload });
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

      const outletInfoData = await outletInfo.json();
      if (outletInfo.status === 200) {
        toast.success("Data saved successfully");
        if (businessId) navigate(`/app/business/${businessId}/explorePage`);
        if (hotelId) navigate(`/app/hotel/${hotelId}/website-display`);
      } else if (outletInfo.status === 400) {
        showErrorToasts(outletInfoData?.error);
      }
    }

    setIsLoading(false);
  };

  // Define crop sizes
  const cropSizes: Record<string, { width: number; height: number }> = {
    logo: { width: 150, height: 150 },
    categoryTopBanner: { width: 375, height: 135 },
    banner: { width: 400, height: 400 },
    footer: { width: 375, height: 135 },
  };

  const cropConfig = cropSizes[cropping.type] || {
    width: 400,
    height: 400,
  };

  return (
    <form onSubmit={handleSaveExplorePage} className="px-4 pb-[5rem]">
      <ExplorePageTopSection />
      <br />
      <BannerSection />
      {outletInfo?.outLetType !== "HOTEL" && !outletInfo?.isPosEnabled && (
        <UniquelyYoursSection />
      )}
      {outletInfo?.outLetType !== "HOTEL" && <CategoryTopBanner />}
      <FooterSection />
      <SocialMediaLinks />
      <button type="submit" className="cursor-pointer bottom_btn">
        Save
      </button>

      <PopUp hide show={showCropper} onClose={() => setShowCropper(false)}>
        <section className="my-[10rem]">
          <EasyReactCropper
            key={cropping.image}
            image={cropping.image}
            ref={cropperRef}
            width={cropConfig.width}
            height={cropConfig.height}
          />
        </section>
        <BottomButton
          buttons={[
            {
              text: "Crop",
              onClick: () => handleCrop(cropperRef),
            },
            {
              text: "Cancel",
              onClick: () => setShowCropper(false),
              type: "button",
            },
          ]}
        />
      </PopUp>
      {showUniquePopUp && (
        <PopUp show={showUniquePopUp} onClose={() => setShowUniquePopUp(false)}>
          <UniquelyYoursPopUp />
        </PopUp>
      )}
    </form>
  );
};

const MainForm = memo(MemoMainForm);
export default MainForm;
