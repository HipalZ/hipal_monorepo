import { useCart } from '@/components/store/useCart';
import { IDish } from '@/components/types/hiTableData';
import { getPrice } from '@/components/utils/helpers';
import { useRouter } from 'next/router';
import { memo, useMemo } from 'react';

function ChoosePortions({ dishData }: { dishData: IDish }) {
  const router = useRouter();
  let { tableId } = router.query as { tableId: string };
  if (!tableId) {
    tableId = '012345';
  }
  const { cart, setCart } = useCart();

  const portions = useMemo(() => (dishData?.portions || []).flat(), [dishData]);

  const editDishPortion = (portion: any) => {
    const updatedCart = cart[tableId] || {};
    const filteredCart = Object.entries(updatedCart).reduce((acc, [key, value]) => {
      if (value !== undefined) {
        acc[key] = value;
      }
      return acc;
    }, {});

    if (!filteredCart[dishData._id]) {
      filteredCart[dishData._id] = { variants: [] };
    }

    let index = filteredCart[dishData._id].variants.length !== 0 ? filteredCart[dishData._id].variants.length - 1 : 0;

    if (!filteredCart[dishData._id].variants[index]) {
      filteredCart[dishData._id].variants[index] = { portion: {} };
    }

    filteredCart[dishData._id].variants[index].portion = portion;
    setCart(tableId, dishData._id, filteredCart[dishData._id]);
  };

  const isDishPortionSelected = (portion: any) => {
    const cartDishData = cart?.[tableId]?.[dishData?._id] || {};

    if (cartDishData) {
      if ((cartDishData?.variants || []).length === 0) {
        return false;
      }
      const index = (cartDishData?.variants || []).length - 1;
      return JSON.stringify(cartDishData.variants[index].portion) === JSON.stringify(portion);
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

      <div className="border-primary my-2 overflow-x-auto rounded-lg border">
        <div className="prose px-3 py-3">
          <h4 className="text-base-content text-xs font-semibold">Portion</h4>
        </div>

        <table className="table-compact table-zebra table w-full overflow-hidden">
          <tbody>
            {portions.map((portion, index: number) => (
              <tr className="flex flex-row " key={`${portion?.name?.replaceAll(' ', '') || ''}${index}`} onClick={() => editDishPortion(portion)}>
                <td className=" flex w-1/3 flex-row flex-wrap !pl-3 !text-xs">
                  <span className="my-auto w-full whitespace-pre-wrap capitalize">{portion?.name || ''}</span>
                </td>
                <td className=" flex w-1/3 flex-row text-center !text-xs font-semibold">
                  <span className="mx-auto">{getPrice(portion?.price || 0)}</span>
                </td>
                <td className=" flex  w-1/3 flex-row text-center !text-xs ">
                  <input
                    type="radio"
                    className="radio radio-primary radio-sm ml-auto mr-2"
                    onChange={() => editDishPortion(portion)}
                    checked={isDishPortionSelected(portion)}
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
