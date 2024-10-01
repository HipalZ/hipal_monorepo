import { useBannerTemp } from "@/components/store/useBannerTemp";
import { type ChangeEvent, useCallback } from "react";

export const buttonColors = [
  { bgColor: "#FFFFFF", textColor: "#000000" }, // Mint green with black text
  { bgColor: "#9013FE", textColor: "#ffffff" }, // Purple with white text
  { bgColor: "#F5A623", textColor: "#000000" }, // Orange with black text
  { bgColor: "#000000", textColor: "#ffffff" }, // Red with white text
  { bgColor: "#7ED321", textColor: "#000000" }, // Lime green with black text
  { bgColor: "transparent", textColor: "#ffffff" }, // Black with white text
];

export const preDefinedColors = [
  "#FFFFFF", // White
  "#9013FE", // Purple
  "#F5A623", // Orange
  "#000000", // Black
  "#7ED321", // Lime green
  "transparent",
];

export const useRemoveImage = () => {
  const { setImageFiles, setImg } = useBannerTemp((s) => ({
    setImageFiles: s.setImageFiles,
    setImg: s.setImg,
  }));
  const handleRemoveImage = useCallback(() => {
    setImageFiles(null);
    setImg("");
  }, [setImageFiles, setImg]);

  return { handleRemoveImage };
};

export const useImageChange = () => {
  const { setImageFiles, setShowCropper, setCropping } = useBannerTemp((s) => ({
    setImageFiles: s.setImageFiles,
    setShowCropper: s.setShowCropper,
    setCropping: s.setCropping,
  }));
  const handleImageChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      const type = event?.target?.dataset?.type;
      const file = event?.target?.files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onloadend = () => {
          setCropping({ image: reader.result, type });
          setShowCropper(true);
        };

        setImageFiles(file);
      }
    },
    [setImageFiles],
  );

  return { handleImageChange };
};

export const useCustomColor = () => {
  const { setParagraphStyle, setButtonStyle, setSelectedColor } = useBannerTemp(
    (s) => ({
      setParagraphStyle: s.setParagraphStyle,
      setButtonStyle: s.setButtonStyle,
      setSelectedColor: s.setSelectedColor,
    }),
  );
  const handleCustomColor = useCallback(
    (element: string, color: string, buttonColor?: string) => {
      if (element === "paragraph" || element === "heading") {
        setParagraphStyle({ color });
      } else if (element === "button") {
        setButtonStyle({ color, buttonColor });
      } else {
        setSelectedColor({ bgColor: color });
      }
    },
    [setParagraphStyle, setButtonStyle, setSelectedColor],
  );

  return { handleCustomColor };
};

export const useHeadingChange = () => {
  const { setHeading } = useBannerTemp((s) => ({
    setHeading: s.setHeading,
  }));
  const handleHeadingChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      setHeading(event.target.value);
    },
    [setHeading],
  );

  return { handleHeadingChange };
};

export const useParagraphChange = () => {
  const { setParagraph } = useBannerTemp((s) => ({
    setParagraph: s.setParagraph,
  }));
  const handleParagraphChange = useCallback(
    (event: ChangeEvent<HTMLTextAreaElement>) => {
      setParagraph(event.target.value);
    },
    [setParagraph],
  );

  return { handleParagraphChange };
};

export const useHandleDirections = () => {
  const { setClickRedirect } = useBannerTemp((s) => ({
    setClickRedirect: s.setClickRedirect,
  }));
  const handleRedirections = useCallback(() => {
    setClickRedirect(true);
  }, [setClickRedirect]);

  return { handleRedirections };
};

export const useButtonName = () => {
  const { setCallToAction } = useBannerTemp((s) => ({
    setCallToAction: s.setCallToAction,
  }));
  const handleButtonName = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      setCallToAction(event.target.value);
    },
    [setCallToAction],
  );

  return { handleButtonName };
};
