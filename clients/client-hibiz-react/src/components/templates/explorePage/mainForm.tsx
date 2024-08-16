import useShowErrorToasts from "@/components/atom/errorToasts";
import { cropImage } from "@/components/cropper";
import { useExploreStore } from "@/components/store/useExploreStore";
import type { IBizPayload } from "@/components/types/businessData";
import { filterPayload, storeImageAfterSave } from "@/components/utils/helper";
import { apiRpc } from "@hi/common";
import {
  type FormEvent,
  lazy,
  memo,
  useCallback,
  useRef,
  useState,
} from "react";
import toast from "react-hot-toast";
import { IoMdArrowUp } from "react-icons/io";
import { useNavigate, useParams } from "react-router-dom";
import { BsInstagram } from "react-icons/bs";
import { CiFacebook } from "react-icons/ci";
import { FaXTwitter } from "react-icons/fa6";
import { TbBrandTelegram } from "react-icons/tb";
import { RiDiscordLine } from "react-icons/ri";

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

const MemoMainForm = () => {
  const navigate = useNavigate();
  const businessId = useParams()?.businessId;
  const showErrorToasts = useShowErrorToasts();
  const cropperRef = useRef(null);
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
  const [socialMediaLinks, setSocialMediaLinks] = useState([
    { _id: 1, icon: "instagram", logo: <BsInstagram size={30} />, link: "" },
    { _id: 2, icon: "facebook", logo: <CiFacebook size={36} />, link: "" },
    { _id: 3, icon: "twitter", logo: <FaXTwitter size={30} />, link: "" },
    { _id: 4, icon: "telegram", logo: <TbBrandTelegram size={30} />, link: "" },
    { _id: 5, icon: "discord", logo: <RiDiscordLine size={36} />, link: "" },
  ]);

  const handleSaveSocialMediaLink = useCallback(
    (event) => {
      const newLink = event.target.value;
      console.log("New Link:", newLink);

      setSocialMediaLinks((prevLinks) =>
        prevLinks.map((link) => {
          console.log("Current Link:", link);
          if (link.icon === selectedSocialMedia) {
            console.log("Selected Social Media:", selectedSocialMedia);
            console.log("Updating Link:", { ...link, link: newLink });
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
      console.log("imageFiles banner", imageFiles?.banner, img?.banner);
      bannerExplore = await storeImageAfterSave(
        imageFiles?.banner,
        img?.banner,
        setIsLoading,
      );
    }

    if (imageFiles?.logo !== undefined && /base64/.test(img?.logo)) {
      console.log("imageFiles logo", imageFiles?.logo);
      logoExplore = await storeImageAfterSave(
        imageFiles?.logo,
        img?.logo,
        setIsLoading,
      );
    }

    if (imageFiles?.footer !== undefined && /base64/.test(img?.footer)) {
      console.log("imageFiles footer", imageFiles?.footer);
      footerExplore = await storeImageAfterSave(
        imageFiles?.footer,
        img?.footer,
        setIsLoading,
      );
    }

    const validSocialMediaLinks = socialMediaLinks.filter((item) => item.link);

    // Then, check each non-empty link for the "https://" prefix
    const filteredSocialMedia = validSocialMediaLinks.reduce<
      { icon: string; link: string }[]
    >((acc, item) => {
      if (!item.link.startsWith("https://")) {
        toast.error(
          `Invalid social media link for ${item.icon}. Link should start with 'https://'`,
        );
      } else {
        acc.push({ icon: item.icon, link: item.link });
      }
      return acc;
    }, []);

    const payload: IBizPayload = {
      businessId,
      logoUrl: await logoExplore,
      specialBannerUrl: bannerExplore,
      endBannerUrl: footerExplore,
      socialMediaLinks: filteredSocialMedia,
      name: bizInfo?.name,
      fssai: bizInfo?.fssai,
      gst: bizInfo?.gst,
      footerDescription: bizInfo?.footerDescription,
    };

    const filteredPayload = filterPayload(payload);

    // Conditionally add keys if they have a length greater than 0
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

  const handleCrop = async () => {
    const { image, type } = cropping;
    const cropper = cropperRef.current;

    if (cropper && image && type) {
      const coordinates = cropper?.getCoordinates();
      if (coordinates) {
        try {
          const croppedDataUrl = await cropImage(image, coordinates);
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
    <form onSubmit={handleSaveExplorePage} className="px-4">
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
      <CropperPopup
        show={showCropper}
        onSave={handleCrop}
        onClose={() => setShowCropper(false)}
      >
        <ReactCropper image={cropping.image} ref={cropperRef} />
      </CropperPopup>
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
