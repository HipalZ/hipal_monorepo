import { useKotStore } from '@/components/store/useKotStore';
import { Button } from '@/components/ui/button';
import { useTablesKotMutation } from '@/hooks/useAllRunningTable';

const LoadRunningTablesKotButton = ({ activeTableIds }: { activeTableIds: string[] }) => {
  const { mutate, isPending } = useTablesKotMutation();
  const { setSelectedTableId, setOpen } = useKotStore();

  return (
    <Button
      size="sm"
      disabled={!activeTableIds.length || isPending}
      onClick={() => {
        mutate(
          { tableIds: activeTableIds },
          {
            onSuccess: (all) => {
              // pick first table or wait for user click later
              if (all.length) {
                setSelectedTableId(all[0].tableId);
                setOpen(true);
              }
            },
          },
        );
      }}
    >
      {isPending ? 'Loading...' : 'Show Details'}
    </Button>
  );
};
export default LoadRunningTablesKotButton;
