import { lazy } from "react";

const SubHeader = lazy(() => import("@/components/atom/subHeader"));
import { useBannerStore } from "@/components/store/useBannerStore";
import { preDefinedButtons } from "@/components/utils/helper";
import { memo } from "react";
import {
  buttonColors,
  useButtonName,
  useCustomColor,
  useHandleDirections,
} from "../../helpers/bannersHelper";
import { CiNoWaitingSign } from "react-icons/ci";
import { useBannerTemp } from "@/components/store/useBannerTemp";

const MemoBannerBtnRedirection = () => {
  const { isButtonExists, onlyImage } = useBannerStore((s) => ({
    isButtonExists: s.isButtonExists,
    onlyImage: s.onlyImage,
  }));

  const { callToAction, setCallToAction, itemName } = useBannerTemp((s) => ({
    itemName: s.itemName,
    callToAction: s.callToAction,
    setCallToAction: s.setCallToAction,
  }));

  const { handleCustomColor } = useCustomColor();
  const { handleRedirections } = useHandleDirections();
  const { handleButtonName } = useButtonName();

  return (
    <>
      {isButtonExists && !onlyImage ? (
        <section className="m-6">
          <SubHeader text="Add Button Name" />
          <article className="justify-between gap-10 p-2 pb-4 bg-white rounded-2xl">
            <div className="relative shrink-0">
              <input
                type="text"
                className="w-full rounded-2xl"
                maxLength={10}
                value={callToAction}
                onChange={handleButtonName}
                placeholder="Button Name"
              />
              <small className="absolute text-gray-700 right-2 bottom-2">
                {callToAction?.length}/10
              </small>
            </div>
            <div className="flex gap-4 mt-4">
              {preDefinedButtons.map((btn) => {
                const isSelected = callToAction === btn;
                return (
                  <button
                    key={btn}
                    type="button"
                    onClick={() => setCallToAction(btn)}
                    className={`px-6 py-2 text-[0.75rem] rounded-full ${
                      isSelected
                        ? "bg-black text-white"
                        : "bg-[#8C63FF40] text-[#8C63FF]"
                    }`}
                  >
                    {btn}
                  </button>
                );
              })}
            </div>
            <article className="gap-4 mt-4 md:mt-0">
              <h1 className="my-2 text-gray-500">Color of action button</h1>
              <div className="flex gap-4">
                {buttonColors.map((color) => {
                  return (
                    <article
                      key={color?.bgColor}
                      onClick={() =>
                        handleCustomColor(
                          "button",
                          color?.bgColor === "transparent"
                            ? "#808080"
                            : color?.bgColor,
                          color?.textColor,
                        )
                      }
                      onKeyDown={() =>
                        handleCustomColor(
                          "button",
                          color?.bgColor === "transparent"
                            ? "#808080"
                            : color?.bgColor,
                          color?.textColor,
                        )
                      }
                      style={{
                        background:
                          color?.bgColor === "transparent"
                            ? "white"
                            : color?.bgColor,
                        color: color?.textColor,
                      }}
                      className="w-8 h-8 rounded-full  border border-1 border-[#000]"
                    >
                      {color?.bgColor === "transparent" && (
                        <span className="flex items-center justify-center w-full h-full text-xs text-center border rounded-full border-1">
                          <CiNoWaitingSign size={20} color="#000" />
                        </span>
                      )}
                    </article>
                  );
                })}
              </div>
            </article>
          </article>
        </section>
      ) : null}
      <section className="m-6 pb-[7rem]">
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
    </>
  );
};

const BannerBtnRedirection = memo(MemoBannerBtnRedirection);
export default BannerBtnRedirection;
