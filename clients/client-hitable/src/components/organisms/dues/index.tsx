import { memo } from 'react';

function DuesUserSelector({ billData, duesPersons, handleUserSelection, selectedPerson, finalClick, loading }) {
  return (
    <div className="relative min-h-[80vh]">
      <div className="mt-4 flex justify-between">
        <div className="text-base-content ml-6 font-[500] capitalize">select user</div>
        <div className="text-base-content mr-[1.5rem] font-[500] capitalize">₹ {billData.Total}</div>
      </div>
      <div className="mx-6 mt-4 max-h-[70vh] space-y-4 overflow-y-auto">
        {duesPersons.map((person) => (
          <div
            key={person.id}
            onClick={() => handleUserSelection(person.duesPersonNames, person.id)}
            onKeyDown={() => handleUserSelection(person.duesPersonNames, person.id)}
            className="flex cursor-pointer items-center justify-between rounded-xl border py-2 pr-4"
          >
            <label className="ml-4 line-clamp-1 font-medium capitalize">{person?.duesPersonNames}</label>
            <input
              type="checkbox"
              value="0"
              checked={selectedPerson?.id === person.id}
              onChange={() => handleUserSelection(person.duesPersonNames, person.id)}
            />
          </div>
        ))}
      </div>

      <div className="bg-primary shadow-base-100 fixed bottom-0 z-20 h-[4rem] w-full py-2 shadow-lg">
        <button
          type="button"
          onClick={finalClick}
          className={`border-base-100 text-primary bg-base-100 absolute bottom-3 right-6 z-50 mr-2 rounded-full border px-4 py-2 text-sm font-[500] ${
            loading ? 'cursor-not-allowed opacity-50' : ''
          }`}
          disabled={loading}
        >
          {loading ? 'Loading...' : 'Continue'}
        </button>
      </div>
    </div>
  );
}

export default memo(DuesUserSelector);
