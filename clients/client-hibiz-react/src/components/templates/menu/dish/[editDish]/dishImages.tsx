import PlusButton from "@/components/atom/plusButton";
import { memo, useRef, type ChangeEvent } from "react";
import { FaTimes } from "react-icons/fa";
import useMenuPageStore from "@/components/store/useMenuStorage";
import { handleClick } from "@/components/utils/helper";

type Props = {
  handleImageChange: (event: ChangeEvent<HTMLInputElement>) => void;
  img: { first: string; second: string; third: string };
};

const MemoDishImages = (props: Props) => {
  const { handleImageChange, img } = props;
  const firstImage = useRef<HTMLInputElement | null>(null);
  const secondImage = useRef<HTMLInputElement | null>(null);
  const thirdImage = useRef<HTMLInputElement | null>(null);
  const { setImageFiles, setImagePreviews } = useMenuPageStore((s) => ({
    setImageFiles: s.setImageFiles,
    setImagePreviews: s.setImagePreviews,
  }));

  const handleRemoveImage = (type: "first" | "second" | "third") => {
    setImageFiles((prev) => ({ ...prev, [type]: null }));
    setImagePreviews((prev) => ({ ...prev, [type]: "" }));
  };

  return (
    <section className="grid grid-cols-[200px_100px] grid-rows-[100px_100px] content-center gap-4 md:flex md:flex-row md:justify-center">
      <article className="relative col-span-1 row-span-2 border border-1 rounded-xl md:w-[200px] md:h-[200px] overflow-hidden">
        <input
          ref={firstImage}
          onClick={(e) => handleClick(e, firstImage)}
          type="file"
          id="firstImage"
          style={{ display: "none" }}
          onChange={handleImageChange}
          data-type="first"
        />
        <label htmlFor="firstImage">
          {img?.first ? (
            <img src={img?.first} alt="First" className="w-[200px] h-[200px]" />
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
      <article className="relative border border-1 rounded-xl md:w-[200px] md:h-[200px] overflow-hidden">
        <input
          ref={secondImage}
          onClick={(e) => handleClick(e, secondImage)}
          type="file"
          id="secondImage"
          style={{ display: "none" }}
          onChange={handleImageChange}
          data-type="second"
        />
        <label htmlFor="secondImage">
          {img?.second ? (
            <img
              src={img?.second}
              alt="Second"
              className="w-[200px] h-[200px]"
            />
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
      <article className="relative border border-1 rounded-xl md:w-[200px] md:h-[200px] overflow-hidden">
        <input
          ref={thirdImage}
          onClick={(e) => handleClick(e, thirdImage)}
          type="file"
          id="thirdImage"
          style={{ display: "none" }}
          onChange={handleImageChange}
          data-type="third"
        />
        <label htmlFor="thirdImage">
          {img?.third ? (
            <img src={img?.third} alt="Third" className="w-[200px] h-[200px]" />
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

const DishImages = memo(MemoDishImages);
export default DishImages;
