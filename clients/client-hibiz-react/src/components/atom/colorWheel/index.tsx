import React, { useRef, useState, useEffect } from "react";
import useBusinessCtrl from "@/components/store/useBusinessCtrl";
import Background from "@/assets/color-wheel-min.png";

interface ColorWheelProps {
  close: () => void;
  colorType: "primary" | "secondary";
}

const ColorWheel: React.FC<ColorWheelProps> = ({ close, colorType }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { primaryColor, secondaryColor, setPrimaryColor, setSecondaryColor } =
    useBusinessCtrl();

  const [selectedColor, setSelectedColor] = useState<string>(
    colorType === "primary" ? primaryColor : secondaryColor,
  );

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
    if (colorType === "primary") {
      setPrimaryColor(selectedColor);
    } else {
      setSecondaryColor(selectedColor);
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
    if (colorType === "secondary") {
      setSelectedColor(secondaryColor);
    }
  }, [colorType, secondaryColor]);

  return (
    <center>
      <h3 className="my-4 text-xl font-semibold">Pick a {colorType} color</h3>
      <h6>Choose the color which suits you the most</h6>
      <canvas
        ref={canvasRef}
        width="330"
        height="330"
        onClick={getColorData}
        style={{ cursor: "pointer" }}
      />
      <section className="flex items-center justify-evenly pb-[6rem]">
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
          className="rounded-lg"
        />
      </section>
      <button onClick={saveColor} type="button" className="bottom_btn">
        Save
      </button>
    </center>
  );
};

export default ColorWheel;
