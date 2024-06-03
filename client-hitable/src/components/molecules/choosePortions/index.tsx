import { useCart } from "@/components/store/useCart";
import { IDish } from "@/components/types/hiTableData";
import { getPrice } from "@/components/utils/helpers";
import { useRouter } from "next/router";
import { memo, useMemo } from "react";

function ChoosePortions({ dishData }: { dishData: IDish }) {
  const router = useRouter();
  let { tableId } = router.query as { tableId: string };
  if (!tableId) {
    tableId = "012345";
  }
  const { cart, setCart } = useCart();
  const portions = useMemo(() => dishData?.portions || [], [dishData]);

  const editDishPortion = (portion: any) => {
  
	const updatedCart = cart[tableId]
	const filteredCart = Object.entries(updatedCart).reduce((acc, [key, value]) => {
		if (value !== undefined) {
			acc[key] = value;
		}
		return acc;
	}, {});

    let index = 0
    if ((cart[tableId]?.[dishData?.id]?.variants || []).length !== 0) {
    	index = (cart[tableId]?.[dishData?.id]?.variants || []).length - 1
    }

    filteredCart[dishData?.id].variants[index].portion = portion
    setCart(tableId, dishData?.id, filteredCart[dishData?.id])
  };

  // Converting isDishPortionSelected to a useMemo function
  const isDishPortionSelected = (portion: any) => {
    const cartDishData = cart?.[tableId]?.[dishData?.id] || {};


    if (cartDishData) {
      if ((cartDishData?.variants || []).length === 0) {
        return false;
      }
      const index = (cartDishData?.variants || []).length - 1;
      return (
        JSON.stringify(cartDishData.variants[index].portion) ===
        JSON.stringify(portion)
      );
    } else {
      return portion?.default === true;
    }
  };

  if (portions.length === 0) {
    return null;
  }

  return (
    <div className="mx-6">
      <div className="prose">
        <h3 className="text-base-content !text-xl">Choose a portion</h3>
      </div>

      <div className="my-2 overflow-x-auto border rounded-lg border-primary">
        <div className="px-3 py-3 prose">
          <h4 className="text-xs font-semibold text-base-content">Portion</h4>
        </div>

        <table className="table w-full overflow-hidden table-compact table-zebra">
          <tbody>
            {portions.map((portion, index: number) => (
              <tr
                className="flex flex-row "
                key={`${portion?.name?.replaceAll(" ", "") || ""}${index}`}
                onClick={() => editDishPortion(portion)}
              >
                <td className=" !pl-3 !text-xs w-1/3 flex flex-row flex-wrap">
                  <span className="w-full my-auto capitalize whitespace-pre-wrap">
                    {portion?.name || ""}
                  </span>
                </td>
                <td className=" !text-xs w-1/3 text-center font-semibold flex flex-row">
                  <span className="mx-auto">
                    {getPrice(portion?.price || 0)}
                  </span>
                </td>
                <td className=" !text-xs  w-1/3 text-center flex flex-row ">
                  <input
                    type="radio"
                    className="ml-auto mr-2 radio radio-primary radio-sm"
                    onChange={() => editDishPortion(portion)}
                    checked={isDishPortionSelected(portion)}
                    defaultChecked={isDishPortionSelected(portion)}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default memo(ChoosePortions);
