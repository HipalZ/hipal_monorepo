import {
  type ChangeEvent,
  memo,
  startTransition,
  useEffect,
  useRef,
  useState,
  Suspense,
  lazy,
} from "react";
import { BannerType, bannerTypes } from "./explorePageStore";
import { IoMdColorPalette } from "react-icons/io";
import { TfiPaintBucket } from "react-icons/tfi";
import { apiRpc } from "@hi/common";
import { useNavigate, useParams } from "react-router-dom";
import { storeImageAfterSave } from "@/components/utils/helper";
import toast from "react-hot-toast";
import type {
  Color,
  IBannerPayload,
  IStyles,
} from "@/components/types/businessData";
import BannerDummy from "@/assets/hisite/bannerDummy.jpg";
import layout3 from "@/assets/hisite/layout3.jpg";
import { useBannerStore } from "@/components/store/useBannerStore";
import { Switch } from "@headlessui/react";
import HeaderDropDown from "./headerDropDown";
import LoadingSpinner from "@/components/atom/loadingSpinner";
import { cropImage } from "@/components/cropper";
import MemoizedHeader from "@/components/molecules/header";
import { FaArrowLeft } from "react-icons/fa";
import HisiteHeader from "@/components/molecules/hisiteHeader";
import { BsGrid } from "react-icons/bs";

// Lazy load components
const ReactCropper = lazy(() => import("@/components/cropper"));
const PopUp = lazy(() => import("@/components/atom/popUp"));
const MiddlePopUp = lazy(() => import("@/components/atom/middlePopUp"));
const BottomButton = lazy(() => import("@/components/atom/bottomButton"));
const ChangeBannerColor = lazy(() => import("./changebannerColor"));
const SubHeader = lazy(() => import("@/components/atom/subHeader"));
const StylingsIcons = lazy(() => import("./stylingsIcons"));
const PlusButton = lazy(() => import("@/components/atom/plusButton"));
const RedirectionPopUp = lazy(() => import("./redirectionPopUp"));
const ExploreColorWheel = lazy(() => import("./exploreColorWheel"));

const MemoCreateBanner = () => {
  const cropperRef = useRef(null);
  const [isPublished, setIsPublished] = useState(false);
  const navigate = useNavigate();
  const { businessId, editBanner } = useParams();

  const [itemName, setItemName] = useState("");
  const [img, setImg] = useState({ logo: "" });
  const [imageFiles, setImageFiles] = useState({ logo: null });
  const [showCropper, setShowCropper] = useState(false);
  const [cropping, setCropping] = useState({ image: null, type: null });
  const [heading, setHeading] = useState("");
  const [paragraph, setParagraph] = useState("");
  const [clickRedirect, setClickRedirect] = useState(false);
  const [callToAction, setCallToAction] = useState("");
  const [isColorPickerVisible, setIsColorPickerVisible] = useState(false);
  const [isDropDownVisible, setIsDropDownVisible] = useState(false);
  const [clickedChangeColor, setClickedChangeColor] = useState(false);
  const [redirectionId, setRedirectionId] = useState("");
  const [redirectionType, setRedirectionType] = useState("");

  const editingBanner = useBannerStore((s) => s.selectedBanner);
  const [colorWheelBackground, setColorWheelBackground] = useState(false);
  const [colorWheelHeading, setColorWheelHeading] = useState(false);
  const [colorWheelParagraph, setColorWheelParagraph] = useState(false);
  const [colorWheelButton, setColorWheelButton] = useState(false);

  const { setSelectedBannerType, selectedBannerType } = useBannerStore((s) => ({
    setSelectedBannerType: s.setSelectedBannerType,
    selectedBannerType: s.selectedBannerType,
    buttonStyle: s.buttonStyle,
    setButtonStyle: s.setButtonStyle,
    headingStyle: s.headingStyle,
    setHeadingStyle: s.setHeadingStyle,
    paragraphStyle: s.paragraphStyle,
    setParagraphStyle: s.setParagraphStyle,
    selectedColor: s.selectedColor,
    setSelectedColor: s.setSelectedColor,
  }));

  const [headingStyle, setHeadingStyle] = useState<IStyles>({
    textAlign: "left",
    fontWeight: 400,
    color: "",
  });

  const [paragraphStyle, setParagraphStyle] = useState<IStyles>({
    textAlign: "left",
    fontWeight: 400,
    color: "",
  });

  const [buttonStyle, setButtonStyle] = useState<IStyles>({
    textAlign: "left",
    fontWeight: 400,
    color: "",
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
        textAlign: editingBanner?.paragraphAlign || prev.textAlign,
        color: editingBanner?.paragraphColor || prev.color,
        fontWeight:
          Number(editingBanner?.paragraphFontWeight) || Number(prev.fontWeight),
      }));
      setHeadingStyle((prev) => ({
        ...prev,
        textAlign: editingBanner?.headingAlign || prev.textAlign,
        fontWeight: Number(editingBanner?.headingFontWeight || prev.fontWeight),
        color: editingBanner?.headingColor || prev.color,
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
      setSelectedBannerType(editingBanner?.bannerType || "");
    }
  }, [editBanner, editingBanner]);

  const toggleDropDown = () => {
    setIsDropDownVisible(!isDropDownVisible);
  };

  const handleOptionClick = (bannerId: string) => {
    setSelectedBannerType(bannerId);
    setIsDropDownVisible(false);
  };

  const handleChangeColors = () => {
    setClickedChangeColor(!clickedChangeColor);
    if (!clickedChangeColor) {
      startTransition(() => {
        navigate(-1);
      });
    }
  };

  const toggleColor = () => {
    setClickedChangeColor(!clickedChangeColor);
  };

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

  const handleHeadingChange = (e: ChangeEvent<HTMLInputElement>) => {
    setHeading(e.target.value);
  };

  const handleDescriptionChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    setParagraph(e.target.value);
  };

  const handleRedirections = () => {
    setClickRedirect(true);
  };

  const handleButtonName = (e: ChangeEvent<HTMLInputElement>) => {
    setCallToAction(e.target.value);
  };

  const handleColorChange = (
    color: Color,
    event: ChangeEvent<HTMLInputElement>,
  ) => {
    setSelectedColor({
      textColor: color
        ? color.textColor
          ? color.textColor
          : ""
        : event.target.value,
      bgColor: color
        ? color.bgColor
          ? color.bgColor
          : ""
        : event.target.value,
    });
    setHeadingStyle((prevStyle) => ({ ...prevStyle, color: color.textColor }));
    setParagraphStyle((prevStyle) => ({
      ...prevStyle,
      color: color.textColor,
    }));
    setButtonStyle((prevStyle) => ({ ...prevStyle, color: color.textColor }));
  };

  const handleAlignmentChange = (element: string, alignment: string) => {
    if (element === "heading") {
      setHeadingStyle((prevStyle) => ({ ...prevStyle, textAlign: alignment }));
    } else if (element === "paragraph") {
      setParagraphStyle((prevStyle) => ({
        ...prevStyle,
        textAlign: alignment,
      }));
    }
  };

  const handleFontWeightChange = (element: string) => {
    if (element === "heading") {
      setHeadingStyle((prevStyle) => ({
        ...prevStyle,
        fontWeight:
          prevStyle.fontWeight >= 900 ? 400 : prevStyle.fontWeight + 100,
      }));
    } else if (element === "paragraph") {
      setParagraphStyle((prevStyle) => ({
        ...prevStyle,
        fontWeight:
          prevStyle.fontWeight >= 900 ? 400 : prevStyle.fontWeight + 100,
      }));
    }
  };

  const handleCustomColor = (element: string, color: string) => {
    if (element === "heading") {
      setHeadingStyle((prevStyle) => ({ ...prevStyle, color }));
    } else if (element === "paragraph") {
      setParagraphStyle((prevStyle) => ({ ...prevStyle, color }));
    } else if (element === "button") {
      console.log("button", element, color);
      setButtonStyle((prevStyle) => ({ ...prevStyle, color }));
    }
  };

  const truncateDescription = (textContent: string) => {
    return textContent.length > 70
      ? `${textContent.substring(0, 70)}...`
      : textContent;
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

  const handleCreateBanner = async () => {
    if (!businessId) return;
    let bannerImage: string | undefined;
    if (imageFiles?.logo) {
      bannerImage = await storeImageAfterSave(imageFiles?.logo);
    }
    const payload: IBannerPayload = {
      businessId,
      isPublished,
      bannerType: selectedBannerType,
      bannerImage,
      heading,
      headingColor: headingStyle.color,
      headingFontWeight: headingStyle.fontWeight.toString(),
      headingAlign: headingStyle.textAlign.toUpperCase(),
      paragraph,
      paragraphColor: paragraphStyle.color,
      paragraphFontWeight: paragraphStyle.fontWeight.toString(),
      paragraphAlign: paragraphStyle.textAlign.toUpperCase(),
      buttonColor: buttonStyle.color,
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
      toast.success("Banner Created Successfully");
      navigate(`/app/business/${businessId}/banners`);
    }
  };

  const handleBackClick = () => {
    startTransition(() => {
      navigate(`/app/business/${businessId}/banners`);
    });
    setSelectedBannerType(BannerType.BANNER_TYPE_0);
  };

  return (
    <Suspense fallback={<LoadingSpinner />}>
      <main className="relative h-screen">
        <section className="fixed top-0 bg-white w-full pb-[1rem] z-10 max-w-[69rem]">
          <HisiteHeader isIconBusinessShow={false} onBack={handleBackClick} />
          <section className="flex justify-center w-full bg-white">
            {selectedBannerType === BannerType.BANNER_TYPE_1 && (
              <article
                style={{
                  backgroundColor: selectedColor.bgColor,
                  height: "268px",
                  width: "268px",
                }}
                className="flex flex-col justify-between p-4 py-6 border rounded-2xl"
              >
                <div>
                  <h1 style={headingStyle} className="text-xl">
                    {heading ? truncateDescription(heading) : "Heading"}
                  </h1>
                  <p style={paragraphStyle}>
                    {paragraph
                      ? truncateDescription(paragraph)
                      : "Lorem Ipsum has been the industrys standard dummy text ever since the 1500s"}
                  </p>
                </div>
                <div>
                  <button
                    type="button"
                    style={{
                      color: buttonStyle?.color,
                      border: `1px solid ${
                        buttonStyle?.color || selectedColor?.textColor
                      }`,
                    }}
                    className="px-4 py-1 rounded-full"
                  >
                    {callToAction ? callToAction : "Link"}
                  </button>
                </div>
              </article>
            )}
            {selectedBannerType === BannerType.BANNER_TYPE_2 && (
              <article
                style={{
                  backgroundImage: `url(${img?.logo || BannerDummy})`,
                  backgroundColor: selectedColor.bgColor,
                  height: "268px",
                  width: "268px",
                }}
                className="flex flex-col justify-between p-4 py-6 bg-cover rounded-2xl"
              >
                <div>
                  <h1 style={headingStyle} className="text-xl">
                    {heading ? truncateDescription(heading) : "Heading"}
                  </h1>
                  <p style={paragraphStyle} className="my-4">
                    {paragraph
                      ? truncateDescription(paragraph)
                      : "Lorem Ipsum has been the industrys standard dummy text ever since the 1500s"}
                  </p>
                </div>
                <div>
                  <button
                    type="button"
                    style={{
                      color: buttonStyle?.color,
                      border: `1px solid ${
                        buttonStyle?.color || selectedColor?.textColor
                      }`,
                    }}
                    className="px-4 py-1 rounded-full"
                  >
                    {callToAction ? callToAction : "Link"}
                  </button>
                </div>
              </article>
            )}
            {selectedBannerType === BannerType.BANNER_TYPE_3 && (
              <section
                style={{
                  backgroundColor: selectedColor.bgColor,
                  height: "268px",
                  width: "268px",
                }}
                className="relative grid mt-4 overflow-hidden bg-white border aspect-square rounded-2xl border-1"
              >
                <div className="row-span-3">
                  <img
                    src={img?.logo || layout3}
                    alt="BannerDummy"
                    className="w-full h-full bg-cover"
                  />
                </div>
                <section className="absolute bottom-0 flex items-center justify-between w-full px-2 ">
                  <article className="w-full p-2 mt-1 mb-2 bg-white rounded-lg">
                    <h1 style={headingStyle} className="text-sm">
                      {heading ? truncateDescription(heading) : "Heading"}
                    </h1>
                    <p style={paragraphStyle} className="my-2 text-xs">
                      {paragraph
                        ? truncateDescription(paragraph)
                        : "Lorem Ipsum has been the industrys "}
                    </p>
                    <button
                      type="button"
                      style={{
                        color: buttonStyle?.color || selectedColor?.textColor,
                        border: `1px solid ${
                          buttonStyle?.color || selectedColor?.textColor
                        }`,
                      }}
                      className="w-full px-4 py-1 text-xs border border-black rounded-full border-1"
                    >
                      {callToAction ? callToAction : "Link"}
                    </button>
                  </article>
                </section>
              </section>
            )}
          </section>
          &nbsp;
          {clickedChangeColor ? null : (
            <center>
              <button
                type="button"
                onClick={handleBackClick}
                className="flex items-center justify-center px-4 py-2 space-x-2 bg-gray-200 rounded-full"
              >
                <BsGrid /> <span>Change Layout</span>
              </button>
            </center>
          )}
        </section>
        {clickedChangeColor ? (
          <ChangeBannerColor handleColorChange={handleColorChange} />
        ) : (
          <section>
            <section className="mt-[28rem] mx-6">
              <article className="flex items-center justify-between p-4 mb-4 bg-white rounded-2xl">
                <SubHeader text="Publish Banner" />
                <Switch
                  checked={isPublished}
                  onChange={setIsPublished}
                  className="mb-4 group inline-flex h-6 w-11 items-center rounded-full bg-gray-200 transition data-[checked]:bg-green-500"
                >
                  <span className="size-4 translate-x-1 rounded-full bg-white transition group-data-[checked]:translate-x-6" />
                </Switch>
              </article>
              <SubHeader text="Banner Details" />
              <section className="bg-white pb-[1rem]">
                <section className="flex items-center justify-between p-4 mt-4 space-x-4">
                  {selectedBannerType !== BannerType.BANNER_TYPE_1 && (
                    <article className="shrink-0 relative rounded-xl h-[8rem] w-[8rem] border-dashed border-2 inline-block border-[#8C63FF]">
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
                        className="flex items-center justify-center w-full h-full overflow-hidden cursor-pointer rounded-xl"
                      >
                        {img.logo ? (
                          <img src={img.logo} alt="Logo" />
                        ) : (
                          <PlusButton />
                        )}
                      </label>
                    </article>
                  )}
                  <h1>Background color</h1>
                  <article
                    onClick={() =>
                      setColorWheelBackground(!colorWheelBackground)
                    }
                    className="px-3 py-2 border border-black rounded-2xl border-1"
                  >
                    <span>
                      <TfiPaintBucket size={24} />
                    </span>
                  </article>
                  <PopUp
                    show={colorWheelBackground}
                    onClose={() =>
                      setColorWheelBackground(!colorWheelBackground)
                    }
                  >
                    <ExploreColorWheel
                      close={() =>
                        setColorWheelBackground(!colorWheelBackground)
                      }
                      colorType="backgroundColor"
                      setStyle={setSelectedColor}
                      style={selectedColor}
                    />
                  </PopUp>
                </section>
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
                      {heading.length}/15
                    </small>
                  </div>
                  <StylingsIcons
                    setIsColorPickerVisible={setIsColorPickerVisible}
                    isColorPickerVisible={isColorPickerVisible}
                    element="heading"
                    onAlignmentChange={handleAlignmentChange}
                    onFontWeightChange={handleFontWeightChange}
                    onColorChange={handleCustomColor}
                    colorWheel={colorWheelHeading}
                    setColorWheel={setColorWheelHeading}
                  />
                  <PopUp
                    show={colorWheelHeading}
                    onClose={() => setColorWheelHeading(!colorWheelHeading)}
                  >
                    <ExploreColorWheel
                      close={() => setColorWheelHeading(!colorWheelHeading)}
                      colorType="heading"
                      style={headingStyle}
                      setStyle={setHeadingStyle}
                    />
                  </PopUp>
                </section>
                &nbsp;
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
                      {paragraph.length}/70
                    </small>
                  </div>
                  <StylingsIcons
                    setIsColorPickerVisible={setIsColorPickerVisible}
                    isColorPickerVisible={isColorPickerVisible}
                    element="paragraph"
                    onAlignmentChange={handleAlignmentChange}
                    onFontWeightChange={handleFontWeightChange}
                    onColorChange={handleCustomColor}
                    colorWheel={colorWheelParagraph}
                    setColorWheel={setColorWheelParagraph}
                  />
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
                </section>
              </section>
            </section>
            <section className="m-6">
              <SubHeader text="Add Button Name" />
              <article className="flex items-center justify-between p-2 bg-white rounded-2xl">
                <div className="relative">
                  <input
                    type="text"
                    className="rounded-2xl"
                    maxLength={16}
                    value={callToAction}
                    onChange={handleButtonName}
                    placeholder="Button Name"
                  />
                  <small className="absolute text-gray-700 right-2 bottom-2">
                    {callToAction.length}/16
                  </small>
                </div>
                <article
                  onClick={() => setColorWheelButton(!colorWheelButton)}
                  className="w-12 px-3 py-2 border border-black rounded-2xl border-1"
                >
                  <span>
                    <TfiPaintBucket size={24} />
                  </span>
                </article>
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
              </article>
            </section>
            <section className="m-6 pb-[7rem]">
              <SubHeader text="Call to action" />
              <article className="p-4 bg-white rounded-2xl">
                <button
                  onClick={handleRedirections}
                  type="button"
                  className="w-full py-2 bg-gray-100 rounded-full"
                >
                  <h1>&#128279; Categories or dish</h1>
                </button>
              </article>
              &nbsp;
              {itemName && (
                <article className="p-4 bg-white rounded-2xl">
                  <h1 className="font-normal">
                    Selected Item:{" "}
                    <span className="font-semibold">{itemName}</span>
                  </h1>
                </article>
              )}
            </section>
            <BottomButton text="Save Changes" onClick={handleCreateBanner} />
          </section>
        )}
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
      </main>
    </Suspense>
  );
};

const CreateBanner = memo(MemoCreateBanner);
export default CreateBanner;
