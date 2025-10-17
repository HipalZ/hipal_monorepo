import { useCartStore } from '@/components/store/useCartStore';
import type { DishType } from '@hi/db-models/src/validators';
import { memo, useEffect, useMemo } from 'react';

function MemoChoosePortions({ dishData }: { dishData: DishType }) {
  const selectedPortion = useCartStore((state) => state.selectedPortion);
  const setSelectedPortion = useCartStore((state) => state.setSelectedPortion);

  const portions = useMemo(() => dishData?.portions || [], [dishData]);

  // Auto-select when there's exactly one option
  useEffect(() => {
    if (selectedPortion?._id !== portions[0]._id) {
      setSelectedPortion(portions[0]);
    }
  }, [portions, selectedPortion, setSelectedPortion]);

  if (portions.length === 0) {
    return null;
  }

  return (
    <div className="mx-4">
      <div className="prose">
        <h3 className="!text-xl text-[#000000]">Choose a portion</h3>
      </div>

      <div className="my-2 overflow-x-auto rounded-lg border border-[#000000]">
        <table className="table-compact table-zebra my-0 table w-full overflow-hidden">
          <tbody>
            {portions.map((portion, index) => (
              <tr
                className={`my-3 flex flex-row ${selectedPortion?._id === portion._id ? 'bg-gray-100' : ''}`}
                key={`${portion?.name?.replaceAll(' ', '') || ''}${index}`}
                onClick={() => setSelectedPortion(portion)}
              >
                <td className="flex w-[2rem] flex-row text-center !text-xs">
                  <input
                    type="radio"
                    name="portion"
                    className="radio ml-auto mr-2 p-1 text-2xl text-black"
                    checked={selectedPortion?._id === portion._id}
                    readOnly
                  />
                </td>
                <td className="flex w-[90%] flex-row flex-wrap !text-sm">
                  <span className="my-auto w-full whitespace-pre-wrap capitalize">{portion?.name || ''}</span>
                </td>
                <td className="flex w-[20%] flex-row text-center !text-sm font-semibold">
                  <span className="mx-auto">₹ {portion?.price || 0}</span>
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
