import QuantityPickerNonOutline from "@/components/atoms/buttons/quantityPicker/quantityPickerNonOutline";
import { useCartStore } from "@/components/store/useCartStore";
import { getPrice } from "@/components/utils/helpers";
import type { DishType, AddOnType } from "@hi/db-models/src/validators";
import { memo } from "react";

function AddOnsWithDish({ dishData }: { dishData: DishType }) {
  const addOns = dishData?.addOnIds || [] as AddOnType[];
  const { selectedChoices, setSelectedChoice, removeSelectedChoice } = useCartStore();

  console.log("addOns", selectedChoices);

  const handleQuantityChange = (newQuantity: number, choice: AddOnType['choices'][number]) => {
    if (newQuantity > 0) {
      setSelectedChoice({
        id: choice._id || choice.uuid,
        name: choice.name,
        quantity: newQuantity,
        price: choice.price,
      });
    } else {
      removeSelectedChoice(choice._id || choice.uuid);
    }
    console.log("selectedChoices", selectedChoices);
  };

  if (!addOns.length) {
    return null;
  }

  return (
    <div className="overflow-x-auto z-[103]">
      {addOns.map((addOn) => (
        <div
          key={addOn._id || crypto.randomUUID()}
          className="add-on-section bg-base-300/10 mb-[2rem]"
        >
          <div className="flex justify-between py-3 mx-6 prose cursor-pointer">
            <div>
              <h5 className="w-[12rem] text-sm font-medium capitalize text-base-content">
                {addOn?.name || ""}
              </h5>
              <span
                className={`text-xs font-normal ${
                  addOn?.compulsory === 0 ? "" : "!text-primary"
                }`}
              >
                Select up to {addOn?.addOnMaxQuantity} (
                {addOn?.compulsory > 0 ? ` ${addOn?.compulsory} Required` : " Optional"})
              </span>
            </div>
          </div>
          <div className="pb-4">
            <div className="max-h-screen mx-6 overflow-auto transition-all duration-500 ease-in-out border opacity-100 rounded-xl border-primary">
              <table className="table w-full table-compact table-zebra">
                <tbody>
                  {addOn?.choices?.map((choice) => {
                    if (!choice?.visibility || !choice?.availability) return null;
                    let choiceId = choice._id || choice.uuid; 
                    return (
                      <tr
                        className="flex flex-row transition-all"
                        key={choiceId}
                      >
                        <td className="min-h-12 max-h-20 !pl-3 !text-xs w-1/3 flex flex-row flex-wrap">
                          <span className="w-full my-auto capitalize whitespace-pre-wrap">
                            {choice?.name} <br />
                            (Max: {choice?.choiceMaxQuantity})
                          </span>
                        </td>
                        <td className="!text-xs w-1/3 text-center font-semibold flex flex-row">
                          <span className="mx-auto my-auto">
                            {getPrice(choice?.price)}
                          </span>
                        </td>
                        <td className="!text-xs w-1/3 text-center font-semibold flex flex-row">
                          <span className="pr-2 my-auto ml-auto">
                            <QuantityPickerNonOutline
                              setQuantity={(q) => handleQuantityChange(q, choice)}
                              minQuantity={0}
                              maxQuantity={choice?.choiceMaxQuantity || 10}
                              quantity={selectedChoices.find(c => c.id === choiceId)?.quantity || 0}
                              extra={addOn}
                              item={choice}
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
  );
}

export default memo(AddOnsWithDish);
