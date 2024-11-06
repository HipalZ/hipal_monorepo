import { type React, useRef, useState, useEffect, memo, lazy } from "react";
import Background from "@/assets/color-wheel-min.png";
const BottomButton = lazy(() => import("@/components/atom/bottomButton"));

interface ColorWheelProps {
  close: () => void;
  colorType: "heading" | "paragraph" | "button" | "background";
  setStyle: (style: any) => void;
  style: any;
}

const MemoColorWheel: React.FC<ColorWheelProps> = ({
  close,
  colorType,
  setStyle,
  style,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const getInitialColor = () => {
    if (colorType === "background") {
      return style?.backgroundColor;
    }
    return style?.color;
  };
  const [selectedColor, setSelectedColor] = useState<string>(getInitialColor);

  const changeColor = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedColor(e.target.value);
  };

  const rgbToHex = (r: number, g: number, b: number): string => {
    return `${[r, g, b]
      .map((x) => {
        const hex = x.toString(16);
        return hex.length === 1 ? `0${hex}` : hex;
      })
      .join("")}`;
  };

  const getColorData = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) {
      return;
    }
    const canvasPos = {
      x: canvas.getBoundingClientRect().left,
      y: canvas.getBoundingClientRect().top,
    };
    const eventLocation = {
      x: e.clientX - canvasPos.x,
      y: e.clientY - canvasPos.y,
    };
    const ctx = canvas.getContext("2d") as CanvasRenderingContext2D;
    if (ctx) {
      const pixelData = ctx.getImageData(
        eventLocation.x,
        eventLocation.y,
        1,
        1,
      ).data;
      if (pixelData) {
        setSelectedColor(
          `#${rgbToHex(pixelData[0], pixelData[1], pixelData[2])}`,
        );
      }
    }
  };

  const saveColor = () => {
    if (colorType === "backgroundColor") {
      setStyle({ bgColor: selectedColor });
    } else {
      setStyle({ color: selectedColor });
    }
    close();
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d") as CanvasRenderingContext2D;
    const image = new Image();
    image.onload = () => {
      if (canvas && ctx) {
        ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
      }
    };
    image.src = Background;
    setSelectedColor(getInitialColor());
  }, [colorType]);

  return (
    <center>
      <h3 className="my-4 text-xl font-semibold">Pick a {colorType} color</h3>
      <h6>Choose the color which suits you the most</h6>
      <canvas
        ref={canvasRef}
        width="330"
        height="330"
        onClick={getColorData}
        onKeyDown={getColorData}
        style={{ cursor: "pointer" }}
      />
      <section className="flex items-center justify-center pb-[6rem] space-x-6">
        <div
          style={{
            width: "50px",
            height: "50px",
            backgroundColor: `${selectedColor}`,
            border: "1px solid black",
            margin: 0,
          }}
          className="rounded-xl"
        />
        <input
          type="text"
          minLength={0}
          maxLength={8}
          value={selectedColor}
          onChange={changeColor}
          style={{ textAlign: "center" }}
          className="w-64 rounded-lg"
        />
      </section>
      <BottomButton buttons={[{ text: "Save", onClick: saveColor }]} />
    </center>
  );
};

const ExploreColorWheel = memo(MemoColorWheel);
export default ExploreColorWheel;
