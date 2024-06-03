import React, { memo, useEffect, useRef, useState } from "react";
import { GoAlert } from "react-icons/go";
import LoyalityCard from "../loyalityCard";
import {
  beans,
  bowl,
  bud,
  flower,
  love,
  triangleToDataurl,
  waveToDataUrl,
} from "../pathPattern";
import Cards from "../cards";
import { BsUpload } from "react-icons/bs";
import "react-advanced-cropper/dist/style.css";
import {ReactCropper} from "@/components/atom/cropImage";
import { useCroppedImage } from "@/components/store/useCroppedImage";
import useBusinessData from "@/components/store/useBusinessData";
import { useLoyalityData } from "@/components/store/useLoyality";

const LoyalityCardPopup = () => {
  const croppedImage = useCroppedImage((s) => s.croppedImage);
  const themes = useBusinessData((s) => s.themes);
  const businessData = useBusinessData((s) => s.businessData);
  const logo = useLoyalityData((s) => s.logo);
  const setLogo = useLoyalityData((s) => s.setLogo);
  const findPattern = (pattern: string) => {
    const value = srcColor.find((item) => item.src.hasOwnProperty(pattern));
    return value?.src;
  };
  const {
    cardColor,
    setCardColor,
    fontColor,
    setFontColor,
    cardPattern,
    setCardPattern,
  } = useLoyalityData();

  useEffect(() => {
    if (cardColor === '') {
      setCardColor(themes?.primaryColor);
    } if (fontColor === '') {
      setFontColor(themes?.secondaryColor);
    }
  }, [])

  const srcColor = [
    {
      src: { wave: waveToDataUrl(cardColor, "white").wave },
    },
    {
      src: {
        triangle: triangleToDataurl("white").triangle,
      },
    },
    {
      src: {
        beans: beans(fontColor).beans,
      },
    },
    {
      src: { bud: bud(fontColor).bud },
    },
    {
      src: { bowl: bowl(fontColor).bowl },
    },
    {
      src: { love: love(fontColor).love },
    },
    {
      src: { flower: flower(fontColor).flower },
    },
  ];
  const mapCards = () => {

    function handleClickedCard(img: any) {
      setCardPattern(img);
    }
    return (
      <>
        {srcColor ?
          srcColor.map((image, index) => {
            const isActive =
              cardPattern &&
              Object?.keys(cardPattern)[0] === Object?.keys(image.src)[0];
            return (
              <div onKeyDown={()=>handleClickedCard(image.src)} 
              key={index.toString()} onClick={() => handleClickedCard(image.src)}>
                <Cards
                  size="lg"
                  src={image.src}
                  imageSrc={Object.values(image.src)[0]}
                  isActive={isActive}
                  fontColor={fontColor || themes?.accentColor}
                  logo={logo || businessData?.logo}
                />
              </div>
            );
          }) : ''}
      </>
    );
  };

  const colorRef = useRef<null | HTMLInputElement>(null);
  const fontRef = useRef<null | HTMLInputElement>(null);
  const cropperRef = useRef(null);
  const onChangeCardColorPicker = (e: any) => {
    setCardColor(e.target.value);
  };

  const onChangeCardColorInput = (e: any) => {
    const newColor = e.target.value;
    if (newColor.length <= 7) {
      setCardColor(newColor);
      if (isValidHexColor(newColor)) {
        if (colorRef.current === null || undefined) return;
        colorRef.current.value = newColor;
      }
    }
  };
  const onChangeFontColorPicker = (e: any) => {
    setFontColor(e.target.value);
  };

  const onChangeFontColorInput = (e: any) => {
    const newColor: string = e.target.value;
    if (newColor.length <= 7) {
      setFontColor(newColor);
      if (isValidHexColor(newColor)) {
        if (fontRef.current === null || undefined) return;
        fontRef.current.value = newColor;
      }
    }
  };
  const isValidHexColor = (color: string) => {
    return /^#([0-9A-F]{3}){1,2}$/i.test(color);
  };
  const [showCropper, setShowCropper] = useState(false);

  const handleClose = () => {
    setShowCropper(false);
  };
  const handleImageChange = (e: any) => {
    const file = e?.target?.files[0];
    const fileType = file?.type;

    if (
      fileType === "image/jpeg" ||
      fileType === "image/png" ||
      fileType === "image/jpg"
    ) {
      const reader = new FileReader();

      reader.onload = (event) => {
        setLogo(event?.target?.result as string);
        setShowCropper(true);
      };

      reader?.readAsDataURL(file);
    } else {
      alert("Invalid file type. Please upload a .jpg, .jpeg, or .png file.");
      e.target.value = "";
    }
  };

  return (
    <>
      {showCropper ? (
        <div>
          <div>
            <ReactCropper
              image={logo || businessData?.logo}
              ref={cropperRef}
            />
          </div>
          <div className="flex py-2 bg-white">
            <button
              type="button"
              className="fixed bottom-5 on_active_bounce mx-4 text-white rounded-md bg-[#2B354D] py-2.5 w-full max-w-[25rem]"
              onClick={handleClose}
            >
              Save & Close
            </button>
          </div>
        </div>
      ) : (
        <div
          style={{ height: "calc(85vh)" }}
          className="overflow-y-auto relative bg-[#F5F5F5] rounded-t-3xl"
        >
          <div className="sticky top-0 pt-4">
            <h1 className="mx-7 text-2xl text-[#2B354D]">
              Loyalty card set up
            </h1>
            <div className="my-3.5 flex items-center justify-start h-16 px-7 bg-white border-y-[0.065rem] border-[#CACACA]">
              <GoAlert color="#F2634C" />
              <p className="mx-2 text-[#2B354D] text-sm">
                Please create a card in harmony with themes.
              </p>
            </div>
          </div>
          {/* change to theme color */}
          <div
            style={{ backgroundColor: `${themes?.primaryColor}` }}
            className="bg-white pb-4 sticky top-0 flex flex-col items-center justify-center"
          >
            <h1 className="mr-auto px-7 py-4 text-base text-[#2B354D] font-semibold">
              Card Preview
            </h1>
            <LoyalityCard
              logo={logo || businessData?.logo}
              croppedImage={croppedImage}
              cardColor={cardColor || themes?.secondaryColor}
              fontColor={fontColor || themes?.accentColor}
              src={cardPattern}
              size={"lg"}
            />
          </div>
          <div className="h-3 border-[#CACACA]" />
          <div className="p-6 bg-white">
            <h1 className="text-base text-[#2B354D] font-semibold pb-4">
              Cards
            </h1>
            <div className="flex flex-nowrap overflow-x-auto" >{mapCards()}</div>
          </div>
          {/* card and font color */}
          <div className="px-6 bg-white">
            <h1 className="text-[#2B354D] font-semibold">Colors</h1>
            <div className="flex items-center my-4">
              <p className="text-[#2B354D] font-semibold mr-2">Card color:</p>
              <input
                ref={colorRef}
                type="color"
                value={cardColor}
                onChange={onChangeCardColorPicker}
                style={{ borderRadius: "0.375rem" }}
                className="w-32 rounded-2xl"
              />
            </div>
            <input
              type="text"
              value={cardColor}
              onChange={onChangeCardColorInput}
              className="placeholder:opacity-50 w-full px-2.5 rounded-md"
              placeholder="Color picker or hex code"
            />
            <div className="flex items-center my-4">
              <p className="text-[#2B354D] font-semibold mr-2">Font color:</p>
              <input
                ref={fontRef}
                type="color"
                value={fontColor}
                onChange={onChangeFontColorPicker}
                className="w-32 rounded-2xl"
              />
            </div>
            <input
              type="text"
              value={fontColor}
              onChange={onChangeFontColorInput}
              className="placeholder:opacity-50 w-full px-2.5 rounded-md"
              placeholder="Color picker or hex code"
            />
          </div>

          <div className="px-6 py-4 pb-20 bg-white">
            <h1 className="text-[#2B354D] font-semibold mb-4">
              Logo for the card
            </h1>
            <div
              className="border-[#2B354D] border border-1 flex justify-center items-center rounded-md w-full"
              onClick={() => document.getElementById("img")?.click()}
            >
              <input
                type="file"
                id="img"
                name="image"
                accept=".jpg,.jpeg,.png,"
                onChange={handleImageChange}
                style={{ display: "none" }}
              />
              <BsUpload />
              <p className="mx-2 py-3 text-[#2B354D] font-semibold">
                Upload Logo
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default memo(LoyalityCardPopup);
