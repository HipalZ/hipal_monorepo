import { useCategories } from '@/components/hooks/useCategories';
import { useOrderStore } from '@/components/store/useOrderData';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { ArrowLeft, RefreshCcw, Settings2 } from 'lucide-react';
import { memo, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import SpinnerMemo from '../atoms/loadingSpinner';
import { QuickActionsDrawer } from './QuickActionDrawer';

const SidebarCategories = () => {
  const navigate = useNavigate();
  const { businessId } = useParams();
  const { isLoading, refetch } = useCategories();

  const categories = useOrderStore((s) => s.allCategories);
  const selected = useOrderStore((s) => s.selectedCategory);
  const setSelected = useOrderStore((s) => s.setSelectedCategory);

  const goToAlerts = useCallback(() => {
    navigate(`/${businessId}/alerts`);
  }, [businessId, navigate]);

  const handleRefresh = useCallback(() => {
    refetch();
  }, [refetch]);

  const toQuickEdit = useCallback(() => {
    navigate(`/${businessId}/edit-menu`);
  }, [businessId, navigate]);

  const customActions = [
    {
      name: 'Refresh Categories',
      icon: RefreshCcw,
      onClick: handleRefresh,
      variant: 'secondary' as const,
    },
    {
      name: 'Quick Edit Dishes',
      icon: Settings2,
      onClick: toQuickEdit,
      variant: 'secondary' as const,
    },
  ];

  if (isLoading) {
    return <SpinnerMemo />;
  }

  return (
    <div className="bg-background flex h-screen w-full max-w-[12rem] flex-col border-r-2">
      {/* Header */}
      <div className="flex items-center justify-between border-b p-3">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={goToAlerts} className="h-8 w-8">
            <ArrowLeft size={24} strokeWidth={3} className="h-4 w-4" />
          </Button>
          <span className="poppins text-xl font-medium">Back</span>
        </div>
        <QuickActionsDrawer customActions={customActions} />
      </div>

      {/* Scrollable Category List */}
      <div className="hide-scrollbar flex-1 overflow-y-auto py-2">
        {categories?.map((cat) => (
          <Button
            key={cat._id}
            onClick={() => setSelected(cat)}
            variant={selected?._id === cat._id ? 'default' : 'ghost'}
            className={cn(
              'poppins w-full justify-start rounded-none py-3 pl-3 pr-2 text-left text-lg transition-colors duration-150',
              'h-auto min-h-[2.5rem] overflow-visible whitespace-normal break-words normal-case leading-snug',
              selected?._id === cat._id ? 'bg-primary text-primary-foreground' : 'hover:bg-muted',
            )}
          >
            {cat.name}
          </Button>
        ))}
      </div>
    </div>
  );
};

export default memo(SidebarCategories);
