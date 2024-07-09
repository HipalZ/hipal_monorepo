import QuantityPickerNonOutline from "@/components/atoms/buttons/quantityPicker/quantityPickerNonOutline";
import Section from "@/components/molecules/section";
import { useDishStore } from "@/components/store/useDishStore";
import type { IDish, IExtraItem } from "@/components/types/businessData";
import { getPrice } from "@/components/utils/helpers";
import { camelCase, isEmpty } from "lodash-es";
import { memo } from "react";

function ExtraWithDishWithSelect({
  dishData,
}: {
  dishData: IDish;
}) {
  const extras = dishData?.extras?.[0]?.items || [];

  const { selectedExtras, setSelectedExtras } = useDishStore();

  const handleQuantityChange = (
    newQuantity: number,
    item: IExtraItem,
    itemId: string,
  ) => {
    setSelectedExtras({
      ...selectedExtras,
      [itemId]: newQuantity,
    });
  };

  if (isEmpty(extras)) {
    return null;
  }

  return (
    <>
      <div className="">
        <Section
          title={"Extras"}
          tag="h5"
          tagClassName="mx-2 font-semibold text-base-content !text-xl"
        >
          {" "}
        </Section>
      </div>

      <div className="overflow-x-auto">
        {dishData.extras
          .sort((a, b) => b.compulsory - a.compulsory)
          .map((extra, extraIndex) => (
            <div
              key={crypto.randomUUID()}
              className="extra-section bg-base-300/10 mb-[2rem]"
            >
              <div className="flex justify-between py-3 mx-6 prose cursor-pointer">
                <div>
                  <h5 className="w-[12rem] text-sm font-medium capitalize text-base-content">
                    {extra?.name || ""}
                  </h5>
                  {extra?.compulsory >= 0 && (
                    <span
                      className={`text-xs font-normal ${
                        extra?.compulsory === 0 ? "" : "!text-primary "
                      }`}
                    >
                      Select up to {extra?.maxQuantity} (
                      {extra?.compulsory > 0 ? ` ${extra?.compulsory}` : ""}{" "}
                      {extra?.compulsory > 0 ? "Required " : " Optional"} )
                    </span>
                  )}
                </div>
              </div>
              <div className="pb-4">
                <div className="max-h-screen mx-6 overflow-auto transition-all duration-500 ease-in-out border opacity-100 rounded-xl border-primary">
                  <table className="table w-full table-compact table-zebra ">
                    <tbody>
                      {(extra?.items || []).map((item: IExtraItem, index) => {
                        let itemId = "";
                        if (item?._id !== undefined) {
                          itemId = item?._id;
                        } else if (item?.name) {
                          itemId = camelCase(item?.name + extraIndex);
                        }
                        return (
                          <tr
                            className={"flex flex-row transition-all "}
                            key={crypto.randomUUID()}
                          >
                            <td className="min-h-12 max-h-20 !pl-3 !text-xs w-1/3 flex flex-row flex-wrap">
                              <span className="w-full my-auto capitalize whitespace-pre-wrap">
                                {item?.name || ""} <br />
                                (Max:{item?.maxQuantity})
                              </span>
                            </td>
                            <td className=" !text-xs w-1/3 text-center font-semibold flex flex-row">
                              <span className="mx-auto my-auto ">
                                {getPrice(item?.price || 0)}
                              </span>
                            </td>
                            <td className=" !text-xs w-1/3 text-center font-semibold flex flex-row">
                              <span className="pr-2 my-auto ml-auto">
                                <QuantityPickerNonOutline
                                  setQuantity={(q) =>
                                    handleQuantityChange(q, item, itemId)
                                  }
                                  minQuantity={0}
                                  maxQuantity={item?.maxQuantity || 10}
                                  quantity={selectedExtras[itemId] || 0}
                                  extra={extra}
                                  item={item}
                                />
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          ))}
      </div>
    </>
  );
}

export default memo(ExtraWithDishWithSelect);
