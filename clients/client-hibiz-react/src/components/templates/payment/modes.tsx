import LoadingSpinner from '@/components/atom/loadingSpinner';
import useBusinessData from '@/components/store/useBusinessData';
import { Switch } from '@/components/ui/switch';
import { useAllModes } from '@/hooks/useMode';
import { apiRpc } from '@hi/common';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { memo, useCallback, useState } from 'react';
import toast from 'react-hot-toast';

const MemoModes = () => {
  const [newMode, setNewMode] = useState('');
  const queryClient = useQueryClient();
  const businessId = useBusinessData((s) => s.businessData?._id);
  const { isLoading, data: modes } = useAllModes();

  const handleModeInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setNewMode(e.target.value.toLowerCase().replace(/\s+/g, ''));
  }, []);

  // Mutation for adding a new mode
  const createModeMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRpc.upi_mode.$post({
        json: { name: newMode, businessId: businessId || '' },
      });
      return response.json();
    },
    onSuccess: (data) => {
      if (!data?.err) {
        setNewMode('');
        queryClient.invalidateQueries({ queryKey: ['allModes', businessId] });
        toast.success(data?.message);
      } else {
        toast.error(data?.message);
      }
    },
    onError: () => toast.error('Failed to add mode'),
  });

  // Mutation for toggling active/inactive state
  const toggleModeMutation = useMutation({
    mutationFn: async ({ id, active }: { id: string; active: boolean }) => {
      const response = await apiRpc.upi_mode[':upiModeId'].$put({
        param: {
          upiModeId: id,
        },
        json: {
          active,
        },
      });
      return response.json();
    },
    onSuccess: (data) => {
      if (!data?.err) {
        queryClient.invalidateQueries({ queryKey: ['allModes', businessId] });
        toast.success(data?.message);
      } else {
        toast.error(data?.message);
      }
    },
    onError: () => toast.error('Failed to update mode'),
  });

  const handleToggleMode = (id: string, active: boolean) => {
    toggleModeMutation.mutate({ id, active });
  };

  return (
    <div className="container mx-auto px-4 pb-[7rem] pt-4">
      <h1 className="mb-6 text-2xl font-bold">Payment Modes</h1>

      {/* Input and Add Button */}
      <div className="mb-4 flex items-center space-x-4">
        <input
          type="text"
          placeholder="Enter payment mode"
          className="w-full rounded-lg border border-gray-300 p-2"
          value={newMode}
          maxLength={100}
          onChange={handleModeInputChange}
        />
        <button
          type="button"
          disabled={createModeMutation.isPending}
          onClick={() => createModeMutation.mutate()}
          className="rounded-lg bg-indigo-500 px-4 py-2 text-white hover:bg-indigo-600 disabled:opacity-50"
        >
          {createModeMutation.isPending ? 'Adding...' : 'Add'}
        </button>
      </div>

      {/* Loading State */}
      {isLoading ? (
        <LoadingSpinner />
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {modes?.length ? (
            modes.map((mode) => (
              <section key={mode._id} className="flex items-center justify-between rounded-lg border border-gray-300 p-4">
                <h1 className="overflow-hidden truncate text-lg font-bold">{mode.name}</h1>
                <Switch
                  onCheckedChange={() => handleToggleMode(mode?._id, !mode?.active)}
                  checked={mode?.active}
                  className={`mt-2 ${mode.active ? 'data-[state=checked]:bg-green-500' : 'data-[state=unchecked]:bg-red-500'}`}
                  disabled={toggleModeMutation.isPending}
                />
              </section>
            ))
          ) : (
            <p className="text-center text-gray-500">No Modes Available</p>
          )}
        </div>
      )}
    </div>
  );
};

const Modes = memo(MemoModes);
export default Modes;
