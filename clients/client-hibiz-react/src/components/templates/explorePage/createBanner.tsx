import { memo, useEffect, useRef, Suspense, lazy, useCallback } from "react";
import { apiRpc } from "@hi/common";
import { useParams } from "react-router-dom";
import { cn, storeImageAfterSave } from "@/components/utils/helper";
import toast from "react-hot-toast";
import type { IBannerPayload } from "@/components/types/businessData";
import { useBannerStore } from "@/components/store/useBannerStore";
import { BsGrid } from "react-icons/bs";
import { BannerPage } from "@/components/utils/bannerLayouts";
import BottomButton from "@/components/atom/bottomButton";
import MiddlePopUp from "@/components/atom/middlePopUp";
import {
  ExplorePages,
  useExploreStore,
} from "@/components/store/useExploreStore";
import EasyReactCropper from "@/components/cropper/cropper";
import type Area from "react-easy-crop";
import { useBannerTemp } from "@/components/store/useBannerTemp";
import useLayoutHook from "@/components/store/useLayoutHook";
import BannerImgContainer from "./bannerImgContainer";
import BannerBtnRedirection from "./bannerBtnRedirection";

// Lazy load components
const BannerDynamicLayout = lazy(() => import("./bannerDynamicLayout"));
const PopUp = lazy(() => import("@/components/atom/popUp"));
const RedirectionPopUp = lazy(() => import("./redirectionPopUp"));
const ExploreColorWheel = lazy(() => import("./exploreColorWheel"));
const SectionLoader = lazy(() => import("@/components/atom/sectionLoader"));
const LoadingSpinner = lazy(() => import("@/components/atom/loadingSpinner"));
const HisiteHeader = lazy(() => import("@/components/molecules/hisiteHeader"));

interface CropperRef {
  getCroppedAreaPixels: () => Area | null;
}

const MemoCreateBanner = () => {
  const cropperRef = useRef<CropperRef>(null);
  const { businessId } = useParams();

  const editingBanner = useBannerStore((s) => s.selectedBanner);
  const {
    itemName,
    setItemName,
    showCropper,
    setShowCropper,
    heading,
    updateEditBanner,
    paragraph,
    clickRedirect,
    setClickRedirect,
    callToAction,
    redirectionId,
    setRedirectionId,
    redirectionType,
    setRedirectionType,
    setColorWheelBackground,
    colorWheelBackground,
    isLoading,
    setIsLoading,
    isPublished,
    setIsPublished,
    imageFiles,
    setImageFiles,
    img,
    setImg,
    paragraphStyle,
    setParagraphStyle,
    buttonStyle,
    selectedColor,
    setSelectedColor,
    cropping,
    colorWheelParagraph,
    setColorWheelParagraph,
  } = useBannerTemp((s) => ({
    itemName: s.itemName,
    setItemName: s.setItemName,
    showCropper: s.showCropper,
    setShowCropper: s.setShowCropper,
    heading: s.heading,
    updateEditBanner: s.updateEditBanner,
    paragraph: s.paragraph,
    setParagraph: s.setParagraph,
    clickRedirect: s.clickRedirect,
    setClickRedirect: s.setClickRedirect,
    callToAction: s.callToAction,
    setCallToAction: s.setCallToAction,
    redirectionId: s.redirectionId,
    setRedirectionId: s.setRedirectionId,
    redirectionType: s.redirectionType,
    setRedirectionType: s.setRedirectionType,
    isLoading: s.isLoading,
    setIsLoading: s.setIsLoading,
    setColorWheelBackground: s.setColorWheelBackground,
    colorWheelBackground: s.colorWheelBackground,
    isPublished: s.isPublished,
    setIsPublished: s.setIsPublished,
    imageFiles: s.imageFiles,
    setImageFiles: s.setImageFiles,
    img: s.img,
    setImg: s.setImg,
    paragraphStyle: s.paragraphStyle,
    setParagraphStyle: s.setParagraphStyle,
    buttonStyle: s.buttonStyle,
    selectedColor: s.selectedColor,
    setSelectedColor: s.setSelectedColor,
    cropping: s.cropping,
    colorWheelParagraph: s.colorWheelParagraph,
    setColorWheelParagraph: s.setColorWheelParagraph,
  }));

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
  }));

  const { setToggleExplorePages } = useExploreStore((s) => ({
    setToggleExplorePages: s.setToggleExplorePages,
  }));

  const layoutFlags = useLayoutHook(selectedBannerType || "");

  useEffect(() => {
    if (editBanner && editingBanner) {
      updateEditBanner(editingBanner);
      updateEditBannerz(editingBanner, layoutFlags);
    } else {
      updateEditBannerz({}, {});
      updateEditBanner({});
    }
  }, [editBanner, editingBanner]);

  const getCroppedImg = (
    imageSrc,
    pixelCrop,
    mimeType = "image/webp",
    quality = 0.9,
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
              setImg(reader?.result);
              setImageFiles(croppedFile);
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

  const handleSaveRedirections = useCallback(
    (type: string, id: string, itemName: string) => {
      setRedirectionId(id);
      setRedirectionType(type);
      setItemName(itemName);
    },
    [setRedirectionId, setRedirectionType, setItemName],
  );

  const handleCreateBanner = async (isPublish?: boolean) => {
    if (!businessId) return;
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
    let bannerImage: string | undefined;
    if (
      imageFiles &&
      (!img?.includes("https://storage.hipal.life") ||
        !img?.includes("t-static.blr1.digitaloceanspaces.com"))
    ) {
      bannerImage = await storeImageAfterSave(imageFiles, img, setIsLoading);
    }
    const payload: IBannerPayload = {
      businessId,
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
    const filteredPayload = Object.fromEntries(
      Object.entries(payload).filter(
        ([_, value]) => value !== null && value !== "",
      ),
    );

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

  const handleBackClick = () => {
    setBannerPage(BannerPage.VIEW);
    setToggleExplorePages(ExplorePages.BANNERS);
  };
  const handleChangeLayout = () => {
    setBannerPage(BannerPage.VIEW);
    setToggleExplorePages(ExplorePages.BANNERLAYOUTS);
  };

  const handlePreview = useCallback(() => {
    setOpenPreview(!openPreview);
  }, [openPreview]);

  return (
    <Suspense fallback={<LoadingSpinner />}>
      <main className="lg:flex">
        <section
          className={cn(
            "fixed top-0 lg:relative bg-white lg:bg-transparent w-full h-[16rem] md:h-[30rem] lg:h-[90vh] z-10 max-w-[69rem]",
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
              <BannerDynamicLayout
                img={img}
                selectedColor={selectedColor}
                buttonStyle={buttonStyle}
                callToAction={callToAction}
                paragraphStyle={paragraphStyle}
                heading={heading}
                paragraph={paragraph}
              />
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
        <section>
          <BannerImgContainer />
          <BannerBtnRedirection />
        </section>
        <BottomButton
          fixed
          buttons={[
            {
              text: isLoading ? (
                <div className="flex items-center justify-center">
                  <SectionLoader />
                  Loading...
                </div>
              ) : isPublished ? (
                "Save & Unpublish"
              ) : (
                "Save & Publish"
              ),
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
              onClick: handleCrop,
            },
          ]}
        />
      </PopUp>
      {colorWheelBackground && (
        <PopUp
          show={colorWheelBackground}
          onClose={() => setColorWheelBackground(!colorWheelBackground)}
        >
          <ExploreColorWheel
            close={() => setColorWheelBackground(!colorWheelBackground)}
            colorType="backgroundColor"
            setStyle={setSelectedColor}
            style={selectedColor}
          />
        </PopUp>
      )}
      {colorWheelParagraph && (
        <PopUp
          show={colorWheelParagraph}
          onClose={() => setColorWheelParagraph(!colorWheelParagraph)}
        >
          <ExploreColorWheel
            close={() => setColorWheelParagraph(!colorWheelParagraph)}
            colorType="paragraph"
            style={paragraphStyle}
            setStyle={setParagraphStyle}
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
            <BannerDynamicLayout
              img={img}
              selectedColor={selectedColor}
              buttonStyle={buttonStyle}
              callToAction={callToAction}
              paragraphStyle={paragraphStyle}
              heading={heading}
              paragraph={paragraph}
            />
          </center>
        </MiddlePopUp>
      )}
      {isLoading ? <SectionLoader /> : null}
    </Suspense>
  );
};

const CreateBanner = memo(MemoCreateBanner);
export default CreateBanner;
