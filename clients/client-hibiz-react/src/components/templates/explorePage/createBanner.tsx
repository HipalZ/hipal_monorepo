import { memo, useEffect, Suspense, lazy, useCallback, useRef } from "react";
import { apiRpc } from "@hi/common";
import { useNavigate, useParams } from "react-router-dom";
import {
  cn,
  filterPayload,
  storeImageAfterSave,
} from "@/components/utils/helper";
import toast from "react-hot-toast";
import type {
  CropperRef,
  IBannerPayload,
} from "@/components/types/businessData";
import { useBannerStore } from "@/components/store/useBannerStore";
import { BsGrid } from "react-icons/bs";
import { BannerPage } from "@/components/utils/bannerLayouts";
import {
  ExplorePages,
  useExploreStore,
} from "@/components/store/useExploreStore";
import EasyReactCropper from "@/components/cropper/cropper";
import { useBannerTemp } from "@/components/store/useBannerTemp";
import useLayoutHook from "@/components/store/useLayoutHook";
import {
  useBannerBackChangeLayout,
  useCroppedImg,
  useRedirections,
} from "../../helpers/bannersHelper";

// Lazy load components
const BottomButton = lazy(() => import("@/components/atom/bottomButton"));
const MiddlePopUp = lazy(() => import("@/components/atom/middlePopUp"));
const BannerImgContainer = lazy(() => import("./bannerImgContainer"));
const BannerBtnRedirection = lazy(() => import("./bannerBtnRedirection"));
const BannerDynamicLayout = lazy(() => import("../dynamicBannerLayouts"));
const PopUp = lazy(() => import("@/components/atom/popUp"));
const RedirectionPopUp = lazy(() => import("./redirectionPopUp"));
const ExploreColorWheel = lazy(() => import("./exploreColorWheel"));
const SectionLoader = lazy(() => import("@/components/atom/sectionLoader"));
const LoadingSpinner = lazy(() => import("@/components/atom/loadingSpinner"));
const HisiteHeader = lazy(() => import("@/components/molecules/hisiteHeader"));

const MemoCreateBanner = () => {
  const { businessId, hotelId } = useParams();
  const {
    itemName,
    showCropper,
    setShowCropper,
    heading,
    updateEditBanner,
    paragraph,
    clickRedirect,
    setClickRedirect,
    callToAction,
    redirectionId,
    redirectionType,
    setColorWheelBackground,
    colorWheelBackground,
    isLoading,
    setIsLoading,
    isPublished,
    setIsPublished,
    imageFiles,
    img,
    paragraphStyle,
    setParagraphStyle,
    buttonStyle,
    selectedColor,
    setSelectedColor,
    cropping,
    colorWheelParagraph,
    setColorWheelParagraph,
  } = useBannerTemp((s) => ({
    buttonStyle: s.buttonStyle,
    callToAction: s.callToAction,
    clickRedirect: s.clickRedirect,
    colorWheelBackground: s.colorWheelBackground,
    colorWheelParagraph: s.colorWheelParagraph,
    cropping: s.cropping,
    heading: s.heading,
    imageFiles: s.imageFiles,
    img: s.img,
    isLoading: s.isLoading,
    isPublished: s.isPublished,
    itemName: s.itemName,
    paragraph: s.paragraph,
    paragraphStyle: s.paragraphStyle,
    redirectionId: s.redirectionId,
    redirectionType: s.redirectionType,
    selectedColor: s.selectedColor,
    setCallToAction: s.setCallToAction,
    setClickRedirect: s.setClickRedirect,
    setColorWheelBackground: s.setColorWheelBackground,
    setColorWheelParagraph: s.setColorWheelParagraph,
    setIsLoading: s.setIsLoading,
    setIsPublished: s.setIsPublished,
    setParagraph: s.setParagraph,
    setParagraphStyle: s.setParagraphStyle,
    setSelectedColor: s.setSelectedColor,
    setShowCropper: s.setShowCropper,
    showCropper: s.showCropper,
    updateEditBanner: s.updateEditBanner,
  }));

  const cropperRef = useRef<CropperRef>(null);
  const { handleSaveRedirections } = useRedirections();
  const navigate = useNavigate();
  const {
    selectedBannerType,
    isButtonExists,
    setBannerPage,
    isPatternExists,
    updateEditBannerz,
    editBanner,
    onlyImage,
    openPreview,
    setOpenPreview,
    editingBanner,
  } = useBannerStore((s) => ({
    selectedBannerType: s.selectedBannerType,
    isButtonExists: s.isButtonExists,
    setBannerPage: s.setBannerPage,
    updateEditBannerz: s.updateEditBannerz,
    isPatternExists: s.isPatternExists,
    editBanner: s.editBanner,
    onlyImage: s.onlyImage,
    setIsButtonExists: s.setIsButtonExists,
    openPreview: s.openPreview,
    setIsPatternExists: s.setIsPatternExists,
    setOpenPreview: s.setOpenPreview,
    editingBanner: s.selectedBanner,
  }));

  const { handleBackClick, handleChangeLayout } = useBannerBackChangeLayout();

  const { setToggleExplorePages } = useExploreStore((s) => ({
    setToggleExplorePages: s.setToggleExplorePages,
  }));
  const { handleCrop } = useCroppedImg();
  const layoutFlags = useLayoutHook(selectedBannerType || "");

  useEffect(() => {
    if (editBanner && editingBanner) {
      updateEditBanner(editingBanner);
      updateEditBannerz(editingBanner, layoutFlags);
    } else {
      updateEditBannerz({}, {});
      updateEditBanner({});
    }
  }, [
    editBanner,
    editingBanner,
    updateEditBannerz,
    updateEditBanner,
    layoutFlags,
  ]);

  const handleCreateBanner = async (isPublish?: boolean) => {
    if (!businessId && !hotelId) return;
    if ((heading.length < 4 || paragraph.length < 4) && !onlyImage) {
      return toast.error(
        "Heading, Description should be more than 4 characters",
      );
    }
    if (callToAction.length < 3 && isButtonExists && !onlyImage) {
      return toast.error("Button name should be more than 3 characters");
    }
    if (img && !img && !isPatternExists) {
      return toast.error("Please upload an image");
    }
    setIsLoading(true);
    let bannerImage: string | undefined;
    if (
      imageFiles &&
      (!img?.includes("https://storage.hipal.life") ||
        !img?.includes("t-static.blr1.digitaloceanspaces.com"))
    ) {
      bannerImage = await storeImageAfterSave(imageFiles, img, setIsLoading);
    }
    const payload: IBannerPayload = {
      businessId: businessId || hotelId,
      isPublished: isPublish ?? isPublished,
      layout: selectedBannerType,
      bannerImage,
      heading,
      paragraph,
      paragraphColor: paragraphStyle.color,
      buttonColor: buttonStyle.color,
      buttonTextColor: buttonStyle?.buttonColor,
      callToAction,
      backgroundColor: selectedColor.bgColor,
      redirectionId,
      redirectionType,
      redirectionName: itemName,
    };
    const filteredPayload = filterPayload(payload);

    let res: any;
    if (editBanner) {
      res = await apiRpc.settings.banner[":bannerId"].$put({
        param: {
          bannerId: editBanner,
        },
        json: filteredPayload,
      });
    } else {
      res = await apiRpc.settings.banner.$post({
        json: filteredPayload,
      });
    }
    if (res.status === 401 || res.status === 403) {
      navigate("/login");
      return;
    }
    await res.json();
    if (res.status === 200 || res.status === 201) {
      toast.success(
        editBanner
          ? "Banner Updated Successfully"
          : "Banner Created Successfully",
      );
      setToggleExplorePages(ExplorePages.BANNERS);
    }
    setBannerPage(BannerPage.VIEW);
    setIsLoading(false);
  };

  const handlePreview = useCallback(() => {
    setOpenPreview(!openPreview);
  }, [setOpenPreview, openPreview]);

  return (
    <Suspense fallback={<LoadingSpinner />}>
      <main className="lg:flex">
        <section
          className={cn(
            "fixed top-0 lg:relative bg-white lg:bg-transparent w-full h-[16rem] md:h-[30rem] lg:h-[90vh] z-10 max-w-[69rem] flex-1",
            onlyImage ? "mb-16" : "",
          )}
        >
          <HisiteHeader
            isIconBusinessShow={false}
            onBack={handleBackClick}
            rightButton={
              <button
                type="button"
                onClick={handlePreview}
                className="block px-4 py-1 text-white bg-[#7A68FE] scale-90 border rounded-full shadow md:hidden border-1"
              >
                Preview
              </button>
            }
          />
          {openPreview ? null : (
            <section className="absolute lg:relative flex justify-center  mt-[4rem] xl:translate-y-1/2 -translate-x-1/2 lg:-translate-x-0 -top-8 lg:top-0 left-1/2 lg:left-0 bg-white lg:bg-transparent">
              <BannerDynamicLayout />
              <center className="absolute -bottom-10">
                <button
                  type="button"
                  onClick={handleChangeLayout}
                  className="flex items-center justify-center px-3 py-1 space-x-2 text-sm text-white bg-black rounded-full"
                >
                  <BsGrid /> <span>Change Layout</span>
                </button>
              </center>
            </section>
          )}
          &nbsp;
        </section>
        <section className="flex-1">
          <BannerImgContainer />
          <BannerBtnRedirection />
        </section>
        <BottomButton
          fixed
          buttons={[
            {
              text: isPublished ? "Save & Unpublish" : "Save & Publish",
              onClick: () => {
                const newIsPublished = !isPublished;
                setIsPublished(newIsPublished);
                handleCreateBanner(newIsPublished);
              },
              disabled: isLoading,
              className: "w-full py-3 text-white bg-[#7D68FE] rounded-full",
            },
            {
              text: isLoading ? (
                <div className="flex items-center justify-center">
                  <SectionLoader />
                  Loading...
                </div>
              ) : (
                "Save"
              ),
              onClick: () => handleCreateBanner(isPublished),
              disabled: isLoading,
              className: "w-full py-3 text-white bg-black rounded-full",
            },
          ]}
        />
      </main>
      <PopUp show={showCropper} onClose={() => setShowCropper(false)}>
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
            },
          ]}
        />
      </PopUp>
      {(colorWheelBackground || colorWheelParagraph) && (
        <PopUp
          show={colorWheelBackground || colorWheelParagraph}
          onClose={() =>
            colorWheelBackground
              ? setColorWheelBackground(!colorWheelBackground)
              : setColorWheelParagraph(!colorWheelParagraph)
          }
        >
          <ExploreColorWheel
            close={() =>
              colorWheelBackground
                ? setColorWheelBackground(!colorWheelBackground)
                : setColorWheelParagraph(!colorWheelParagraph)
            }
            colorType={colorWheelBackground ? "backgroundColor" : "paragraph"}
            setStyle={
              colorWheelBackground ? setSelectedColor : setParagraphStyle
            }
            style={colorWheelBackground ? selectedColor : paragraphStyle}
          />
        </PopUp>
      )}

      {clickRedirect && (
        <PopUp
          show={clickRedirect}
          onClose={() => {
            setClickRedirect(false);
          }}
        >
          <RedirectionPopUp
            handleSaveRedirections={handleSaveRedirections}
            setClickRedirect={setClickRedirect}
          />
        </PopUp>
      )}
      {openPreview && (
        <MiddlePopUp show={openPreview} onClose={() => setOpenPreview(false)}>
          <center className="m-4">
            <BannerDynamicLayout />
          </center>
        </MiddlePopUp>
      )}
      {isLoading ? <SectionLoader /> : null}
    </Suspense>
  );
};

const CreateBanner = memo(MemoCreateBanner);
export default CreateBanner;
