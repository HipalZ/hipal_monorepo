import useBusinessData from '@/components/store/useBusinessData';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useLiveQuery } from 'dexie-react-hooks';
import { useMemo, useState } from 'react';
import { HiPlus } from 'react-icons/hi';
import { db } from '../db/menu.database';
import { useMenuUIStore } from '../store/useMenuUIStore';
import { AddonModalV2 } from './modals/AddonModalV2';

export const AddonsView = () => {
  const businessId = useBusinessData((s) => s.outletInfo?.businessId);
  const selectedSidebarItem = useMenuUIStore((s) => s.selectedSidebarItem);
  const isAllView = selectedSidebarItem === 'ALL';
  const mergeMode = useMenuUIStore((s) => s.mergeMode);

  const [isAddonModalOpen, setIsAddonModalOpen] = useState(false);

  const allAddons = useLiveQuery(() => db.addons.toArray(), []);

  const addons = useMemo(() => {
    if (!allAddons) return [];
    if (isAllView) {
      // Clubbed View: Group by name
      const map = new Map<string, any>();
      allAddons.forEach((addon) => {
        const key = addon.name.trim().toLowerCase();
        if (!map.has(key)) {
          map.set(key, { ...addon, count: 0, menus: [] });
        }
        const grouped = map.get(key);
        grouped.count++;
        if (addon.menuId) grouped.menus.push(addon.menuId);
      });
      return Array.from(map.values());
    }
    return allAddons.filter((a) => a.menuId === selectedSidebarItem);
  }, [allAddons, isAllView, selectedSidebarItem]);

  if (!allAddons) {
    return <div className="p-8 text-center text-gray-500">Loading add-ons...</div>;
  }

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">{isAllView ? 'All Add-ons (Clubbed)' : 'Menu Add-ons'}</h1>
        <div className="flex items-center gap-2">
          <Badge variant="secondary">{addons.length} total</Badge>
          <Button
            onClick={() => setIsAddonModalOpen(true)}
            disabled={isAllView && !mergeMode} // Disable in ALL view unless merge mode (if applicable), usually create needs specific menu or merge
            className="brutal-button-primary bg-yellow-400 text-xs disabled:opacity-50"
            size="sm"
          >
            <HiPlus className="mr-1 inline h-4 w-4" /> ADD ADDON
          </Button>
        </div>
      </div>

      {addons.length === 0 ? (
        <div className="p-8 text-center text-gray-500">No add-ons found in this view</div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {addons.map((addon) => (
            <div key={addon._id} className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm transition-colors hover:border-purple-300">
              <div className="mb-2 flex items-center justify-between">
                <h3 className="truncate pr-2 font-semibold text-gray-900">{addon.name}</h3>
                {isAllView ? (
                  <Badge variant="secondary" className="border-none bg-purple-100 text-[10px] text-purple-700">
                    {addon.count} Menus
                  </Badge>
                ) : (
                  <Badge
                    variant={addon.isVegetarian ? 'secondary' : 'destructive'}
                    className="border-green-200 bg-green-50 text-[10px] text-green-700"
                  >
                    {addon.isVegetarian ? 'Veg' : 'Non-Veg'}
                  </Badge>
                )}
              </div>

              <div className="mb-2 min-h-[40px] text-sm text-gray-600">
                {addon.choices && addon.choices.length > 0 ? (
                  <div className="flex flex-wrap gap-1">
                    {addon.choices.slice(0, 4).map((choice: any, idx: number) => (
                      <span key={idx} className="rounded border border-gray-100 bg-gray-50 px-1.5 py-0.5 text-[10px] text-gray-600">
                        {choice.name} (+₹{choice.price})
                      </span>
                    ))}
                    {addon.choices.length > 4 && <span className="text-[10px] text-gray-400">+{addon.choices.length - 4}</span>}
                  </div>
                ) : (
                  <span className="block w-full text-center text-xs italic text-gray-400">No choices defined</span>
                )}
              </div>

              <div className="mt-4 flex items-center justify-between border-t pt-2 text-[10px] text-gray-400">
                <span>{addon.dishIds?.length || 0} Linked Dishes</span>
                <span>{isAllView ? 'Global Config' : `ID: ${addon._id.substring(0, 8)}`}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Addon Modal */}
      <AddonModalV2
        isOpen={isAddonModalOpen}
        onClose={() => setIsAddonModalOpen(false)}
        addon={null} // Create mode
        businessId={businessId || ''}
        selectedMenuId={selectedSidebarItem}
        isMergeMode={mergeMode}
      />
    </div>
  );
};
