import PlusButton from "@/components/atom/plusButton";
import type { ChangeEvent } from "react";

type Props = {
  handleImageChange: (event: ChangeEvent<HTMLInputElement>) => void;
  img: { first: string; second: string; third: string };
};
const DishImages = (props: Props) => {
  const { handleImageChange, img } = props;
  return (
    <section className="grid grid-cols-[200px_100px] grid-rows-[100px_100px] gap-2 md:flex md:flex-row">
      <article className="relative col-span-1 row-span-2 border border-1 rounded-xl md:w-[200px] md:h-[200px] overflow-hidden">
        <input
          onClick={() => document.getElementById("firstImage")?.click()}
          type="file"
          id="firstImage"
          style={{ display: "none" }}
          onChange={handleImageChange}
          data-type="first"
        />
        <label htmlFor="firstImage">
          {img?.first ? <img src={img?.first} alt="First" /> : <PlusButton />}
        </label>
      </article>
      <article className="relative border border-1 rounded-xl md:w-[200px] md:h-[200px] overflow-hidden">
        <input
          onClick={() => document.getElementById("secondImage")?.click()}
          type="file"
          id="secondImage"
          style={{ display: "none" }}
          onChange={handleImageChange}
          data-type="second"
        />
        <label htmlFor="secondImage">
          {img?.second ? (
            <img src={img?.second} alt="Second" />
          ) : (
            <PlusButton />
          )}
        </label>
      </article>
      <article className="relative border border-1 rounded-xl md:w-[200px] md:h-[200px] overflow-hidden">
        <input
          onClick={() => document.getElementById("thirdImage")?.click()}
          type="file"
          id="thirdImage"
          style={{ display: "none" }}
          onChange={handleImageChange}
          data-type="third"
        />
        <label htmlFor="thirdImage">
          {img?.third ? <img src={img?.third} alt="Third" /> : <PlusButton />}
        </label>
      </article>
    </section>
  );
};

export default DishImages;
