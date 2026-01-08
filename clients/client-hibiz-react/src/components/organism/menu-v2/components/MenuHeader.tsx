import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Menu, RefreshCw, Save, Eye } from 'lucide-react';
import { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import useBusinessData from '@/components/store/useBusinessData';
import { db } from '../db/menu.database';
import { useMenuUIStore } from '../store/useMenuUIStore';
import { ConfirmDialog } from './ConfirmDialog';
import { ChangesReviewModal } from './ChangesReviewModal';

interface MenuHeaderProps {
  onPushMenu: () => void;
  isPushing: boolean;
}

export const MenuHeader = ({ onPushMenu, isPushing }: MenuHeaderProps) => {
  const { activeTab, setActiveTab, toggleSidebar, isDirty, draftOpsCount, lastPushedAt } = useMenuUIStore();
  const [showRefreshDialog, setShowRefreshDialog] = useState(false);
  const [showChangesModal, setShowChangesModal] = useState(false);
  
  // Get businessId (assuming it's available via useBusinessData or passed as prop)
  const businessId = useBusinessData((s) => s.outletInfo?.businessId) || '';
  
  // Get pending images count
  const pendingImagesCount = useLiveQuery(
    async () => {
      if (!businessId) return 0;
      const images = await db.pendingImages.where({ businessId }).toArray();
      return images.length;
    },
    [businessId]
  ) || 0;
  
  const totalChangesCount = draftOpsCount + pendingImagesCount;

  const handlePushMenu = async () => {
    try {
      await onPushMenu();
    } catch (error) {
      console.error('Failed to push menu:', error);
    }
  };

  const handleRefresh = () => {
    if (isDirty) {
      setShowRefreshDialog(true);
    } else {
      // Reload the page or refetch data
      window.location.reload();
    }
  };

  const handleConfirmRefresh = () => {
    setShowRefreshDialog(false);
    window.location.reload();
  };

  return (
    <>
      <header className="border-b border-gray-200 bg-white px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Left: Burger + Tabs */}
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={toggleSidebar} className="text-purple-600">
              <Menu className="h-5 w-5" />
            </Button>

            <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)}>
              <TabsList className="bg-purple-50">
                <TabsTrigger value="DISHES" className="data-[state=active]:bg-purple-600 data-[state=active]:text-white">
                  Dishes
                </TabsTrigger>
                <TabsTrigger value="CATEGORIES" className="data-[state=active]:bg-purple-600 data-[state=active]:text-white">
                  Categories
                </TabsTrigger>
                <TabsTrigger value="ADDONS" className="data-[state=active]:bg-purple-600 data-[state=active]:text-white">
                  Add-ons
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-3">
            {lastPushedAt && <span className="text-sm text-gray-500">Last synced: {new Date(lastPushedAt).toLocaleTimeString()}</span>}

            <Button variant="outline" size="sm" onClick={handleRefresh} className="gap-2">
              <RefreshCw className="h-4 w-4" />
              Refresh
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowChangesModal(true)}
              disabled={totalChangesCount === 0 || isPushing}
              className="gap-2"
            >
              <Eye className="h-4 w-4" />
              VIEW CHANGES
              {totalChangesCount > 0 && (
                <Badge variant="secondary" className="ml-1">
                  {totalChangesCount}
                </Badge>
              )}
            </Button>

            <Button
              variant="default"
              size="sm"
              onClick={handlePushMenu}
              disabled={!isDirty || isPushing}
              className="gap-2 bg-purple-600 hover:bg-purple-700"
            >
              <Save className="h-4 w-4" />
              {isPushing ? 'Pushing...' : 'Push Menu'}
              {draftOpsCount > 0 && (
                <Badge variant="secondary" className="ml-1">
                  {draftOpsCount}
                </Badge>
              )}
            </Button>
          </div>
        </div>
      </header>

      <ConfirmDialog
        open={showRefreshDialog}
        onOpenChange={setShowRefreshDialog}
        title="Unsaved Changes"
        description="You have unsaved changes. Refreshing will discard them. Do you want to continue?"
        onConfirm={handleConfirmRefresh}
        confirmText="Refresh Anyway"
        destructive
      />

      {businessId && (
        <ChangesReviewModal
          isOpen={showChangesModal}
          onClose={() => setShowChangesModal(false)}
          businessId={businessId}
        />
      )}
    </>
  );
};
