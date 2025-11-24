import { useCartStore } from '@/components/store/useCartStore';
import type { DishType } from '@hi/db-models/src/validators';
import { memo, useCallback, useEffect, useMemo } from 'react';

function MemoChoosePortions({ dishData }: { dishData: DishType }) {
  const selectedPortion = useCartStore((s) => s.selectedPortion);
  const setSelectedPortion = useCartStore((s) => s.setSelectedPortion);

  const portions = useMemo(() => dishData?.portions ?? [], [dishData]);

  useEffect(() => {
    if (!portions.length) return;

    const selectionStillValid = selectedPortion && portions.some((p) => p._id === selectedPortion._id);

    if (!selectionStillValid) {
      setSelectedPortion(portions[0]);
    }
  }, [dishData?._id, portions]);

  const onChoose = useCallback(
    (portion: (typeof portions)[number]) => {
      if (selectedPortion?._id !== portion._id) setSelectedPortion(portion);
    },
    [selectedPortion?._id, setSelectedPortion],
  );

  if (portions.length === 0) return null;

  return (
    <div className="mx-4">
      <div className="prose">
        <h3 className="!text-xl text-[#000000]">Choose a portion</h3>
      </div>

      <div className="my-2 overflow-x-auto rounded-lg border border-[#000000]">
        <table className="table-compact table-zebra my-0 table w-full overflow-hidden">
          <tbody>
            {portions.map((portion, index) => {
              const checked = selectedPortion?._id === portion._id;
              return (
                <tr
                  key={`${portion?.name?.replaceAll(' ', '') || ''}${index}`}
                  className={`my-3 flex cursor-pointer flex-row ${checked ? 'bg-gray-100' : ''}`}
                  onClick={() => onChoose(portion)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') onChoose(portion);
                  }}
                  tabIndex={0}
                  role="radio"
                  aria-checked={checked}
                >
                  <td className="flex w-[2rem] flex-row text-center !text-xs">
                    <input type="radio" name="portion" className="radio ml-auto mr-2 p-1 text-2xl text-black" checked={checked} readOnly />
                  </td>
                  <td className="flex w-[90%] flex-row flex-wrap !text-sm">
                    <span className="my-auto w-full whitespace-pre-wrap capitalize">{portion?.name || ''}</span>
                  </td>
                  <td className="flex w-[20%] flex-row !text-sm font-semibold">
                    {portion?.price > 1 && <span className="mx-auto">{portion?.price || 0}</span>}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

const ChoosePortions = memo(MemoChoosePortions);
export default ChoosePortions;
