import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { KotList } from './KotList';
import { SidebarTabs } from './SidebarTabs';

// ⬇️ Import your real store that has captainData
import { useHiClientZ } from '@/components/store/useHiClientzData'; // make sure this path matches your project
import { useKotByKitchen, useKotHistory } from '../../hooks/useKotHook';
import { useKdsStore } from '../store/useKdsStore';
import { KotHistoryList } from './KotHistoryList';

interface KotDashboardProps {
  kitchenId: string;
  className?: string;
}

export const KotDashboard = ({ kitchenId, className }: KotDashboardProps) => {
  const { activeTab, setActiveTab } = useKdsStore();

  // get captain (staff) from your store
  const captain = useHiClientZ((s) => s.captainData);
  const staffId = captain?._id as string | undefined;

  // OPEN
  const { data: openData = [], isLoading: loadingOpen, error: errorOpen, refetchKotByKitchen } = useKotByKitchen(kitchenId);

  // COMPLETED
  const { data: histData = [], isLoading: loadingHist, error: errorHist, refetchKotHistory } = useKotHistory(kitchenId);

  const backToOpen = () => setActiveTab('OPEN');

  const headerRight =
    activeTab === 'OPEN' ? (
      <div className="text-xs text-zinc-400">{loadingOpen ? 'Refreshing…' : `${openData.length} ticket(s)`}</div>
    ) : (
      <div className="flex items-center gap-2">
        <Button size="sm" variant="outline" onClick={backToOpen}>
          Back
        </Button>
        <div className="text-xs text-zinc-400">{loadingHist ? 'Loading…' : `${histData.length} completed`}</div>
      </div>
    );

  return (
    <div className={`grid grid-cols-12 gap-2 ${className ?? ''}`}>
      <div className="col-span-12 lg:col-span-4 xl:col-span-3">
        <SidebarTabs
          kitchenId={kitchenId}
          openOrders={openData}
          onRefreshOpen={() => refetchKotByKitchen()}
          loadingOpen={loadingOpen}
          historyOrders={histData}
          onRefreshHistory={() => refetchKotHistory()}
          loadingHistory={loadingHist}
          onBackFromCompleted={backToOpen}
        />
      </div>

      <div className="col-span-12 lg:col-span-8 xl:col-span-9">
        <Card className="border-none bg-transparent p-1 shadow-none">
          <CardHeader className="p-0 pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">{activeTab === 'OPEN' ? 'Open KOTs' : 'Completed KOTs (History)'}</CardTitle>
              {headerRight}
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {activeTab === 'OPEN' ? (
              errorOpen ? (
                <div className="text-sm text-red-500">Error: {(errorOpen as any)?.message}</div>
              ) : (
                <ScrollArea className="h-[calc(100vh-100px)]">
                  <KotList orders={openData} staffId={staffId} />
                </ScrollArea>
              )
            ) : errorHist ? (
              <div className="text-sm text-red-500">Error: {(errorHist as any)?.message}</div>
            ) : (
              <ScrollArea className="h-[calc(100vh-100px)]">
                <KotHistoryList orders={histData} staffId={staffId} />
              </ScrollArea>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
