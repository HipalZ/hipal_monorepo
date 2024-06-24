import { memo } from 'react';

function AddTipComponent({ tip, handleTipChange, addingTip }) {
  return (
    <div className="relative space-y-4 overflow-auto p-4">
      <div className="font-medium">Add Tip</div>
      <div>
        <input
          type="number"
          value={tip}
          className="w-full rounded-2xl border border-[#79747E] px-4 py-1 focus:outline-none focus:ring-0"
          onChange={handleTipChange}
          max="10000"
        />
      </div>
      <div className="flex items-center justify-end">
        <button
          type="button"
          onClick={addingTip}
          className="on_active_bounce text-base-100 bg-primary flex w-[25%] items-center justify-center rounded-full px-4 py-1"
        >
          Add
        </button>
      </div>
    </div>
  );
}

export default memo(AddTipComponent);
