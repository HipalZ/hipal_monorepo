import { memo, useCallback, useState } from "react";
import type { DishType, AddOnType } from "@hi/db-models/src/validators";
import { useBottomPanel } from "@/components/store/useBottomPanel";
import { useCartStore } from "@/components/store/useCartStore";
import QuantityPickerNonOutline from "./quantityPickerOutline"

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
            {addOns?.map((addOn) => (
                <div
                    key={addOn._id || crypto.randomUUID()}
                    className="add-on-section bg-[#ffffff] mb-[2rem]"
                >
                    <div className="flex justify-between py-3 mx-6 prose cursor-pointer">
                        <div>
                            <h5 className="w-full text-sm font-semibold capitalize text-[#000000]">
                                {addOn?.name}
                            </h5>
                            <span
                                className={`text-sm  font-semibold opacity-60 ${addOn?.compulsory === 0 ? "" : "!text-[#000000]"
                                    }`}
                            >
                                Select up to {addOn?.addOnMaxQuantity} (
                                {addOn?.compulsory > 0
                                    ? `${addOn?.compulsory} Required`
                                    : "Optional"}
                                )
                            </span>
                        </div>
                    </div>
                    <div className="pb-4">
                        <div className="max-h-screen mx-4 overflow-auto transition-all duration-500 ease-in-out border opacity-100 rounded-xl border-[#000000]">
                            <table className="table w-full my-0 table-compact table-zebra">
                                <tbody>
                                    {addOn?.choices.map((choice) => {
                                        if (!choice.visibility || !choice.availability) return null;
                                        const choiceId = choice._id || choice.uuid;
                                        return (
                                            <tr className="flex p-2 transition-all" key={choiceId}>
                                                <td className="min-h-12 max-h-20 !text-sm w-[80%] flex flex-wrap !text-[#000000]">
                                                    <span className="w-full my-auto font-semibold capitalize whitespace-pre-wrap">
                                                        {choice.name}
                                                    </span>
                                                    <span className=" text-[#000000] w-full font-semibold opacity-60">
                                                        ₹ {choice.price}
                                                    </span>
                                                    <span className="text-xs ">
                                                        (Max: {choice.choiceMaxQuantity})
                                                    </span>
                                                </td>

                                                <td className="!text-sm  text-center font-semibold flex flex-row">
                                                    <QuantityPickerNonOutline
                                                        setQuantity={(q) =>
                                                            handleQuantityChange(q, choiceId, addOn?._id)
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
