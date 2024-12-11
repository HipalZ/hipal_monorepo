import { memo, useCallback, useState } from "react";
import QuantityPickerNonOutline from "@/components/atoms/buttons/quantityPicker/quantityPickerNonOutline";
import { useBottomPanel } from "@/components/store/useBottomPanel";
import { getPrice } from "@/components/utils/helpers";
import type { DishType, AddOnType } from "@hi/db-models/src/validators";
import { useCartStore } from "@/components/store/useCartStore";

function AddOnsWithDish({ dishData }: { dishData: DishType }) {
  const addOns = dishData?.addOnIds || ([] as AddOnType[]);
  const { displayAlert, setDisplayAlert } = useBottomPanel();
  const { selectedChoices, setSelectedChoice } = useCartStore((s) => ({
    selectedChoices: s.selectedChoices,
    setSelectedChoice: s.setSelectedChoice,
  }));

  const [selectedCounts, setSelectedCounts] = useState<Map<string, number>>(
    new Map(),
  );

  const handleQuantityChange = useCallback(
    (newQuantity: number, choiceId: string, addOnId: string) => {
      setSelectedCounts((prev) => {
        const newCounts = new Map(prev);
        const currentCount = newCounts.get(addOnId) || 0;
        const updatedCount =
          currentCount + newQuantity - (prev.get(choiceId) || 0);

        // Find the add-on and choice to get their max quantities
        const addOn = addOns.find((a) => a._id === addOnId);
        const choice = addOn?.choices.find((c) => c._id === choiceId);

        if (
          (choice && newQuantity > choice.choiceMaxQuantity) ||
          (addOn && updatedCount > addOn.addOnMaxQuantity)
        ) {
          displayAlertPopUp();
          return prev;
        }

        newCounts.set(addOnId, updatedCount);
        newCounts.set(choiceId, newQuantity);
        setSelectedChoice({
          id: choiceId,
          name: choice.name,
          quantity: newQuantity,
          price: choice.price,
        });
        return newCounts;
      });
    },
    [addOns, selectedChoices],
  );

  const displayAlertPopUp = useCallback(() => {
    if (!displayAlert) {
      setDisplayAlert(true);
      setTimeout(() => setDisplayAlert(false), 5000);
    }
  }, [displayAlert, setDisplayAlert]);

  if (!addOns.length) {
    return null;
  }

  return (
    <div className="overflow-x-auto ">
      {addOns.map((addOn) => (
        <div
          key={addOn._id || crypto.randomUUID()}
          className="add-on-section bg-base-300/10 mb-[2rem]"
        >
          <div className="flex justify-between py-3 mx-6 prose cursor-pointer">
            <div>
              <h5 className="w-[12rem] text-sm font-semibold capitalize text-base-content">
                {addOn.name}
              </h5>
              <span
                className={`text-sm  font-semibold opacity-60 ${
                  addOn.compulsory === 0 ? "" : "!text-primary"
                }`}
              >
                Select up to {addOn.addOnMaxQuantity} (
                {addOn.compulsory > 0
                  ? `${addOn.compulsory} Required`
                  : "Optional"}
                )
              </span>
            </div>
          </div>
          <div className="pb-4">
            <div className="max-h-screen mx-6 overflow-auto transition-all duration-500 ease-in-out border opacity-100 rounded-xl border-primary">
              <table className="table w-full my-0 table-compact table-zebra">
                <tbody>
                  {addOn.choices.map((choice) => {
                    if (!choice.visibility || !choice.availability) return null;
                    const choiceId = choice._id || choice.uuid;
                    return (
                      <tr
                        className="flex flex-row transition-all"
                        key={choiceId}
                      >
                        <td className="min-h-12 max-h-20 !pl-3 !text-sm w-1/3 flex flex-row flex-wrap">
                          <span className="w-full my-auto capitalize whitespace-pre-wrap">
                            {choice.name} <br />
                            (Max: {choice.choiceMaxQuantity})
                          </span>
                        </td>
                        <td className="!text-sm w-1/3 text-center font-semibold flex flex-row">
                          <span className="mx-auto my-auto">
                            {getPrice(choice.price)}
                          </span>
                        </td>
                        <td className="!text-sm w-1/3 text-center font-semibold flex flex-row">
                          <span className="pr-2 my-auto ml-auto">
                            <QuantityPickerNonOutline
                              setQuantity={(q) =>
                                handleQuantityChange(q, choiceId, addOn._id)
                              }
                              minQuantity={0}
                              extra={addOn}
                              maxQuantity={
                                Math.min(
                                  addOn?.maxQuantity,
                                  choice.choiceMaxQuantity,
                                ) || 10
                              }
                              quantity={selectedCounts.get(choiceId) || 0}
                              displayAlertPopUp={displayAlertPopUp}
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
