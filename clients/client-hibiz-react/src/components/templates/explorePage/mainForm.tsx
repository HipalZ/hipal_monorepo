import useShowErrorToasts from "@/components/atom/errorToasts";
import { cropImage } from "@/components/cropper";
import { useExploreStore } from "@/components/store/useExploreStore";
import type { IBizPayload } from "@/components/types/businessData";
import { filterPayload, storeImageAfterSave } from "@/components/utils/helper";
import { apiRpc } from "@hi/common";
import {
  type ChangeEvent,
  type FormEvent,
  lazy,
  memo,
  useCallback,
  useRef,
} from "react";
import toast from "react-hot-toast";
import { IoMdArrowUp } from "react-icons/io";
import { useNavigate, useParams } from "react-router-dom";
import type { SocialMediaLink } from "@/components/types/businessData";
import type Area from "react-easy-crop";
import EasyReactCropper from "@/components/cropper/cropper";
import BottomButton from "@/components/atom/bottomButton";

interface CropperRef {
  getCroppedAreaPixels: () => Area | null;
}

//lazy loads
const SocialMediaLinks = lazy(
  () => import("@/components/templates/explorePage/socialMediaLinks"),
);
const SubHeader = lazy(() => import("@/components/atom/subHeader"));
const Paragraph = lazy(() => import("@/components/atom/paragraph"));
const BannerSection = lazy(
  () => import("@/components/templates/explorePage/bannerSection"),
);
const ExplorePageTopSection = lazy(
  () => import("@/components/templates/explorePage/explorePageTopSection"),
);
const UniquelyYoursPopUp = lazy(
  () => import("@/components/templates/explorePage/uniquelyYoursPopUp"),
);
const CropperPopup = lazy(() => import("@/components/common/cropperPopup"));
const ReactCropper = lazy(() => import("@/components/cropper"));

const PopUp = lazy(() => import("@/components/atom/popUp"));
const FooterBanner = lazy(
  () => import("@/components/templates/explorePage/footerBanner"),
);
const UniquelyYoursSection = lazy(
  () => import("@/components/templates/explorePage/uniquelyYoursSection"),
);

type Props = {
  socialMediaLinks: SocialMediaLink[];
  setSocialMediaLinks: (data: SocialMediaLink[]) => void;
};
const MemoMainForm = (props: Props) => {
  const { setSocialMediaLinks, socialMediaLinks } = props;
  const navigate = useNavigate();
  const businessId = useParams()?.businessId;
  const showErrorToasts = useShowErrorToasts();
  const cropperRef = useRef<CropperRef>(null);
  const {
    cropping,
    bizInfo,
    showCropper,
    setShowCropper,
    imageFiles,
    setIsLoading,
    showUniquePopUp,
    setShowUniquePopUp,
    img,
    setImg,
    setImageFiles,
  } = useExploreStore((s) => ({
    cropping: s.cropping,
    bizInfo: s.bizInfo,
    showCropper: s.showCropper,
    setShowCropper: s.setShowCropper,
    imageFiles: s.imageFiles,
    setIsLoading: s.setIsLoading,
    showUniquePopUp: s.showUniquePopUp,
    setShowUniquePopUp: s.setShowUniquePopUp,
    img: s.img,
    setImg: s.setImg,
    setImageFiles: s.setImageFiles,
  }));

  const { selectedSocialMedia } = useExploreStore((s) => ({
    selectedSocialMedia: s.selectedSocialMedia,
  }));

  const handleSaveSocialMediaLink = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      const newLink = event.target.value;
      setSocialMediaLinks((prevLinks: SocialMediaLink[]) =>
        prevLinks.map((link) => {
          if (link.icon === selectedSocialMedia) {
            return { ...link, link: newLink };
          }
          return link;
        }),
      );
    },
    [selectedSocialMedia],
  );

  const handleSaveExplorePage = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!businessId) return;
    let bannerExplore: string | undefined;
    let logoExplore: string | undefined;
    let footerExplore: string | undefined;
    if (imageFiles?.banner !== undefined && /base64/.test(img?.banner)) {
      bannerExplore = await storeImageAfterSave(
        imageFiles?.banner,
        img?.banner,
        setIsLoading,
      );
    }

    if (imageFiles?.logo !== undefined && /base64/.test(img?.logo)) {
      logoExplore = await storeImageAfterSave(
        imageFiles?.logo,
        img?.logo,
        setIsLoading,
      );
    }

    if (imageFiles?.footer !== undefined && /base64/.test(img?.footer)) {
      footerExplore = await storeImageAfterSave(
        imageFiles?.footer,
        img?.footer,
        setIsLoading,
      );
    }

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

    const filteredPayload = filterPayload(payload);

    setIsLoading(true);
    let res: {
      status: number;
    };
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

  const getCroppedImg = (
    imageSrc,
    pixelCrop,
    mimeType = "image/webp",
    quality = 1,
  ) => {
    return new Promise((resolve, reject) => {
      const image = new Image();
      image.src = imageSrc;
      image.crossOrigin = "anonymous";

      image.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = pixelCrop.width;
        canvas.height = pixelCrop.height;
        const ctx = canvas.getContext("2d");

        if (ctx) {
          ctx.drawImage(
            image,
            pixelCrop.x,
            pixelCrop.y,
            pixelCrop.width,
            pixelCrop.height,
            0,
            0,
            pixelCrop.width,
            pixelCrop.height,
          );
          resolve(canvas.toDataURL(mimeType, quality));
        } else {
          reject(new Error("Failed to get canvas context"));
        }
      };

      image.onerror = (err) => {
        reject(err);
      };
    });
  };

  const handleCrop = async () => {
    const { image, type } = cropping;
    if (image && type) {
      const croppedAreaPixels = cropperRef.current?.getCroppedAreaPixels();
      if (croppedAreaPixels) {
        try {
          const croppedDataUrl = await getCroppedImg(image, croppedAreaPixels);
          if (typeof croppedDataUrl === "string") {
            const blob = await (await fetch(croppedDataUrl)).blob();
            const croppedFile = new File([blob], imageFiles[type]?.name, {
              type: "image/png",
            });
            const reader = new FileReader();
            reader.onloadend = () => {
              setImg((prev) => ({ ...prev, [type]: reader.result }));
              setImageFiles((prev) => ({ ...prev, [type]: croppedFile }));
              setShowCropper(false);
            };
            reader.readAsDataURL(croppedFile);
          }
        } catch (err) {
          console.error(err);
        }
      }
    }
  };

  return (
    <form onSubmit={handleSaveExplorePage} className="px-4 pb-[5rem]">
      <ExplorePageTopSection />
      <br />
      <BannerSection />
      <UniquelyYoursSection />
      <FooterBanner />
      <SocialMediaLinks
        handleSaveSocialMediaLink={handleSaveSocialMediaLink}
        socialMediaLinks={socialMediaLinks}
      />
      <section className="mt-4 opacity-30">
        <SubHeader text="Terms & Condition" />
        <article className="flex items-center justify-between p-4 bg-white rounded-2xl">
          <Paragraph text="Add your terms and conditions here" />
          <IoMdArrowUp size={20} className="rotate-45" />
        </article>
      </section>
      <button type="submit" className="cursor-pointer bottom_btn">
        Save
      </button>
      <PopUp show={showCropper} onClose={() => setShowCropper(false)}>
        <section className="my-[10rem]">
          <EasyReactCropper
            image={cropping.image}
            ref={cropperRef}
            height={300}
            width={400}
          />
        </section>
        <BottomButton
          buttons={[
            {
              text: "Crop",
              onClick: handleCrop,
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
