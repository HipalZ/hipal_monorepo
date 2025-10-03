import { usePosSyncWithMenu } from '@/hooks/usePosHook.ts';
import { SquarePen } from 'lucide-react';
import { memo, useCallback, useState } from 'react';
import { BiSync } from 'react-icons/bi';

interface PosConfigData {
  _id: string;
  businessId: string;
  posId: string;
  orderMode: string;
  orderVerificationType: 'CAPTAIN' | 'USER';
  petPoojaId: string;
  restName: string;
  posName: string;
  restId: string;
  defaultTableName: string;
  accessKey?: string;
  authToken?: string;
  secretKey?: string;
  branchId?: string;
  isDeleted: boolean;
}

interface PosWithMenuCardProps {
  config: PosConfigData;
  onEdit: () => void;
}

const MemoPosWithMenuCard = ({ config, onEdit }: PosWithMenuCardProps) => {
  const { isPending, mutate } = usePosSyncWithMenu();

  const handleSync = useCallback(
    (restId: string, tableName?: string) => {
      mutate({ restId, tableName });
    },
    [mutate],
  );

  const [isEditingTable, setIsEditingTable] = useState(false);
  const [tableName, setTableName] = useState(config.defaultTableName);

  return (
    <div className="max-w-[30rem] overflow-hidden rounded-xl border border-gray-200 bg-white shadow-lg">
      <div className="bg-blue-700 px-6 py-4">
        <h2 className="text-xl font-bold text-white">POS Configuration</h2>
        <p className="text-blue-100">Current setup details</p>
      </div>

      <div className="p-4">
        <div className="grid grid-cols-2 gap-6">
          <div>
            <div className="space-y-3">
              <div>
                <span className="text-sm text-gray-600">POS Name:</span>
                <p className="font-semibold capitalize text-gray-900">{config.posName}</p>
              </div>
              <div>
                <span className="text-sm text-gray-600">Restaurant Name:</span>
                <p className="font-semibold text-gray-900">{config.restName}</p>
              </div>
            </div>
          </div>
          <div>
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">Default Table:</span>
              </div>
              <input
                type="text"
                className="mt-1 w-[80%] rounded-lg border border-gray-300 px-2 py-1 font-semibold text-gray-900 focus:border-blue-500 focus:outline-none"
                value={tableName}
                disabled={!isEditingTable || isPending}
                readOnly={!isEditingTable || isPending}
                onChange={(e) => setTableName(e.target.value)}
                onBlur={() => setIsEditingTable(false)}
              />
              <button
                type="button"
                className="ml-1 rounded p-1 hover:bg-gray-100"
                onClick={() => setIsEditingTable(true)}
                disabled={isPending || isEditingTable}
                aria-label="Edit Table Name"
              >
                <SquarePen className="h-4 w-4 text-red-500" />
              </button>
              <div>
                <span className="text-sm text-gray-600">Restaurant ID:</span>
                <p className="font-semibold text-gray-900">{config.restId}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 flex gap-6">
          <button
            type="button"
            onClick={onEdit}
            disabled={isPending}
            className="w-full text-nowrap rounded-lg border border-black px-4 py-2 text-sm font-medium text-black transition-colors md:w-auto"
          >
            Edit Configuration
          </button>
          <button
            type="button"
            disabled={isPending}
            onClick={() => handleSync(config?.restId)}
            className={`flex w-full items-center justify-center rounded-lg bg-blue-700 px-6 py-2 font-medium text-white transition-colors md:w-auto ${isPending ? 'cursor-not-allowed opacity-50' : 'hover:bg-primary-dark'} `}
          >
            {isPending ? (
              // spinner
              <span className="mr-2 inline-block h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
            ) : (
              <BiSync className="mr-2 inline-block" />
            )}
            {isPending ? 'Syncing...' : 'Sync'}
          </button>
        </div>
      </div>
    </div>
  );
};

const PosWithMenuCard = memo(MemoPosWithMenuCard);
export default PosWithMenuCard;
