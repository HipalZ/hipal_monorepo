import { memo, useMemo } from "react";
import type { DishType } from "@hi/db-models/src/validators";
import { useCartStore } from "@/components/store/useCartStore";

function MemoChoosePortions({ dishData }: { dishData: DishType }) {
    const { selectedPortion, setSelectedPortion } = useCartStore((state) => ({
        selectedPortion: state.selectedPortion,
        setSelectedPortion: state.setSelectedPortion,
    }));

    const portions = useMemo(() => dishData?.portions || [], [dishData]);

    if (portions.length === 0) {
        return null;
    }

    return (
        <div className="mx-4">
            <div className="prose">
                <h3 className="text-[#000000] !text-xl">Choose a portion</h3>
            </div>

            <div className="my-2 overflow-x-auto border rounded-lg border-[#000000]">
                <table className="table w-full my-0 overflow-hidden table-compact table-zebra">
                    <tbody>
                        {portions.map((portion, index) => (
                            <tr
                                className={`flex flex-row my-3 ${selectedPortion?._id === portion._id ? "" : ""
                                    }`}
                                key={`${portion?.name?.replaceAll(" ", "") || ""}${index}`}
                                onClick={() => setSelectedPortion(portion)}
                            >
                                <td className="!text-xs w-[2rem] text-center flex flex-row">
                                    <input
                                        type="radio"
                                        name="portion"
                                        className="p-1 ml-auto mr-2 text-2xl text-black radio"
                                        checked={selectedPortion?._id === portion._id}

                                    />
                                </td>
                                <td className="!text-sm w-[90%] flex flex-row flex-wrap">
                                    <span className="w-full my-auto capitalize whitespace-pre-wrap">
                                        {portion?.name || ""}
                                    </span>
                                </td>
                                <td className="!text-sm w-[20%] text-center font-semibold flex flex-row">
                                    <span className="mx-auto">
                                        ₹ {portion?.price || 0}
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

const ChoosePortions = memo(MemoChoosePortions);
export default ChoosePortions;
