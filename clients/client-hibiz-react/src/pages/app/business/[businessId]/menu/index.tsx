import { AddonsPanel } from '@/components/organism/menu-v2/components/AddonsPanel';
import { CategoriesPanel } from '@/components/organism/menu-v2/components/CategoriesPanel';
import { ChangesReviewModal } from '@/components/organism/menu-v2/components/ChangesReviewModal';
import { ItemsPanel } from '@/components/organism/menu-v2/components/ItemsPanel';
import { KitchenPanel } from '@/components/organism/menu-v2/components/KitchenComponents/KitchenPanel';
import { KitchenRoutingPanel } from '@/components/organism/menu-v2/components/KitchenRoutingPanel';
import { MenuSwitcher } from '@/components/organism/menu-v2/components/MenuSwitcher';
import type { PushProgress } from '@/components/organism/menu-v2/components/PushProgressModal';
import { PushProgressModal } from '@/components/organism/menu-v2/components/PushProgressModal';
import { db } from '@/components/organism/menu-v2/db/menu.database';
import { useDraftOpsSync } from '@/components/organism/menu-v2/hooks/useDraftOpsSync';
import { useMenuBootstrap } from '@/components/organism/menu-v2/hooks/useMenuBootstrap';
import { useMenuPush } from '@/components/organism/menu-v2/hooks/useMenuPush';
import { useMenuUIStore } from '@/components/organism/menu-v2/store/useMenuUIStore';
import '@/components/organism/menu-v2/styles/brutalist.css';
import useBusinessData from '@/components/store/useBusinessData';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbSeparator } from '@/components/ui/breadcrumb';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useLiveQuery } from 'dexie-react-hooks';
import { Eye, RefreshCw, Save } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const MenuManagementPage = () => {
  const navigate = useNavigate();
  const businessId = useBusinessData((s) => s.outletInfo?.businessId);
  const activeTab = useMenuUIStore((s) => s.activeTab);
  const setActiveTab = useMenuUIStore((s) => s.setActiveTab);
  const showQuickMenu = useMenuUIStore((s) => s.showQuickMenu);
  const isDirty = useMenuUIStore((s) => s.isDirty);
  const lastPushedAt = useMenuUIStore((s) => s.lastPushedAt);
  const draftOpsCount = useMenuUIStore((s) => s.draftOpsCount);

  const { data, isLoading, refetch } = useMenuBootstrap(businessId || '');
  const { pushMenu, isPushing, progress, setProgress } = useMenuPush(businessId || '');
  const [showProgressModal, setShowProgressModal] = useState(false);
  const [showChangesModal, setShowChangesModal] = useState(false);
  useDraftOpsSync();

  // Get pending images count
  const pendingImagesCount =
    useLiveQuery(async () => {
      if (!businessId) return 0;
      const images = await db.pendingImages.where({ businessId }).toArray();
      return images.length;
    }, [businessId]) || 0;

  const totalChangesCount = draftOpsCount + pendingImagesCount;

  useEffect(() => {
    if (!businessId) {
      navigate('/app/business');
    }
  }, [businessId, navigate]);

  const handleRefresh = async () => {
    if (isDirty) {
      const ok = window.confirm('You have unsaved changes. Refresh will discard them.');
      if (!ok) return;
    }
    await refetch();
  };

  const handleBack = () => {
    if (isPushing) {
      const ok = window.confirm('Push operation in progress. Are you sure you want to leave?');
      if (!ok) return;
    }
    if (isDirty) {
      const ok = window.confirm('You will lose unsaved changes. Continue?');
      if (!ok) return;
    }
    navigate(-1);
  };

  const handlePushMenu = useCallback(async () => {
    setShowProgressModal(true);
    try {
      await pushMenu((progressUpdate: PushProgress) => {
        // Progress callback handled by hook
      });
    } catch (error) {
      // Error handled in hook, modal will show error state
    }
  }, [pushMenu]);

  // Prevent navigation/refresh during push
  useEffect(() => {
    if (isPushing) {
      const handleBeforeUnload = (e: BeforeUnloadEvent) => {
        e.preventDefault();
        e.returnValue = '';
      };
      window.addEventListener('beforeunload', handleBeforeUnload);
      return () => window.removeEventListener('beforeunload', handleBeforeUnload);
    }
  }, [isPushing]);

  if (!businessId) {
    return <div className="flex h-screen items-center justify-center text-gray-600">Select a business to manage menu.</div>;
  }

  if (isLoading) {
    return <div className="flex h-screen items-center justify-center text-gray-600">Loading menu data...</div>;
  }

  return (
    <section className="min-h-screen" style={{ background: '#F3F4F6' }}>
      {/* Global Header - 80px height, 3px black border bottom */}
      <div className="sticky top-0 z-20" style={{ height: '80px', borderBottom: '3px solid #000000', background: '#FFFFFF' }}>
        <div className="flex h-full items-center justify-between px-6">
          <div className="space-y-1">
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbLink onClick={handleBack} className="brutal-body cursor-pointer" style={{ fontWeight: 700 }}>
                    BACK
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbLink className="brutal-body" style={{ fontWeight: 700 }}>
                    MENU
                  </BreadcrumbLink>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
            <h1 className="brutal-heading" style={{ fontSize: '1.25rem' }}>
              MENU MANAGEMENT
            </h1>
            <div className="brutal-data" style={{ fontSize: '0.75rem' }}>
              Offline-first. Last pushed: {lastPushedAt ? new Date(lastPushedAt).toLocaleTimeString() : 'Never'}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button type="button" onClick={handleRefresh} className="brutal-button" style={{ padding: '8px 16px', fontSize: '0.875rem' }}>
              <RefreshCw className="brutal-icon" style={{ width: '16px', height: '16px', display: 'inline', marginRight: '4px' }} />
              REFRESH
            </button>
            {totalChangesCount > 0 && (
              <button
                type="button"
                onClick={() => setShowChangesModal(true)}
                disabled={isPushing}
                className="brutal-button"
                style={{ padding: '8px 16px', fontSize: '0.875rem', opacity: isPushing ? 0.5 : 1 }}
              >
                <Eye className="brutal-icon" style={{ width: '16px', height: '16px', display: 'inline', marginRight: '4px' }} />
                VIEW CHANGES
                <span className="brutal-badge-yellow" style={{ marginLeft: '8px', padding: '2px 6px', fontSize: '0.75rem' }}>
                  {totalChangesCount}
                </span>
              </button>
            )}
            <button
              type="button"
              onClick={handlePushMenu}
              disabled={(draftOpsCount === 0 && !isDirty) || isPushing}
              className="brutal-button-primary"
              style={{ padding: '8px 16px', fontSize: '0.875rem', opacity: (draftOpsCount === 0 && !isDirty) || isPushing ? 0.5 : 1 }}
            >
              <Save className="brutal-icon" style={{ width: '16px', height: '16px', display: 'inline', marginRight: '4px' }} />
              {isPushing ? 'PUSHING...' : 'PUSH MENU'}
              {draftOpsCount > 0 ? (
                <span className="brutal-badge-yellow" style={{ marginLeft: '8px', padding: '2px 6px', fontSize: '0.75rem' }}>
                  {draftOpsCount}
                </span>
              ) : null}
            </button>
          </div>
        </div>
      </div>

      {/* Tabs and Menu Switcher - Hidden when QuickMenuPanel is active */}
      {!showQuickMenu && (
        <div className="flex items-center justify-between border-b-0 px-6 py-4" style={{ borderBottom: '3px solid #000000', background: '#FFFFFF' }}>
          <div className="flex gap-0" style={{ background: '#FFFFFF', border: '3px solid #000000' }}>
            <button
              type="button"
              onClick={() => setActiveTab('DISHES')}
              className="brutal-button"
              style={{
                padding: '8px 16px',
                fontSize: '0.875rem',
                background: activeTab === 'DISHES' ? '#FFEB3B' : '#FFFFFF',
                borderRight: activeTab === 'DISHES' ? '3px solid #000000' : '2px solid #000000',
              }}
            >
              ITEMS
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('CATEGORIES')}
              className="brutal-button"
              style={{
                padding: '8px 16px',
                fontSize: '0.875rem',
                background: activeTab === 'CATEGORIES' ? '#FFEB3B' : '#FFFFFF',
                borderRight: activeTab === 'CATEGORIES' ? '3px solid #000000' : '2px solid #000000',
              }}
            >
              CATEGORIES
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('ADDONS')}
              className="brutal-button"
              style={{
                padding: '8px 16px',
                fontSize: '0.875rem',
                background: activeTab === 'ADDONS' ? '#FFEB3B' : '#FFFFFF',
                borderRight: activeTab === 'ADDONS' ? '3px solid #000000' : '2px solid #000000',
              }}
            >
              ADDONS
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('KITCHEN')}
              className="brutal-button"
              style={{
                padding: '8px 16px',
                fontSize: '0.875rem',
                background: activeTab === 'KITCHEN' ? '#FFEB3B' : '#FFFFFF',
                borderRight: activeTab === 'KITCHEN' ? '3px solid #000000' : '2px solid #000000',
              }}
            >
              KITCHEN
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('ZONES')}
              className="brutal-button"
              style={{
                padding: '8px 16px',
                fontSize: '0.875rem',
                background: activeTab === 'ZONES' ? '#FFEB3B' : '#FFFFFF',
                borderRight: 'none',
              }}
            >
              ZONES
            </button>
          </div>
          <MenuSwitcher businessId={businessId} />
        </div>
      )}

      <div className="px-6 py-4" style={{ background: '#F3F4F6' }}>
        {activeTab === 'DISHES' && <ItemsPanel />}
        {activeTab === 'CATEGORIES' && <CategoriesPanel />}
        {activeTab === 'ADDONS' && <AddonsPanel />}
        {activeTab === 'KITCHEN' && <KitchenPanel />}
        {activeTab === 'ZONES' && <KitchenRoutingPanel />}
      </div>

      {/* Push Progress Modal */}
      {showProgressModal && progress && (
        <PushProgressModal
          isOpen={showProgressModal}
          progress={progress}
          onClose={() => {
            if (progress.phase === 'complete' || progress.phase === 'error') {
              setShowProgressModal(false);
              setProgress(null);
            }
          }}
        />
      )}

      {/* Changes Review Modal */}
      {businessId && <ChangesReviewModal isOpen={showChangesModal} onClose={() => setShowChangesModal(false)} businessId={businessId} />}
    </section>
  );
};

export default MenuManagementPage;
