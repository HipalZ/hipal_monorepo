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
  const {
    bizInfo,
    setIsLoading,
    showUniquePopUp,
    setShowUniquePopUp,
    showCropper,
    cropping,
    setShowCropper,
  } = useExploreStore((s) => ({
    bizInfo: s.bizInfo,
    setIsLoading: s.setIsLoading,
    showUniquePopUp: s.showUniquePopUp,
    showCropper: s.showCropper,
    cropping: s.cropping,
    setShowCropper: s.setShowCropper,
    setShowUniquePopUp: s.setShowUniquePopUp,
  }));

  const {
    socialMediaLinks,
  } = useExploreTemp((s) => ({
    socialMediaLinks: s.socialMediaLinks,
  }));

  const navigate = useNavigate();
  const businessId = useParams()?.businessId;
  const { handleCrop } = useCroppedImg();
  const showErrorToasts = useShowErrorToasts();

  // Update the `socialMediaLinks` state by mapping over the previous links and updating the link that matches the selected social media icon.

  const handleSaveExplorePage = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!businessId) return;
    const { bannerExplore, logoExplore, footerExplore } =
      await checkValidations();

    // valid social media links
    const validSocialMediaLinks = socialMediaLinks.filter((item) => item.link);
    // check if all social media links start with 'https://'
    for (const item of validSocialMediaLinks) {
      if (!item.link.startsWith("https://")) {
        toast.error(
          `Invalid social media link for ${item.icon}. Link should start with 'https://'`,
        );
        return; // Exit the function early if an invalid link is found
      }
    }

    // filter out empty social media links
    const filteredSocialMedia = validSocialMediaLinks.map((item) => ({
      icon: item.icon,
      link: item.link,
    }));

    const payload: IBizPayload = {
      businessId,
      logoUrl: logoExplore,
      specialBannerUrl: bannerExplore,
      endBannerUrl: footerExplore,
      socialMediaLinks: filteredSocialMedia,
      name: bizInfo?.name,
      fssai: bizInfo?.fssai,
      gst: bizInfo?.gst,
      footerDescription: bizInfo?.footerDescription,
    };

    // filter out empty values undefined, null or not used keys
    const filteredPayload = filterPayload(payload);

    setIsLoading(true);
    let res: {
      status: number;
    };

    // if there is no bizInfo?._id then create a new outlet
    if (bizInfo?._id === "") {
      res = await apiRpc.businesses.outletInfo.$post({
        json: filteredPayload,
      });
    }

    // if there is bizInfo?._id then update the existing outlet
    if (bizInfo?._id !== "" || (res && res.status === 409)) {
      const outletInfo = await apiRpc.businesses.outletInfo.update[
        ":businessId"
      ].$put({
        json: filteredPayload,
        param: {
          businessId: businessId,
        },
      });
      const outletInfoData = await outletInfo.json();
      if (outletInfo.status === 200) {
        toast.success("Data saved successfully");
        navigate(`/app/business/${businessId}/`);
      } else if (outletInfo.status === 400) {
        showErrorToasts(outletInfoData?.error);
      }
    }
    setIsLoading(false);
  };

  return (
    <form onSubmit={handleSaveExplorePage} className="px-4 pb-[5rem]">
      <ExplorePageTopSection />
      <br />
      <BannerSection />
      <UniquelyYoursSection />
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
            width={400}
            height={400}
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
