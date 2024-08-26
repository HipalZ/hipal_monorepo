import {
  type ChangeEvent,
  memo,
  useEffect,
  useRef,
  useState,
  Suspense,
  lazy,
  useCallback,
} from "react";
import { TfiPaintBucket } from "react-icons/tfi";
import { apiRpc } from "@hi/common";
import { useParams } from "react-router-dom";
import {
  cn,
  handleClick,
  preDefinedButtons,
  storeImageAfterSave,
} from "@/components/utils/helper";
import toast from "react-hot-toast";
import type {
  Color,
  IBannerPayload,
  IStyles,
} from "@/components/types/businessData";
import { useBannerStore } from "@/components/store/useBannerStore";
import { cropImage } from "@/components/cropper";
import { BsGrid } from "react-icons/bs";
import { FaTimes } from "react-icons/fa";
import { BannerPage, BannerType } from "@/components/utils/bannerLayouts";
import CropperPopup from "@/components/common/cropperPopup";
import { CiNoWaitingSign } from "react-icons/ci";
import BottomButton from "@/components/atom/bottomButton";
import MiddlePopUp from "@/components/atom/middlePopUp";
import {
  ExplorePages,
  useExploreStore,
} from "@/components/store/useExploreStore";

// Lazy load components
const BannerDynamicLayout = lazy(() => import("./bannerDynamicLayout"));
const ReactCropper = lazy(() => import("@/components/cropper"));
const PopUp = lazy(() => import("@/components/atom/popUp"));
const SubHeader = lazy(() => import("@/components/atom/subHeader"));
const PlusButton = lazy(() => import("@/components/atom/plusButton"));
const RedirectionPopUp = lazy(() => import("./redirectionPopUp"));
const ExploreColorWheel = lazy(() => import("./exploreColorWheel"));
const SectionLoader = lazy(() => import("@/components/atom/sectionLoader"));
const LoadingSpinner = lazy(() => import("@/components/atom/loadingSpinner"));
const HisiteHeader = lazy(() => import("@/components/molecules/hisiteHeader"));

const buttonColors = [
  { bgColor: "#FFFFFF", textColor: "#000000" }, // Mint green with black text
  { bgColor: "#9013FE", textColor: "#ffffff" }, // Purple with white text
  { bgColor: "#F5A623", textColor: "#000000" }, // Orange with black text
  { bgColor: "#000000", textColor: "#ffffff" }, // Red with white text
  { bgColor: "#7ED321", textColor: "#000000" }, // Lime green with black text
  { bgColor: "transparent", textColor: "#ffffff" }, // Black with white text
];

const preDefinedColors = [
  "#FFFFFF", // White
  "#9013FE", // Purple
  "#F5A623", // Orange
  "#000000", // Black
  "#7ED321", // Lime green
  "transparent",
];

const MemoCreateBanner = () => {
  const cropperRef = useRef(null);
  const [isPublished, setIsPublished] = useState(false);
  const { businessId } = useParams();
  const bannerRef = useRef<HTMLInputElement | null>(null);

  const [itemName, setItemName] = useState("");
  const [img, setImg] = useState({ logo: "" });
  const [imageFiles, setImageFiles] = useState({ logo: null });
  const [showCropper, setShowCropper] = useState(false);
  const [cropping, setCropping] = useState({ image: null, type: null });
  const [heading, setHeading] = useState("");
  const [paragraph, setParagraph] = useState("");
  const [clickRedirect, setClickRedirect] = useState(false);
  const [callToAction, setCallToAction] = useState("");
  const [redirectionId, setRedirectionId] = useState("");
  const [redirectionType, setRedirectionType] = useState("");
  const editingBanner = useBannerStore((s) => s.selectedBanner);
  const [colorWheelBackground, setColorWheelBackground] = useState(false);
  const [colorWheelParagraph, setColorWheelParagraph] = useState(false);
  const [colorWheelButton, setColorWheelButton] = useState(false);
  const {
    selectedBannerType,
    isButtonExists,
    setBannerPage,
    isPatternExists,
    editBanner,
    onlyImage,
    setIsButtonExists,
    setOnlyImage,
    openPreview,
    setOpenPreview,
  } = useBannerStore((s) => ({
    selectedBannerType: s.selectedBannerType,
    isButtonExists: s.isButtonExists,
    setBannerPage: s.setBannerPage,
    isPatternExists: s.isPatternExists,
    editBanner: s.editBanner,
    onlyImage: s.onlyImage,
    setOnlyImage: s.setOnlyImage,
    setIsButtonExists: s.setIsButtonExists,
    openPreview: s.openPreview,
    setOpenPreview: s.setOpenPreview,
  }));

  const { setToggleExplorePages } = useExploreStore((s) => ({
    setToggleExplorePages: s.setToggleExplorePages,
  }));

  const [isLoading, setIsLoading] = useState(false);
  const [paragraphStyle, setParagraphStyle] = useState<IStyles>({
    color: "",
  });

  const [buttonStyle, setButtonStyle] = useState<IStyles>({
    color: "",
    buttonColor: "",
  });

  const [selectedColor, setSelectedColor] = useState<Color>({
    textColor: "",
    bgColor: "",
  });

  useEffect(() => {
    if (editBanner && editingBanner) {
      setImg((prev) => ({ ...prev, logo: editingBanner?.bannerImage || "" }));
      setHeading(editingBanner?.heading || "");
      setParagraph(editingBanner?.paragraph || "");
      setParagraphStyle((prev) => ({
        ...prev,
        color: editingBanner?.paragraphColor || prev.color,
      }));
      setButtonStyle((prev) => ({
        ...prev,
        color: editingBanner?.buttonColor || prev.color,
      }));
      setRedirectionId(editingBanner?.redirectionId || "");
      setRedirectionType(editingBanner?.redirectionType || "");
      setCallToAction(editingBanner?.callToAction || "");
      setSelectedColor((prev) => ({
        ...prev,
        bgColor: editingBanner?.backgroundColor || "",
      }));
      setItemName(editingBanner?.redirectionName || "");
      setIsPublished(editingBanner?.isPublished || false);
      setIsButtonExists(!!editingBanner?.callToAction);
      if (editingBanner?.layout === BannerType.BANNER_TYPE_14) {
        setOnlyImage(true);
      } else {
        setOnlyImage(false);
      }
    }
  }, [editingBanner, editBanner]);

  const handleImageChange = (event: ChangeEvent<HTMLInputElement>) => {
    const type = event?.target?.dataset?.type;
    const file = event?.target?.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onloadend = () => {
        setCropping({ image: reader.result, type });
        setShowCropper(true);
      };

      setImageFiles((prev) => ({ ...prev, [type]: file }));
    }
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

  const handleHeadingChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      setHeading(e.target.value);
    },
    [],
  );

  const handleDescriptionChange = useCallback(
    (e: ChangeEvent<HTMLTextAreaElement>) => {
      setParagraph(e.target.value);
    },
    [],
  );

  const handleRedirections = useCallback(() => {
    setClickRedirect(true);
  }, []);

  const handleButtonName = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    setCallToAction(e.target.value);
  }, []);

  const handleCustomColor = (
    element: string,
    color: string,
    buttonColor?: string,
  ) => {
    if (element === "paragraph" || element === "heading") {
      setParagraphStyle((prevStyle) => ({ ...prevStyle, color }));
    } else if (element === "button") {
      setButtonStyle((prevStyle) => ({
        ...prevStyle,
        color,
        buttonColor,
      }));
    } else {
      setSelectedColor((prev) => ({ ...prev, bgColor: color }));
    }
  };

  const handleSaveRedirections = (
    type: string,
    id: string,
    itemName: string,
  ) => {
    setRedirectionId(id);
    setRedirectionType(type);
    setItemName(itemName);
  };

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
    if (img && !img.logo && !isPatternExists) {
      return toast.error("Please upload an image");
    }
    let bannerImage: string | undefined;
    if (
      imageFiles?.logo &&
      !img?.logo?.includes("https://storage.hipal.life")
    ) {
      bannerImage = await storeImageAfterSave(
        imageFiles?.logo,
        img?.logo,
        setIsLoading,
      );
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

    let res;
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
  };

  const handleBackClick = () => {
    setBannerPage(BannerPage.VIEW);
    setToggleExplorePages(ExplorePages.BANNERS);
  };
  const handleChangeLayout = () => {
    setBannerPage(BannerPage.VIEW);
    setToggleExplorePages(ExplorePages.BANNERLAYOUTS);
  };

  const handleRemoveImage = useCallback(
    (type: string) => {
      setImageFiles((prev) => ({ ...prev, [type]: null }));
      setImg((prev) => ({ ...prev, [type]: "" }));
    },
    [imageFiles],
  );

  const handleParagraphColor = useCallback(() => {
    setColorWheelParagraph(!colorWheelParagraph);
  }, [colorWheelParagraph]);

  const handlePreview = () => {
    setOpenPreview(!openPreview);
  };

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
            <section className="absolute lg:relative flex justify-center mt-[4rem] xl:translate-y-1/2 -translate-x-1/2 lg:-translate-x-0 -top-8 lg:top-0 left-1/2 lg:left-0 bg-white lg:bg-transparent">
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
        <section className="w-full">
          <section className="mt-[18rem] lg:mt-16 mx-4 md:mt-[30rem]">
            <SubHeader text="Banner Details" />
            <section className="w-full bg-white rounded-2xl">
              <section className="flex items-center justify-between flex-1 p-4 mt-4 space-x-4 md:justify-start">
                <section className="flex gap-4 md:gap-6">
                  {isPatternExists ? null : (
                    <article>
                      <h1 className="mb-2 text-gray-500">Image</h1>
                      <article
                        className={cn(
                          "shrink-0 relative rounded-xl h-[6rem] w-[6rem] md:h-[8rem] md:w-[8rem] inline-block",
                          img?.logo
                            ? ""
                            : "border-dashed border-2 border-[#8C63FF]",
                        )}
                      >
                        <input
                          ref={bannerRef}
                          onClick={(e) => handleClick(e, bannerRef)}
                          type="file"
                          id="logoBanner"
                          style={{ display: "none" }}
                          onChange={handleImageChange}
                          data-type="logo"
                        />
                        <label
                          htmlFor="logoBanner"
                          className="relative flex items-center justify-center w-full h-full overflow-hidden cursor-pointer rounded-xl"
                        >
                          {img?.logo ? (
                            <>
                              <img src={img.logo} alt="Logo" />
                              <button
                                type="button"
                                className="absolute p-0.5 bg-white backdrop-blur-3xl rounded-full top-1 right-1"
                                onClick={() => handleRemoveImage("logo")}
                              >
                                <FaTimes size={12} />
                              </button>
                            </>
                          ) : (
                            <PlusButton />
                          )}
                        </label>
                      </article>
                    </article>
                  )}
                  {onlyImage ? null : (
                    <article>
                      <h1 className="mb-2 text-gray-500">Banner Color</h1>
                      <article
                        onClick={() =>
                          setColorWheelBackground(!colorWheelBackground)
                        }
                        style={{
                          background: selectedColor.bgColor || "transparent",
                          border:
                            selectedColor.bgColor === "transparent" ||
                            selectedColor.bgColor === ""
                              ? "2px dashed #8C63FF"
                              : "1px solid black",
                        }}
                        className={cn(
                          "relative px-3 py-2 rounded-full h-[6rem] w-[6rem] md:h-[8rem] md:w-[8rem] flex justify-center items-center",
                        )}
                      >
                        <PlusButton />
                        <span className="absolute px-4 py-2 bg-white border border-black rounded-full border-1 -bottom-4">
                          <TfiPaintBucket size={16} />
                        </span>
                      </article>
                    </article>
                  )}
                  {onlyImage ? null : (
                    <section className="mb-4">
                      <h1 className="mb-2 text-gray-500">Colors</h1>
                      <article className="grid grid-cols-2 gap-4">
                        {preDefinedColors.map((color) => {
                          return (
                            <article
                              key={color}
                              onClick={() => handleCustomColor("banner", color)}
                              onKeyDown={() =>
                                handleCustomColor("banner", color)
                              }
                              style={{
                                background:
                                  color === "transparent" ? "none" : color,
                                border: "1px solid",
                              }}
                              className="w-8 h-8 rounded-full"
                            >
                              {color === "transparent" && (
                                <span className="flex items-center justify-center w-full h-full text-xs text-center border rounded-full border-1">
                                  <CiNoWaitingSign size={20} />
                                </span>
                              )}
                            </article>
                          );
                        })}
                      </article>
                    </section>
                  )}
                </section>
              </section>
              {onlyImage ? null : (
                <article>
                  <section className="m-4">
                    <div className="relative">
                      <input
                        maxLength={20}
                        type="text"
                        className="w-full rounded-2xl"
                        value={heading}
                        onChange={handleHeadingChange}
                        placeholder="Heading"
                      />
                      <small className="absolute text-gray-700 bottom-3 right-2">
                        {heading.length || 0}/20
                      </small>
                    </div>
                  </section>
                  <section className="m-4">
                    <div className="relative">
                      <textarea
                        maxLength={70}
                        className="w-full h-24 resize-none rounded-2xl"
                        value={paragraph}
                        onChange={handleDescriptionChange}
                        placeholder="Description"
                      />
                      <small className="absolute text-gray-700 bottom-4 right-2">
                        {paragraph.length || 0}/70
                      </small>
                    </div>
                  </section>
                </article>
              )}
            </section>
            {onlyImage ? null : (
              <article className="flex justify-around pt-4 bg-white rounded-t-2xl md:justify-start md:pl-6 md:gap-16">
                <h1 className="text-gray-500">Text Color</h1>
                <h1 className="text-gray-500">Colors</h1>
              </article>
            )}
            {onlyImage ? null : (
              <section className="rounded-b-2xl flex items-center justify-around md:justify-start bg-white pb-[2rem] p-4 md:gap-4">
                <section>
                  <article
                    onClick={handleParagraphColor}
                    onKeyDown={handleParagraphColor}
                    style={{
                      background: paragraphStyle?.color || "transparent",
                      border:
                        paragraphStyle?.color === "transparent"
                          ? "2px dashed #8C63FF"
                          : "1px solid black",
                    }}
                    className={cn(
                      "relative px-3 py-2 rounded-full h-[6rem] w-[6rem] md:h-[8rem] md:w-[8rem] flex justify-center items-center",
                      paragraphStyle?.color?.length
                        ? ""
                        : "border-dashed border-2  border-[#8C63FF]",
                    )}
                  >
                    <PlusButton />
                    <span className="absolute px-4 py-2 bg-white border border-black rounded-full border-1 -bottom-4">
                      <TfiPaintBucket size={16} />
                    </span>
                  </article>
                </section>
                <article className="grid grid-cols-2 gap-4">
                  {preDefinedColors.map((color) => {
                    return (
                      <article
                        key={color}
                        onClick={() => handleCustomColor("paragraph", color)}
                        onKeyDown={() => handleCustomColor("paragraph", color)}
                        style={{ background: color }}
                        className="w-8 h-8 rounded-full border border-1 border-[#000]"
                      >
                        {color === "transparent" && (
                          <span className="flex items-center justify-center w-full h-full text-xs text-center border rounded-full border-1">
                            <CiNoWaitingSign size={20} />
                          </span>
                        )}
                      </article>
                    );
                  })}
                </article>
              </section>
            )}
            <article className="flex-2" />
          </section>
          {isButtonExists && !onlyImage ? (
            <section className="m-6">
              <SubHeader text="Add Button Name" />
              <article className="justify-between gap-10 p-2 pb-4 bg-white rounded-2xl">
                <div className="relative shrink-0">
                  <input
                    type="text"
                    className="w-full rounded-2xl"
                    maxLength={10}
                    value={callToAction}
                    onChange={handleButtonName}
                    placeholder="Button Name"
                  />
                  <small className="absolute text-gray-700 right-2 bottom-2">
                    {callToAction.length}/10
                  </small>
                </div>
                <div className="flex gap-4 mt-4">
                  {preDefinedButtons.map((btn) => {
                    const isSelected = callToAction === btn;
                    return (
                      <button
                        key={btn}
                        type="button"
                        onClick={() => setCallToAction(btn)}
                        className={`px-6 py-2 text-[0.75rem] rounded-full ${
                          isSelected
                            ? "bg-black text-white"
                            : "bg-[#8C63FF40] text-[#8C63FF]"
                        }`}
                      >
                        {btn}
                      </button>
                    );
                  })}
                </div>
                <article className="gap-4 mt-4 md:mt-0">
                  <h1 className="my-2 text-gray-500">Color of action button</h1>
                  <div className="flex gap-4">
                    {buttonColors.map((color) => {
                      return (
                        <article
                          key={color?.bgColor}
                          onClick={() =>
                            handleCustomColor(
                              "button",
                              color?.bgColor === "transparent"
                                ? "#808080"
                                : color?.bgColor,
                              color?.textColor,
                            )
                          }
                          onKeyDown={() =>
                            handleCustomColor(
                              "button",
                              color?.bgColor === "transparent"
                                ? "#808080"
                                : color?.bgColor,
                              color?.textColor,
                            )
                          }
                          style={{
                            background:
                              color?.bgColor === "transparent"
                                ? "white"
                                : color?.bgColor,
                            color: color?.textColor,
                          }}
                          className="w-8 h-8 rounded-full  border border-1 border-[#000]"
                        >
                          {color?.bgColor === "transparent" && (
                            <span className="flex items-center justify-center w-full h-full text-xs text-center border rounded-full border-1">
                              <CiNoWaitingSign size={20} color="#000" />
                            </span>
                          )}
                        </article>
                      );
                    })}
                  </div>
                </article>
              </article>
            </section>
          ) : null}
          <section className="m-6 pb-[7rem]">
            <SubHeader text="Link Items" />
            <article className="p-4 bg-white rounded-2xl">
              <button
                onClick={handleRedirections}
                type="button"
                className="w-full py-2 bg-gray-100 rounded-full"
              >
                <h1>
                  &#128279; Categories | dish{" "}
                  <span className="font-semibold">{itemName}</span>
                </h1>
              </button>
            </article>
          </section>
          <BottomButton
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
        </section>
      </main>
      <CropperPopup
        show={showCropper}
        onSave={handleCrop}
        onClose={() => setShowCropper(false)}
      >
        <ReactCropper
          image={cropping.image}
          ref={cropperRef}
          width={400}
          height={400}
        />
      </CropperPopup>
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
      {colorWheelButton && (
        <PopUp
          show={colorWheelButton}
          onClose={() => setColorWheelButton(!colorWheelButton)}
        >
          <ExploreColorWheel
            close={() => setColorWheelButton(!colorWheelButton)}
            colorType="button"
            style={buttonStyle}
            setStyle={setButtonStyle}
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
