/**
 * AddonsPanel Component
 *
 * Main panel for managing addons in Menu V2.
 * Displays addons grouped by hierarchy (parent/child) or as standalone items.
 */

import useBusinessData from '@/components/store/useBusinessData';
import { useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { HiPlus } from 'react-icons/hi';
import { DraftOpsRepository } from '../db/DraftOpsRepository';
import { useMenuViewData } from '../hooks/useMenuViewData';
import { useMenuUIStore } from '../store/useMenuUIStore';
import '../styles/brutalist.css';
import type { MenuAddon } from '../types';
import { AddonRow } from './AddonRow';
import { AddonEditModal } from './modals/AddonEditModal';
import { AddonModalV2 } from './modals/AddonModalV2';

export const AddonsPanel = () => {
  const businessId = useBusinessData((s) => s.outletInfo?.businessId);
  const { addonGroups, addons } = useMenuViewData({ businessId });
  const selectedMenuId = useMenuUIStore((s) => s.selectedMenuId);
  const mergeMode = useMenuUIStore((s) => s.mergeMode);
  const [search, setSearch] = useState('');
  const [editingAddon, setEditingAddon] = useState<MenuAddon | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const filteredGroups = useMemo(() => {
    if (!search.trim()) return addonGroups || [];
    const q = search.toLowerCase();
    return (addonGroups || []).filter((g) => g.group.name?.toLowerCase().includes(q) || g.items.some((i) => i.name?.toLowerCase().includes(q)));
  }, [addonGroups, search]);

  // Standalone addons (not in groups)
  const standaloneAddons = useMemo<MenuAddon[]>(() => {
    const allAddons = addons || [];
    const groupedAddonIds = new Set<string>();
    (addonGroups || []).forEach((g) => {
      groupedAddonIds.add(g.group._id);
      g.items.forEach((item) => groupedAddonIds.add(item._id));
    });
    return allAddons.filter((a) => !groupedAddonIds.has(a._id));
  }, [addons, addonGroups]);

  const handleToggleAvailability = async (addonId: string, availability: boolean) => {
    if (!businessId) return;
    try {
      await DraftOpsRepository.updateAddon(addonId, businessId, { availability });
      toast.success('Availability updated');
    } catch (error) {
      toast.error('Failed to update availability');
    }
  };

  const isMergedView = mergeMode || selectedMenuId === 'ALL';

  return (
    <div className="brutal-card">
      <div className="flex flex-wrap items-center gap-3 px-4 py-3" style={{ borderBottom: '3px solid #000000' }}>
        <input
          type="text"
          placeholder="SEARCH ADDONS"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="brutal-input"
          style={{ width: '256px', padding: '8px 12px', fontSize: '0.875rem' }}
        />

        {/* ADD ADDON Button */}
        {!isMergedView ? (
          <button
            type="button"
            onClick={() => setIsCreateModalOpen(true)}
            className="brutal-button-primary bg-yellow-400 text-xs"
            style={{ padding: '8px 16px', fontWeight: 800 }}
          >
            <HiPlus className="mr-1 inline h-4 w-4" /> ADD ADDON
          </button>
        ) : (
          <button
            type="button"
            disabled
            className="brutal-button cursor-not-allowed text-xs opacity-50"
            style={{ padding: '8px 16px', fontWeight: 800 }}
            title="MERGED MODE: CREATION DISABLED"
          >
            <HiPlus className="mr-1 inline h-4 w-4" /> ADD ADDON
          </button>
        )}
      </div>

      <div className="px-4 py-3">
        {filteredGroups.length === 0 && standaloneAddons.length === 0 ? (
          <div className="brutal-body flex h-48 items-center justify-center" style={{ fontSize: '0.875rem' }}>
            NO ADDONS
          </div>
        ) : (
          <>
            {/* Addon Groups (parent hierarchy) */}
            {filteredGroups.length > 0 && (
              <div className="mb-4 space-y-2">
                {filteredGroups.map((g) => (
                  <div key={g.group._id || ''} className="brutal-card" style={{ marginBottom: '8px' }}>
                    <button
                      type="button"
                      className="brutal-body flex w-full items-center justify-between px-3 py-2"
                      style={{
                        borderBottom: '3px solid #000000',
                        textAlign: 'left',
                        background: '#FFFFFF',
                        fontSize: '0.875rem',
                        fontWeight: 700,
                      }}
                    >
                      <div>
                        <div style={{ textTransform: 'uppercase', fontWeight: 900 }}>{g.group.name}</div>
                        <div className="brutal-body" style={{ fontSize: '0.75rem' }}>
                          ADDON GROUP
                        </div>
                      </div>
                      <span className="brutal-badge">{g.items.length} ITEMS</span>
                    </button>
                    <div className="px-3 pb-3">
                      {g.items.length === 0 ? (
                        <div
                          className="brutal-input"
                          style={{
                            padding: '8px 12px',
                            fontSize: '0.75rem',
                            borderStyle: 'dashed',
                            textAlign: 'center',
                            marginTop: '8px',
                          }}
                        >
                          NO ADDONS IN THIS GROUP
                        </div>
                      ) : (
                        <>
                          <div
                            className="brutal-table-header grid grid-cols-8 gap-4 px-3 pb-2 pt-2"
                            style={{ fontSize: '0.75rem', letterSpacing: '0.05em' }}
                          >
                            <span>NAME</span>
                            <span>COMPULSORY</span>
                            <span>MAX QTY</span>
                            <span>CHOICE TYPE</span>
                            <span>LINKED DISHES</span>
                            <span>DATES</span>
                            <span>AVAILABILITY</span>
                            <span>ACTIONS</span>
                          </div>
                          <div style={{ border: '2px solid #000000' }}>
                            {g.items.map((item) => (
                              <AddonRow
                                key={item._id}
                                addon={item}
                                onEdit={setEditingAddon}
                                onToggleAvailability={handleToggleAvailability}
                                businessId={businessId}
                              />
                            ))}
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Standalone Addons (not in groups) */}
            {standaloneAddons.length > 0 && (
              <div className="space-y-2">
                <div className="brutal-table-header grid grid-cols-8 gap-4 px-3 pb-2" style={{ fontSize: '0.75rem', letterSpacing: '0.05em' }}>
                  <span>NAME</span>
                  <span>COMPULSORY</span>
                  <span>MAX QTY</span>
                  <span>CHOICE TYPE</span>
                  <span>LINKED DISHES</span>
                  <span>CREATED AT</span>
                  <span>AVAILABILITY</span>
                  <span>ACTIONS</span>
                </div>
                {standaloneAddons.map((addon) => (
                  <AddonRow
                    key={addon._id}
                    addon={addon}
                    onEdit={setEditingAddon}
                    onToggleAvailability={handleToggleAvailability}
                    businessId={businessId}
                  />
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {/* Edit Addon Modal */}
      {editingAddon && (
        <AddonEditModal addon={editingAddon} isOpen={!!editingAddon} onClose={() => setEditingAddon(null)} businessId={businessId || ''} />
      )}

      {/* Create Addon Modal (V2) */}
      <AddonModalV2
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        addon={null}
        businessId={businessId || ''}
        selectedMenuId={selectedMenuId}
        isMergeMode={mergeMode}
      />
    </div>
  );
};
