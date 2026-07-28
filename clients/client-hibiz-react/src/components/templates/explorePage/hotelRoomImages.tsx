import PlusButton from "@/components/atom/plusButton";
import { memo, useRef, type ChangeEvent } from "react";
import { FaTimes } from "react-icons/fa";
import { useExploreStore } from "@/components/store/useExploreStore";

type Props = {
  handleImageChange: (event: ChangeEvent<HTMLInputElement>) => void;
  img: { first: string; second: string; third: string };
};

const isVideoMedia = (url: string) => {
  if (!url) return false;
  if (url.startsWith("data:video")) return true;
  return (
    /\.(mp4)(?:$|[?#])/i.test(url) ||
    /video(?:\/|%2f)[a-z0-9.+-]+/i.test(url)
  );
};

const videoFileExtensions = new Set(["mp4"]);
const fileExtension = (file?: File | null) => file?.name.split(".").pop()?.toLowerCase().replace(/[^a-z0-9]/g, "") || "";
const isVideoFile = (file?: File | null) => Boolean(file?.type === "video/mp4" || videoFileExtensions.has(fileExtension(file)));

const MemoHotelRoomImages = (props: Props) => {
  const { handleImageChange, img } = props;
  const firstImage = useRef<HTMLInputElement | null>(null);
  const secondImage = useRef<HTMLInputElement | null>(null);
  const thirdImage = useRef<HTMLInputElement | null>(null);
  const { imageFiles, setImageFiles, setHotelBanners } = useExploreStore((s) => ({
    imageFiles: s.imageFiles,
    setImageFiles: s.setImageFiles,
    setHotelBanners: s.setHotelBanners,
  }));

  const handleRemoveImage = (type: "first" | "second" | "third") => {
    setImageFiles((prev) => ({ ...prev, [type]: null }));

    const imageTypeToIndex = {
      first: 0,
      second: 1,
      third: 2,
    } as const;

    setHotelBanners((prev) => {
      const updated = Array.isArray(prev) ? [...prev] : ["", "", ""];
      updated[imageTypeToIndex[type]] = "";
      return updated;
    });
  };

  const renderPreview = (src: string, alt: string, className: string, type: "first" | "second" | "third") => {
    if (isVideoMedia(src) || isVideoFile(imageFiles[type])) {
      return (
        <video
          src={src}
          className={className}
          muted
          loop
          playsInline
          controls
        />
      );
    }

    return <img src={src} alt={alt} className={className} />;
  };

  return (
    <section className="grid grid-cols-[200px_100px] grid-rows-[100px_100px] content-center gap-4 lg:flex lg:flex-row lg:justify-center">
      <article className="relative col-span-1 row-span-2 border border-1 rounded-xl lg:w-[200px] lg:h-[200px] overflow-hidden">
        <input
          ref={firstImage}
          onClick={(e) => {
            e.currentTarget.value = "";
          }}
          type="file"
          id="firstImage"
          style={{ display: "none" }}
          onChange={handleImageChange}
          data-type="first"
          accept="image/*,video/mp4"
        />
        <label htmlFor="firstImage">
          {img?.first ? (
            renderPreview(img.first, "First", "w-[200px] h-[200px] object-cover", "first")
          ) : (
            <PlusButton />
          )}
        </label>
        {img?.first && (
          <button
            type="button"
            className="absolute p-1 bg-white rounded-full top-2 right-2"
            onClick={() => handleRemoveImage("first")}
          >
            <FaTimes />
          </button>
        )}
      </article>
      <article className="relative border border-1 rounded-xl lg:w-[200px] lg:h-[200px] overflow-hidden">
        <input
          ref={secondImage}
          onClick={(e) => {
            e.currentTarget.value = "";
          }}
          type="file"
          id="secondImage"
          style={{ display: "none" }}
          onChange={handleImageChange}
          data-type="second"
          accept="image/*,video/mp4"
        />
        <label htmlFor="secondImage">
          {img?.second ? (
            renderPreview(img.second, "Second", "w-[200px] h-[200px] object-cover", "second")
          ) : (
            <PlusButton />
          )}
        </label>
        {img?.second && (
          <button
            type="button"
            className="absolute p-1 bg-white rounded-full top-2 right-2"
            onClick={() => handleRemoveImage("second")}
          >
            <FaTimes />
          </button>
        )}
      </article>
      <article className="relative border border-1 rounded-xl lg:w-[200px] lg:h-[200px] overflow-hidden">
        <input
          ref={thirdImage}
          onClick={(e) => {
            e.currentTarget.value = "";
          }}
          type="file"
          id="thirdImage"
          style={{ display: "none" }}
          onChange={handleImageChange}
          data-type="third"
          accept="image/*,video/mp4"
        />
        <label htmlFor="thirdImage">
          {img?.third ? (
            renderPreview(img.third, "Third", "w-[200px] h-[200px] object-cover", "third")
          ) : (
            <PlusButton />
          )}
        </label>
        {img?.third && (
          <button
            type="button"
            className="absolute p-1 bg-white rounded-full top-2 right-2"
            onClick={() => handleRemoveImage("third")}
          >
            <FaTimes />
          </button>
        )}
      </article>
    </section>
  );
};

const HotelRoomImages = memo(MemoHotelRoomImages);
export default HotelRoomImages;
