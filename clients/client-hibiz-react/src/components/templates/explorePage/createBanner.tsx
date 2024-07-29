import {
  type ChangeEvent,
  memo,
  startTransition,
  useEffect,
  useRef,
  useState,
  Suspense,
  lazy,
  useCallback,
} from "react";
import { TfiPaintBucket } from "react-icons/tfi";
import { apiRpc } from "@hi/common";
import { useNavigate, useParams } from "react-router-dom";
import {
  cn,
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
import { BannerPage } from "@/components/utils/bannerLayouts";

// Lazy load components
const BannerDynamicLayout = lazy(() => import("./bannerDynamicLayout"));
const ReactCropper = lazy(() => import("@/components/cropper"));
const PopUp = lazy(() => import("@/components/atom/popUp"));
const MiddlePopUp = lazy(() => import("@/components/atom/middlePopUp"));
const SubHeader = lazy(() => import("@/components/atom/subHeader"));
const PlusButton = lazy(() => import("@/components/atom/plusButton"));
const RedirectionPopUp = lazy(() => import("./redirectionPopUp"));
const ExploreColorWheel = lazy(() => import("./exploreColorWheel"));
const SectionLoader = lazy(() => import("@/components/atom/sectionLoader"));
const LoadingSpinner = lazy(() => import("@/components/atom/loadingSpinner"));
const HisiteHeader = lazy(() => import("@/components/molecules/hisiteHeader"));

const buttonColors = [
  { bgColor: "#FACA50", textColor: "#000000" },
  { bgColor: "#F3764A", textColor: "#000000" },
  { bgColor: "#8D0F16", textColor: "#ffffff" },
  { bgColor: "#FDF5D7", textColor: "#000000" },
];

const preDefinedColors = ["#FACA50", "#F3764A", "#8D0F16", "#FDF5D7"];

const MemoCreateBanner = () => {
  const cropperRef = useRef(null);
  const [isPublished, setIsPublished] = useState(false);
  const navigate = useNavigate();
  const { businessId } = useParams();

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
    setSelectedBannerType,
    selectedBannerType,
    isButtonExists,
    setBannerPage,
    isPatternExists,
    editBanner,
  } = useBannerStore((s) => ({
    setSelectedBannerType: s.setSelectedBannerType,
    selectedBannerType: s.selectedBannerType,
    isButtonExists: s.isButtonExists,
    setBannerPage: s.setBannerPage,
    isPatternExists: s.isPatternExists,
    editBanner: s.editBanner,
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
    if (heading.length === 0) {
      return toast.error("Heading and Description are required");
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
    console.log("payload", payload);
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
      toast.success("Banner Created Successfully");
      navigate(`/app/business/${businessId}/banners`);
    }
    setBannerPage(BannerPage.VIEW);
  };

  const handleBackClick = () => {
    setBannerPage(BannerPage.VIEW);
    startTransition(() => {
      navigate(`/app/business/${businessId}/banners`);
    });
  };
  const handleChangeLayout = () => {
    setBannerPage(BannerPage.VIEW);
    startTransition(() => {
      navigate(`/app/business/${businessId}/banners/new`);
    });
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

  return (
    <Suspense fallback={<LoadingSpinner />}>
      <main className="relative h-screen">
        <section className="fixed top-0 bg-white w-full h-[17rem] z-10 max-w-[69rem]">
          <HisiteHeader isIconBusinessShow={false} onBack={handleBackClick} />
          <section className="absolute flex justify-center mt-[4rem] -translate-x-1/2 -top-8 left-1/2 bg-white">
            <BannerDynamicLayout
              img={img}
              selectedColor={selectedColor}
              buttonStyle={buttonStyle}
              callToAction={callToAction}
              paragraphStyle={paragraphStyle}
              heading={heading}
              paragraph={paragraph}
            />
          </section>
          &nbsp;
          <center className="absolute -translate-x-1/2 -bottom-4 left-1/2">
            <button
              type="button"
              onClick={handleChangeLayout}
              className="flex items-center justify-center px-3 py-1 space-x-2 text-sm text-white bg-black rounded-full"
            >
              <BsGrid /> <span>Change Layout</span>
            </button>
          </center>
        </section>
        <section>
          <section className="mt-[18rem] mx-4">
            <SubHeader text="Banner Details" />
            <section className="bg-white md:flex md:items-center">
              <section className="flex items-center justify-between flex-1 p-4 mt-4 space-x-4 md:justify-start">
                <section className="flex items-center flex-1 gap-6">
                  {isPatternExists ? null : (
                    <article>
                      <h1 className="mb-2 text-gray-500">Add an Image</h1>
                      <article
                        className={cn(
                          "shrink-0 relative rounded-xl h-[6rem] w-[6rem] md:h-[8rem] md:w-[8rem] inline-block",
                          img?.logo
                            ? ""
                            : "border-dashed border-2  border-[#8C63FF]",
                        )}
                      >
                        <input
                          onClick={() =>
                            document.getElementById("logoInput")?.click()
                          }
                          type="file"
                          id="logoInput"
                          style={{ display: "none" }}
                          onChange={handleImageChange}
                          data-type="logo"
                        />
                        <label
                          htmlFor="logoInput"
                          className="relative flex items-center justify-center w-full h-full overflow-hidden cursor-pointer rounded-xl"
                        >
                          {img?.logo ? (
                            <>
                              <img src={img.logo} alt="Logo" />
                              <button
                                type="button"
                                className="absolute p-1 bg-white rounded-full top-2 right-2"
                                onClick={() => handleRemoveImage("logo")}
                              >
                                <FaTimes />
                              </button>
                            </>
                          ) : (
                            <PlusButton />
                          )}
                        </label>
                      </article>
                    </article>
                  )}
                  <article>
                    <h1 className="mb-2 text-gray-500">Banner Color</h1>
                    <article
                      onClick={() =>
                        setColorWheelBackground(!colorWheelBackground)
                      }
                      style={{
                        background: selectedColor.bgColor || "transparent",
                      }}
                      className={cn(
                        "relative px-3 py-2 inline-block rounded-full h-[6rem] w-[6rem] md:h-[8rem] md:w-[8rem] flex justify-center items-center",
                        selectedColor?.bgColor?.length
                          ? ""
                          : "border-dashed border-2  border-[#8C63FF]",
                      )}
                    >
                      <PlusButton />
                      <span className="absolute px-4 py-2 bg-white border border-black rounded-full border-1 -bottom-4">
                        <TfiPaintBucket size={16} />
                      </span>
                    </article>
                  </article>
                  <section className="mb-4">
                    <h1 className="mb-2 text-gray-500">Suggested Colors</h1>
                    <article className="grid grid-cols-2 gap-4">
                      {preDefinedColors.map((color) => {
                        return (
                          <article
                            key={color}
                            onClick={() => handleCustomColor("banner", color)}
                            style={{ background: color }}
                            className="w-8 h-8 rounded-full"
                          />
                        );
                      })}
                    </article>
                  </section>
                </section>
              </section>
              <article className="">
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
                      {heading.length}/20
                    </small>
                  </div>
                </section>
                <section className="m-4">
                  <div className="relative">
                    <textarea
                      maxLength={70}
                      className="w-full h-24 resize-none md:w-72 lg:w-96 rounded-2xl"
                      value={paragraph}
                      onChange={handleDescriptionChange}
                      placeholder="Description"
                    />
                    <small className="absolute text-gray-700 bottom-4 right-2">
                      {paragraph.length}/70
                    </small>
                  </div>
                </section>
              </article>
            </section>
            <article className="flex justify-around p-4 bg-white md:justify-start md:gap-10 md:space-x-10">
              <h1 className="text-gray-500">Text Color</h1>
              <h1 className="text-gray-500">Suggested Colors</h1>
            </article>
            <section className="flex items-center justify-around md:justify-start bg-white pb-[2rem] p-4 md:gap-4">
              <section>
                <article
                  onClick={handleParagraphColor}
                  style={{
                    background: paragraphStyle?.color || "transparent",
                  }}
                  className={cn(
                    "relative px-3 py-2 inline-block rounded-full h-[6rem] w-[6rem] md:h-[8rem] md:w-[8rem] flex justify-center items-center",
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
              <section>
                <article className="flex gap-4">
                  {preDefinedColors.map((color) => {
                    return (
                      <article
                        key={color}
                        onClick={() => handleCustomColor("paragraph", color)}
                        style={{ background: color }}
                        className="w-8 h-8 rounded-full"
                      />
                    );
                  })}
                </article>
              </section>
            </section>
            <article className="flex-2"></article>
          </section>
          {isButtonExists ? (
            <section className="m-6">
              <SubHeader text="Add Button Name" />
              <article className="flex items-center justify-between p-2 bg-white rounded-2xl">
                <article className="md:flex md:justify-around md:items-center md:gap-4">
                  <div className="relative">
                    <input
                      type="text"
                      className="w-full rounded-2xl"
                      maxLength={10}
                      value={callToAction}
                      onChange={handleButtonName}
                      placeholder="Button Name"
                    />
                    <small className="absolute text-gray-700 right-2 bottom-2">
                      {callToAction.length}/16
                    </small>
                  </div>
                  <div className="flex gap-4 mt-4 md:mt-0">
                    {preDefinedButtons.map((btn) => {
                      return (
                        <button
                          key={btn}
                          type="button"
                          onClick={() => setCallToAction(btn)}
                          className="px-6 py-2 text-[0.75rem] bg-[#8C63FF40] text-[#8C63FF] rounded-full"
                        >
                          {btn}
                        </button>
                      );
                    })}
                  </div>
                  <article className="gap-4 mt-4 md:mt-0">
                    <h1 className="my-2 text-gray-500">
                      Color of action button
                    </h1>
                    <div className="flex gap-4">
                      {buttonColors.map((color) => {
                        return (
                          <article
                            key={color?.bgColor}
                            onClick={() =>
                              handleCustomColor(
                                "button",
                                color?.bgColor,
                                color?.textColor,
                              )
                            }
                            style={{
                              background: color?.bgColor,
                              color: color?.textColor,
                            }}
                            className="w-8 h-8 rounded-full"
                          />
                        );
                      })}
                    </div>
                  </article>
                </article>
              </article>
            </section>
          ) : null}
          <section className="m-6 pb-[7rem] md:pb-0">
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
        </section>
        <footer className="fixed md:absolute bottom-0 flex w-[92%] lg:w-[96%] gap-4 mx-4 mb-4">
          <button
            type="submit"
            className="w-full py-3 text-white bg-[#7D68FE] rounded-full"
            disabled={isLoading}
            onClick={() => {
              const newIsPublished = !isPublished;
              setIsPublished(newIsPublished);
              handleCreateBanner(newIsPublished);
            }}
          >
            {isLoading ? (
              <div className="flex items-center justify-center">
                <SectionLoader />
                Loading...
              </div>
            ) : isPublished ? (
              "Unpublish"
            ) : (
              "Publish"
            )}
          </button>
          <button
            onClick={() => handleCreateBanner(isPublished)}
            type="button"
            disabled={isLoading}
            className="w-full py-3 text-white bg-black rounded-full"
          >
            {isLoading ? (
              <div className="flex items-center justify-center">
                <SectionLoader />
                Loading...
              </div>
            ) : (
              "Save"
            )}
          </button>
        </footer>
      </main>
      <MiddlePopUp
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
      </MiddlePopUp>
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
      {isLoading ? <SectionLoader /> : null}
    </Suspense>
  );
};

const CreateBanner = memo(MemoCreateBanner);
export default CreateBanner;
