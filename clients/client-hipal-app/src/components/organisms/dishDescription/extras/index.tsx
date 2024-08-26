import QuantityPickerNonOutline from "@/components/atoms/buttons/quantityPicker/quantityPickerNonOutline";
import { useBottomPanel } from "@/components/store/useBottomPanel";
import { useCartStore } from "@/components/store/useCartStore";
import { getPrice } from "@/components/utils/helpers";
import type { DishType, AddOnType } from "@hi/db-models/src/validators";
import { memo, useCallback } from "react";

function MemoAddOnsWithDish({ dishData }: { dishData: DishType }) {
  const addOns = dishData?.addOnIds || ([] as AddOnType[]);
  const { selectedChoices, setSelectedChoice, removeSelectedChoice } =
    useCartStore();
  const { displayAlert, setDisplayAlert } = useBottomPanel((s) => ({
    displayAlert: s.displayAlert,
    setDisplayAlert: s.setDisplayAlert,
  }));

  const displayAlertPopUp = useCallback(() => {
    if (displayAlert) {
      return;
    }
    setDisplayAlert(true);
    setTimeout(() => {
      return setDisplayAlert(false);
    }, 5000);
  }, [displayAlert, setDisplayAlert]);

  const handleQuantityChange = useCallback(
    (
      newQuantity: number,
      choice: AddOnType["choices"][number],
      addOn: AddOnType,
    ) => {
      const choiceId = choice._id || choice.uuid;

      const totalQuantitySelected = selectedChoices.reduce((acc, selected) => {
        if (addOn.choices.some((c) => c._id === selected.id)) {
          return acc + selected.quantity;
        }
        return acc;
      }, 0);

      if (newQuantity > 0) {
        if (
          totalQuantitySelected -
            (selectedChoices.find((c) => c.id === choiceId)?.quantity || 0) +
            newQuantity >
          addOn.addOnMaxQuantity
        ) {
          displayAlertPopUp();
          return;
        }

        if (newQuantity > choice.choiceMaxQuantity) {
          displayAlertPopUp();
          return;
        }

        setSelectedChoice({
          id: choiceId,
          name: choice.name,
          quantity: newQuantity,
          price: choice.price,
        });
      } else {
        removeSelectedChoice(choiceId);
      }
    },
    [
      selectedChoices,
      setSelectedChoice,
      removeSelectedChoice,
      displayAlertPopUp,
    ],
  );

  if (!addOns.length) {
    return null;
  }

  return (
    <div className="overflow-x-auto z-[103]">
      {addOns.map((addOn) => {
        return (
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
                  {addOn?.compulsory > 0
                    ? ` ${addOn?.compulsory} Required`
                    : " Optional"}
                  )
                </span>
              </div>
            </div>
            <div className="pb-4">
              <div className="max-h-screen mx-6 overflow-auto transition-all duration-500 ease-in-out border opacity-100 rounded-xl border-primary">
                <table className="table w-full my-0 table-compact table-zebra">
                  <tbody>
                    {addOn?.choices?.map((choice) => {
                      if (!choice?.visibility || !choice?.availability)
                        return null;
                      const choiceId = choice._id || choice.uuid;
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
                                setQuantity={(q) =>
                                  handleQuantityChange(q, choice, addOn)
                                }
                                minQuantity={0}
                                maxQuantity={choice?.choiceMaxQuantity || 10}
                                quantity={
                                  selectedChoices.find(
                                    (c) => c.id === (choice._id || choice.uuid),
                                  )?.quantity || 0
                                }
                                extra={addOn}
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
        );
      })}
    </div>
  );
}

const AddOnsWithDish = memo(MemoAddOnsWithDish);
export default AddOnsWithDish;
