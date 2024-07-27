import {
  type ChangeEvent,
  type FormEvent,
  memo,
  startTransition,
  useCallback,
  useRef,
  useState,
  Suspense,
  lazy,
} from "react";
import { useNavigate, useParams } from "react-router-dom";
import { IoMdArrowUp } from "react-icons/io";
import {
  basicInfos,
  combineAllDishes,
} from "@/components/templates/explorePage/explorePageStore";
import { apiRpc } from "@hi/common";
import { useQuery } from "@tanstack/react-query";
import type {
  IBizInfo,
  IBizPayload,
  IDish,
} from "@/components/types/businessData";
import { useExploreStore } from "@/components/store/useExploreStore";
import {
  compressImage,
  filterPayload,
  storeImageAfterSave,
} from "@/components/utils/helper";
import toast from "react-hot-toast";
import { BsInstagram } from "react-icons/bs";
import { CiFacebook } from "react-icons/ci";
import { FaXTwitter } from "react-icons/fa6";
import { TbBrandTelegram } from "react-icons/tb";
import { RiDiscordLine } from "react-icons/ri";
import { cropImage } from "@/components/cropper";
import useShowErrorToasts from "@/components/atom/errorToasts";

// Lazy loading components
const PopUp = lazy(() => import("@/components/atom/popUp"));
const BizInformation = lazy(
  () => import("@/components/templates/explorePage/businessInformation"),
);
const FooterBanner = lazy(
  () => import("@/components/templates/explorePage/footerBanner"),
);
const LoadingSpinner = lazy(() => import("@/components/atom/loadingSpinner"));
const HisiteHeader = lazy(() => import("@/components/molecules/hisiteHeader"));
const ReactCropper = lazy(() => import("@/components/cropper"));
const CropperPopup = lazy(() => import("@/components/common/cropperPopup"));
const UniquelyYoursPopUp = lazy(
  () => import("@/components/templates/explorePage/uniquelyYoursPopUp"),
);
const ExplorePageTopSection = lazy(
  () => import("@/components/templates/explorePage/explorePageTopSection"),
);

const BannerSection = lazy(
  () => import("@/components/templates/explorePage/bannerSection"),
);
const UniquelyYoursSection = lazy(
  () => import("@/components/templates/explorePage/uniquelyYoursSection"),
);
const SocialMediaLinks = lazy(
  () => import("@/components/templates/explorePage/socialMediaLinks"),
);
const RightButton = lazy(() => import("@/components/atom/rightButton"));
const SubHeader = lazy(() => import("@/components/atom/subHeader"));
const Paragraph = lazy(() => import("@/components/atom/paragraph"));

const MemoExplorePage = () => {
  const navigate = useNavigate();
  const showErrorToasts = useShowErrorToasts();
  const businessId = useParams()?.businessId;

  const {
    bizInfo,
    setBizInfo,
    originalDishes,
    uniquelyDishes,
    setBanners,
    setUniquelyDishes,
    setOriginalDishes,
    setSelectedDishes,
    selectedDishes,
    clearOriginalDishes,
    img,
    setImg,
    imageFiles,
    setImageFiles,
  } = useExploreStore((state) => ({
    bizInfo: state.bizInfo,
    setBizInfo: state.setBizInfo,
    originalDishes: state.originalDishes,
    setOriginalDishes: state.setOriginalDishes,
    selectedDishes: state.selectedDishes,
    setSelectedDishes: state.setSelectedDishes,
    uniquelyDishes: state.uniquelyDishes,
    setUniquelyDishes: state.setUniquelyDishes,
    clearOriginalDishes: state.clearOriginalDishes,
    setBanners: state.setBanners,
    img: state.img,
    setImg: state.setImg,
    imageFiles: state.imageFiles,
    setImageFiles: state.setImageFiles,
  }));
  const cropperRef = useRef(null);
  const [toggleBizInfo, setToggleBizInfo] = useState(false);
  const [socialMediaLinks, setSocialMediaLinks] = useState([
    { _id: 1, icon: "instagram", logo: <BsInstagram size={30} />, link: "" },
    { _id: 2, icon: "facebook", logo: <CiFacebook size={36} />, link: "" },
    { _id: 3, icon: "twitter", logo: <FaXTwitter size={30} />, link: "" },
    { _id: 4, icon: "telegram", logo: <TbBrandTelegram size={30} />, link: "" },
    { _id: 5, icon: "discord", logo: <RiDiscordLine size={36} />, link: "" },
  ]);
  const [showUniquePopUp, setShowUniquePopUp] = useState(false);

  const [selectedSocialMedia, setSelectedSocialMedia] = useState("");
  const [showCropper, setShowCropper] = useState(false);
  const [cropping, setCropping] = useState({ image: null, type: null });
  const [dishes, setDishes] = useState<IDish[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  const handleDishSelect = useCallback(
    (selectedDish: IDish) => {
      const isAlreadySelected = selectedDishes.some(
        (dish) => dish._id === selectedDish._id,
      );

      let updatedSelectedDishes: IDish[];
      if (isAlreadySelected) {
        updatedSelectedDishes = selectedDishes.filter(
          (dish) => dish._id !== selectedDish._id,
        );
      } else {
        updatedSelectedDishes = [...selectedDishes, selectedDish];
      }

      setSelectedDishes(updatedSelectedDishes);
    },
    [selectedDishes],
  );

  const handleOpenPopUp = useCallback(() => {
    setShowUniquePopUp(true);
  }, []);

  const handleSaveDish = async () => {
    setUniquelyDishes(selectedDishes);
    await handleUniquelyYours(selectedDishes);
    setShowUniquePopUp(false);
  };

  const handleUniquelyYours = async (selectedDishes: IDish[]) => {
    apiRpc.dishes.uniquelyYours.$post({
      json: {
        dishArray: selectedDishes.map((dish) => {
          return {
            dishId: dish._id,
            name: dish.name,
            images: dish.images,
            dishTypes: dish?.dishTypes,
            businessId,
          };
        }),
      },
    });
  };

  const handleImageChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      const type = event.target.dataset.type as keyof ImageFiles;
      console.log("Type:", type);
      const file = event.target.files?.[0];
      if (file) {
        console.log("Selected File:", file);
        compressImage(file, (compressedFile) => {
          const reader = new FileReader();
          reader.readAsDataURL(compressedFile);
          reader.onloadend = () => {
            console.log("Compressed Image Data URL:", reader.result);
            setCropping({ image: reader.result, type });
            setShowCropper(true);
            setImageFiles({ [type]: compressedFile });
          };
        });
      }
    },
    [imageFiles],
  );

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

  const handleBizInfo = useCallback(() => {
    setToggleBizInfo(!toggleBizInfo);
  }, [toggleBizInfo]);

  const handleNavigate = useCallback(() => {
    setToggleBizInfo(!toggleBizInfo);
    if (!toggleBizInfo) {
      startTransition(() => {
        clearOriginalDishes();
        navigate(`/app/business/${businessId}/hisite`);
      });
    }
  }, [businessId, toggleBizInfo, clearOriginalDishes, originalDishes]);

  const handleNavigation = useCallback(() => {
    startTransition(() => {
      navigate(`/app/business/${businessId}/banners`);
    });
  }, [businessId]);

  const handleFssaiNumber = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.value.length >= 50)
      return toast.error("FSSAI number should be less than 50 characters");
    setBizInfo({ ...bizInfo, fssai: e.target.value });
  };

  const handlegst = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.value.length >= 26)
      return toast.error("GST number should be less than 26 characters");
    setBizInfo({ ...bizInfo, gst: e.target.value });
  }, []);
  const handleSearch = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    const search = e.target.value;
    setSearchQuery(search);
    const filteredDishes = dishes.filter((dish) =>
      dish.name.toLowerCase().includes(search.toLowerCase()),
    );
    setDishes(filteredDishes);
    if (search.trim() === "") {
      setDishes(originalDishes);
    }
  }, []);

  const handleBizName = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      setBizInfo({ ...bizInfo, name: e.target.value });
    },
    [bizInfo],
  );

  const handleFooterComment = useCallback(
    (e: ChangeEvent<HTMLTextAreaElement>) => {
      setBizInfo({ ...bizInfo, footerDescription: e.target.value });
    },
    [bizInfo],
  );

  const handleSaveSocialMediaLink = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      const newLink = e.target.value;
      setSocialMediaLinks((prev) =>
        prev.map((link) =>
          link.icon === selectedSocialMedia ? { ...link, link: newLink } : link,
        ),
      );
    },
    [socialMediaLinks, selectedSocialMedia],
  );

  const getAllCategoryData = async (businessId: string) => {
    if (originalDishes.length > 0) return setDishes(originalDishes);
    const categoryResponse = await apiRpc.categories.$get({
      query: {
        businessId: businessId,
        dishes: "true",
      },
    });
    const data = await categoryResponse.json();
    const categories = data?.data;
    const allDishes = await combineAllDishes(categories);
    setDishes(allDishes);
    setOriginalDishes(allDishes);
    return allDishes;
  };

  const getAllBizInfo = async () => {
    return await apiRpc.businesses.outletInfo[":businessId"].$get({
      param: {
        businessId,
      },
    });
  };

  const handleSaveExplorePage = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!businessId) return;
    let bannerExplore: string | undefined;
    let logoExplore: string | undefined;
    let footerExplore: string | undefined;
    if (
      imageFiles?.banner !== null &&
      !img?.banner?.includes("https://storage.hipal.life")
    ) {
      bannerExplore = await storeImageAfterSave(
        imageFiles?.banner,
        img?.banner,
      );
    }
    if (
      imageFiles?.logo !== null &&
      !img?.banner?.includes("https://storage.hipal.life")
    ) {
      logoExplore = await storeImageAfterSave(imageFiles?.logo, img?.logo);
    }
    if (
      imageFiles?.footer !== null &&
      !img?.banner?.includes("https://storage.hipal.life")
    ) {
      footerExplore = await storeImageAfterSave(
        imageFiles?.footer,
        img?.footer,
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

    // Conditionally add keys if they have a length greater than 0

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
      } else if (outletInfo.status === 400) {
        showErrorToasts(outletInfoData?.error);
      }
    }
  };

  const handleIconClick = useCallback((icon: string) => {
    setSelectedSocialMedia(icon);
  }, []);

  const fetchUniquelyYours = async () => {
    const res = await apiRpc.dishes.uniquelyDishes[":businessId"].$get({
      param: {
        businessId,
      },
    });
    const response = await res.json();
    if (res.status === 200) {
      uniquelyYoursRef.current = true;
      setUniquelyDishes(response?.data);
    }
    return response?.data;
  };

  const fetchBanners = async () => {
    const res = await apiRpc.settings.banners[":businessId"].$get({
      param: {
        businessId,
      },
    });
    const response = await res.json();
    if (res.status === 200) {
      bannersRef.current = true;
      setBanners(response?.data);
    }
    return response?.data;
  };
  const bannersRef = useRef(false);
  const uniquelyYoursRef = useRef(false);

  const { refetch } = useQuery({
    queryKey: ["bizInfo", businessId],
    queryFn: async () => {
      const res = await getAllBizInfo();
      const response = await res.json();
      setImg({
        banner: response?.data?.specialBannerUrl,
        logo: response?.data?.logoUrl,
        footer: response?.data?.endBannerUrl,
      });
      console.log("Response:", response);
      setBizInfo(response?.data as IBizInfo);
      setSocialMediaLinks((prevLinks) =>
        prevLinks.map((link) => {
          const matchingLink = response?.data?.socialMediaLinks?.find(
            (media) => media.icon === link.icon,
          );
          return matchingLink ? { ...link, link: matchingLink.link } : link;
        }),
      );
      return response;
    },
    enabled: !!businessId,
  });

  useQuery({
    queryKey: ["banners", businessId, bannersRef.current],
    queryFn: fetchBanners,
    enabled: !!businessId && !bannersRef.current,
  });

  useQuery({
    queryKey: ["categories", businessId, uniquelyYoursRef.current],
    queryFn: fetchUniquelyYours,
    enabled: !!businessId && !uniquelyYoursRef.current,
  });

  useQuery({
    queryKey: ["categoriez", businessId, showUniquePopUp],
    queryFn: () => getAllCategoryData(businessId ?? ""),
    enabled: !!businessId && showUniquePopUp,
  });

  return (
    <Suspense fallback={<LoadingSpinner />}>
      <main>
        <HisiteHeader
          onBack={handleNavigate}
          title={`${toggleBizInfo ? "Business Info" : "Explore Page"} `}
          rightButton={<RightButton />}
          isIconBusinessShow={false}
        />
        {toggleBizInfo ? (
          <BizInformation refetch={refetch} />
        ) : (
          <form onSubmit={handleSaveExplorePage} className="px-4">
            <ExplorePageTopSection
              handleImageChange={handleImageChange}
              img={img}
              handleBizName={handleBizName}
              handleBizInfo={handleBizInfo}
              basicInfos={basicInfos}
            />
            <br />
            <BannerSection handleNavigation={handleNavigation} />
            <UniquelyYoursSection handleOpenPopUp={handleOpenPopUp} />
            <FooterBanner
              img={img}
              handleImageChange={handleImageChange}
              handleFooterComment={handleFooterComment}
              handleFssaiNumber={handleFssaiNumber}
              handlegst={handlegst}
            />
            <SocialMediaLinks
              handleSaveSocialMediaLink={handleSaveSocialMediaLink}
              selectedSocialMedia={selectedSocialMedia}
              handleIconClick={handleIconClick}
              socialMediaLinks={socialMediaLinks}
            />
            <section className="mt-4 opacity-30">
              <SubHeader text="Terms & Condition" />
              <article className="flex items-center justify-between p-4 bg-white rounded-2xl">
                <Paragraph text="Add your terms and conditions here" />
                <IoMdArrowUp size={20} className="rotate-45" />
              </article>
            </section>
            <button type="submit" className="bottom_btn">
              Save
            </button>
            <CropperPopup
              show={showCropper}
              onSave={handleCrop}
              onClose={() => setShowCropper(false)}
            >
              <ReactCropper
                image={cropping.image}
                ref={cropperRef}
                width={250}
                height={250}
              />
            </CropperPopup>
            {showUniquePopUp && (
              <PopUp
                show={showUniquePopUp}
                onClose={() => setShowUniquePopUp(false)}
              >
                <UniquelyYoursPopUp
                  setSelectedDishes={setSelectedDishes}
                  selectedDishes={selectedDishes}
                  handleSearch={handleSearch}
                  searchQuery={searchQuery}
                  dishes={dishes}
                  uniquelyDishes={uniquelyDishes}
                  handleDishSelect={handleDishSelect}
                  handleSaveDish={handleSaveDish}
                />
              </PopUp>
            )}
          </form>
        )}
      </main>
    </Suspense>
  );
};

const ExplorePage = memo(MemoExplorePage);
export default ExplorePage;
