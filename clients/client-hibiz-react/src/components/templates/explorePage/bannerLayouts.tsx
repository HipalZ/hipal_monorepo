import { memo, useState } from "react";
import {
  bannerLayouts,
  bannerLayouts2,
  bannerLayouts3,
  bannerLayouts4,
  bannerLayouts5,
  bannerLayouts6,
} from "@/components/utils/helper";
import { LuArrowUpRight } from "react-icons/lu";
import { useBannerStore } from "@/components/store/useBannerStore";
import { BannerType } from "./explorePageStore";
import { FaFilter } from "react-icons/fa";
import PopUp from "@/components/atom/popUp";

const MemoBannerLayouts = () => {
  const [bannerLayout, setBannerLayout] = useState<string>("");
  const [openFilter, setOpenFilter] = useState<boolean>(false);
  const { setSelectedBannerType } = useBannerStore((s) => ({
    setSelectedBannerType: s.setSelectedBannerType,
  }));
  const handleBannerType = (id: string) => {
    setBannerLayout(id);
  };
  const handleCreateBanner = () => {
    setSelectedBannerType(bannerLayout);
  };

  const handleOpenFilters = () => {
    setOpenFilter(!openFilter);
  };

  return (
    <section className="relative">
      <div onClick={handleOpenFilters} className="absolute right-4 -top-10">
        <FaFilter />
      </div>
      <section className="mt-36 relative grid content-center grid-cols-2 gap-2 mx-4 gap-y-4 place-items md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 pb-[5rem]">
        {bannerLayouts.map((layout) => (
          <div className="flex flex-col" key={layout?._id}>
            <article key={layout?._id} className="max-h-[11.5rem]">
              <figure className="w-full max-w-[12rem] rounded-2xl">
                <img
                  src={layout?.image}
                  alt={layout?.title}
                  className="rounded-t-xl w-[12rem] h-[8.5rem]"
                />
              </figure>
              <article className="bg-white w-full max-w-[12rem] p-2 rounded-b-xl h-[3.5rem]">
                <div className="flex justify-between">
                  <h1 className="text-[0.7rem] truncate">{layout?.heading}</h1>
                  {layout?.isButton && (
                    <div className="flex items-center bg-red-700 px-1 py-0.5 text-[0.6rem] text-white rounded-full space-x-0.5 scale-75 -mr-1">
                      <button type="button">{layout?.buttonText}</button>{" "}
                      <span className="text-[0.6rem]">
                        <LuArrowUpRight />
                      </span>
                    </div>
                  )}
                </div>
                <p
                  style={{
                    WebkitLineClamp: 2,
                    display: "-webkit-box",
                    WebkitBoxOrient: "vertical",
                    overflow: "hidden",
                  }}
                  className="text-[0.5rem]"
                >
                  {layout?.paragraph}
                </p>
              </article>
            </article>
            <article className="mt-4 mb-2">
              <input
                type="radio"
                className="text-[#8C63FF]"
                name="banner_layout"
                onClick={() => handleBannerType(layout?._id)}
              />
              <span className="text-[#807C83] text-sm ml-2">
                {layout?.title}
              </span>
            </article>
            <span className="text-xs text-[#999999]">
              {layout?.description}
            </span>
          </div>
        ))}
        {bannerLayouts2.map((layout) => (
          <section key={layout?._id}>
            <article className="relative flex justify-start shrink-0">
              <figure className="w-full max-w-[12rem] rounded-2xl">
                <img
                  src={layout?.image}
                  alt={layout?.title}
                  className="rounded-xl w-[12rem] h-[11rem] bg-cover"
                />
              </figure>
              <article className="absolute bottom-2 bg-white w-[90%] md:max-w-[11rem] mx-2 p-2 rounded-xl h-[3rem]">
                <div className="flex justify-between">
                  <h1 className="text-[0.7rem] truncate">{layout?.heading}</h1>
                  {layout?.isButton && (
                    <div className="flex items-center bg-red-700 px-1 py-0.5 text-[0.6rem] text-white rounded-full space-x-0.5 scale-75 -mr-1">
                      <button type="button">{layout?.buttonText}</button>{" "}
                      <span className="text-[0.6rem]">
                        <LuArrowUpRight />
                      </span>
                    </div>
                  )}
                </div>
                <p
                  style={{
                    WebkitLineClamp: 1,
                    display: "-webkit-box",
                    WebkitBoxOrient: "vertical",
                    overflow: "hidden",
                  }}
                  className="text-[0.5rem]"
                >
                  {layout?.paragraph}
                </p>
              </article>
            </article>
            <article className="mt-4 mb-2">
              <input
                type="radio"
                className="text-[#8C63FF]"
                name="banner_layout"
                onClick={() => handleBannerType(layout?._id)}
              />
              <span className="text-[#807C83] text-sm ml-2">
                {layout?.title}
              </span>
            </article>
            <span className="text-xs text-[#999999] leading-none">
              {layout?.description}
            </span>
          </section>
        ))}
        {bannerLayouts3.map((layout) => (
          <section key={layout?._id}>
            <article className="relative flex justify-center shrink-0 max-w-[12rem]">
              <figure className="w-full max-w-[12rem] rounded-2xl">
                <img
                  src={layout?.image}
                  alt={layout?.title}
                  className="rounded-xl w-[12rem] h-[11rem] bg-cover"
                />
              </figure>
              <article
                style={{
                  background:
                    "linear-gradient(to bottom, transparent 10%, black 90%)",
                }}
                className="absolute bottom-0 w-full p-2 rounded-xl h-[3rem]"
              >
                <div className="flex justify-between">
                  <h1 className="text-[0.7rem] truncate text-white">
                    {layout?.heading}
                  </h1>
                  {layout?.isButton && (
                    <div className="flex items-center border border-1 px-1 py-0.5 text-[0.6rem] text-white rounded-full space-x-0.5 scale-75 -mr-1">
                      <button type="button">{layout?.buttonText}</button>{" "}
                      <span className="text-[0.6rem]">
                        <LuArrowUpRight />
                      </span>
                    </div>
                  )}
                </div>
                <p
                  style={{
                    WebkitLineClamp: 1,
                    display: "-webkit-box",
                    WebkitBoxOrient: "vertical",
                    overflow: "hidden",
                  }}
                  className="text-[0.5rem] text-white"
                >
                  {layout?.paragraph}
                </p>
              </article>
            </article>
            <article className="mt-4 mb-2">
              <input
                type="radio"
                className="text-[#8C63FF]"
                name="banner_layout"
                onClick={() => handleBannerType(layout?._id)}
              />
              <span className="text-[#807C83] text-sm ml-2">
                {layout?.title}
              </span>
            </article>
            <span className="text-xs text-[#999999] leading-none">
              {layout?.description}
            </span>
          </section>
        ))}
        {bannerLayouts4.map((layout) => (
          <section key={layout?._id}>
            <article className="relative flex justify-center shrink-0 max-w-[12rem]">
              <figure className="w-full max-w-[12rem] rounded-2xl">
                <img
                  src={layout?.image}
                  alt={layout?.title}
                  className="rounded-xl w-[12rem] h-[11rem] bg-cover"
                />
              </figure>
              <article
                style={{
                  background:
                    "linear-gradient(to bottom, transparent 10% , black 50%, transparent 80%)",
                }}
                className="bg-black absolute bottom-1/2 translate-y-1/2 w-full flex flex-col items-center justify-center p-2 rounded-xl h-[7rem]"
              >
                <h1 className="text-[0.7rem] truncate text-white">
                  {layout?.heading}
                </h1>
                <p
                  style={{
                    WebkitLineClamp: 1,
                    display: "-webkit-box",
                    WebkitBoxOrient: "vertical",
                    overflow: "hidden",
                  }}
                  className="text-[0.5rem] text-white bg-opacity-50"
                >
                  {layout?.paragraph}
                </p>
                {layout?.isButton && (
                  <div className="flex items-center border border-1 px-1 py-0.5 text-[0.5rem] text-white rounded-full space-x-0.5 scale-75 -mr-1">
                    <button type="button">{layout?.buttonText}</button>{" "}
                    <span className="text-[0.6         rem]">
                      <LuArrowUpRight />
                    </span>
                  </div>
                )}
              </article>
            </article>
            <article className="mt-4 mb-2">
              <input
                type="radio"
                className="text-[#8C63FF]"
                name="banner_layout"
                onClick={() => handleBannerType(layout?._id)}
              />
              <span className="text-[#807C83] text-sm ml-2">
                {layout?.title}
              </span>
            </article>
            <span className="text-xs text-[#999999] leading-none">
              {layout?.description}
            </span>
          </section>
        ))}
        {bannerLayouts5.map((layout) => (
          <section key={layout?._id}>
            <article className="relative flex justify-center shrink-0 max-w-[12rem]">
              <figure className="w-full max-w-[12rem] rounded-2xl">
                <img
                  src={layout?.image}
                  alt={layout?.title}
                  className="rounded-xl w-[12rem] h-[11rem] bg-cover"
                />
              </figure>
              <article
                style={{
                  background:
                    "linear-gradient(to bottom, transparent 10% , black 50%, transparent 80%)",
                }}
                className="absolute top-0 flex flex-col items-start justify-center w-full p-2 bg-black rounded-xl"
              >
                <h1 className="text-[0.7rem] truncate text-white">
                  {layout?.heading}
                </h1>
                <p
                  style={{
                    WebkitLineClamp: 1,
                    display: "-webkit-box",
                    WebkitBoxOrient: "vertical",
                    overflow: "hidden",
                  }}
                  className="text-[0.5rem] text-white bg-opacity-50"
                >
                  {layout?.paragraph}
                </p>
                {layout?.isButton && (
                  <div className="flex items-center border border-1 px-1 py-0.5 text-[0.5rem] text-white rounded-full space-x-0.5 scale-75 -mr-1">
                    <button type="button">{layout?.buttonText}</button>{" "}
                    <span className="text-[0.6rem]">
                      <LuArrowUpRight />
                    </span>
                  </div>
                )}
              </article>
            </article>
            <article className="mt-4 mb-2">
              <input
                type="radio"
                className="text-[#8C63FF]"
                name="banner_layout"
                onClick={() => handleBannerType(layout?._id)}
              />
              <span className="text-[#807C83] text-sm ml-2">
                {layout?.title}
              </span>
            </article>
            <span className="text-xs text-[#999999] leading-none">
              {layout?.description}
            </span>
          </section>
        ))}
        {bannerLayouts6.map((layout) => {
          const color =
            layout?._id === BannerType.BANNER_TYPE_12 ? "#678BFF" : "#E03030";
          const patternColor = "#00000050";
          return (
            <section key={layout?._id}>
              <article
                className="relative h-[11.5rem] max-w-[12rem] rounded-xl"
                style={{ backgroundColor: color }}
              >
                <figure className="absolute top-2 left-2">
                  {layout?.isPattern && <layout.pattern color={patternColor} />}
                </figure>
                <figure className="absolute -rotate-180 bottom-2 right-2">
                  {layout?.isPattern && <layout.pattern color={patternColor} />}
                </figure>
                <article className="absolute flex flex-col items-center justify-center w-full p-2 translate-y-1/2 bottom-1/2 rounded-xl">
                  <h1 className="text-[0.7rem] truncate text-white">
                    {layout?.heading}
                  </h1>
                  <p
                    style={{
                      WebkitLineClamp: layout?._id === "13" ? 3 : 2,
                      display: "-webkit-box",
                      WebkitBoxOrient: "vertical",
                      overflow: "hidden",
                    }}
                    className="text-[0.5rem] text-white bg-opacity-50"
                  >
                    {layout?.paragraph}
                  </p>
                  {layout?.isButton && (
                    <div className="flex items-center border border-1 px-1 py-0.5 text-[0.5rem] text-white rounded-full space-x-0.5 scale-75 -mr-1">
                      <button type="button">{layout?.buttonText}</button>{" "}
                      <span className="text-[0.6rem]">
                        <LuArrowUpRight />
                      </span>
                    </div>
                  )}
                </article>
              </article>
              <article className="mt-4 mb-2">
                <input
                  type="radio"
                  className="text-[#8C63FF]"
                  name="banner_layout"
                  onClick={() => handleBannerType(layout?._id)}
                />
                <span className="text-[#807C83] text-sm ml-2">
                  {layout?.title}
                </span>
              </article>
              <span className="text-xs text-[#999999] leading-none">
                {layout?.description}
              </span>
            </section>
          );
        })}
      </section>
      <footer className="fixed bottom-4 flex lg:justify-center lg:-left-6 w-[92%] lg:w-[96%] gap-4 mx-4">
        <button
          onClick={handleCreateBanner}
          type="button"
          className="w-full py-3 text-white bg-black rounded-full lg:w-1/2"
        >
          Save
        </button>
      </footer>
      {openFilter ? (
        <PopUp show={openFilter} onClose={handleOpenFilters}></PopUp>
      ) : null}
    </section>
  );
};

const BannerLayouts = memo(MemoBannerLayouts);
export default BannerLayouts;
