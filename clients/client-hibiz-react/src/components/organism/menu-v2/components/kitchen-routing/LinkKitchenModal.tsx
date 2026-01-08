/**
 * Link Kitchen Modal
 *
 * Modal for selecting kitchens to link to a zone.
 */

import PopUp from '@/components/atom/popUp';
import { useLiveQuery } from 'dexie-react-hooks';
import { useMemo, useState } from 'react';
import { db } from '../../db/menu.database';
import { useMenuUIStore } from '../../store/useMenuUIStore';
import '../../styles/brutalist.css';
import type { MenuZone } from '../../types';

interface LinkKitchenModalProps {
  isOpen: boolean;
  onClose: () => void;
  zone: MenuZone;
  businessId: string;
  currentKitchenIds: string[];
  onSave: (selectedKitchenIds: string[]) => Promise<void>;
}

export const LinkKitchenModal = ({ isOpen, onClose, zone, currentKitchenIds, onSave }: LinkKitchenModalProps) => {
  const [selectedKitchenIds, setSelectedKitchenIds] = useState<string[]>(currentKitchenIds);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const menuId = useMenuUIStore((s) => s.selectedMenuId);
  console.log('menuId', menuId);
  // Get all kitchens for business
  const allKitchens = useLiveQuery(() => db.kitchens.where({ menuId: menuId || '' }).toArray(), [menuId]);
  console.log('allKitchens', allKitchens);
  // Filter kitchens by search
  const filteredKitchens = useMemo(() => {
    if (!searchQuery.trim()) return allKitchens || [];
    const q = searchQuery.toLowerCase();
    return allKitchens?.filter((k) => k.name?.toLowerCase().includes(q)) || [];
  }, [allKitchens, searchQuery]);

  const toggleKitchen = (kitchenId: string) => {
    setSelectedKitchenIds((prev) => (prev.includes(kitchenId) ? prev.filter((id) => id !== kitchenId) : [...prev, kitchenId]));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onSave(selectedKitchenIds);
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <PopUp show={isOpen} onClose={onClose} hide>
      <div className="mx-auto flex h-full flex-col bg-white p-4">
        <div className="mb-4">
          <div className="brutal-body" style={{ fontSize: '0.875rem', marginBottom: '8px' }}>
            Zone: <strong>{zone.name}</strong>
          </div>
          <div className="brutal-data" style={{ fontSize: '0.75rem', color: '#666' }}>
            Select kitchens to link to this zone. Dishes can then be routed to these kitchens based on zone.
          </div>
        </div>

        {/* Search */}
        <div className="mb-4">
          <input
            type="text"
            placeholder="SEARCH KITCHENS"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="brutal-input"
            style={{ width: '100%', padding: '10px 14px', fontSize: '0.875rem' }}
          />
        </div>

        {/* Kitchens List */}
        <div className="mb-6 max-h-[400px] overflow-y-auto" style={{ border: '3px solid #000000' }}>
          {filteredKitchens.length === 0 ? (
            <div style={{ padding: '32px', textAlign: 'center' }}>
              <div className="brutal-body" style={{ fontSize: '0.875rem' }}>
                {searchQuery ? 'NO KITCHENS FOUND' : 'NO KITCHENS AVAILABLE'}
              </div>
            </div>
          ) : (
            <div>
              {filteredKitchens.map((kitchen) => {
                const isSelected = selectedKitchenIds.includes(kitchen._id);
                return (
                  <div
                    key={kitchen._id}
                    className="cursor-pointer"
                    style={{
                      padding: '16px',
                      borderBottom: '2px solid #000000',
                      background: isSelected ? '#FFEB3B' : '#FFFFFF',
                    }}
                    onClick={() => toggleKitchen(kitchen._id)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        toggleKitchen(kitchen._id);
                      }
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="brutal-heading" style={{ fontSize: '1rem' }}>
                          {kitchen.name}
                        </div>
                        {kitchen.description && (
                          <div className="brutal-data" style={{ fontSize: '0.75rem', color: '#666', marginTop: '4px' }}>
                            {kitchen.description}
                          </div>
                        )}
                      </div>
                      <div
                        style={{
                          width: '24px',
                          height: '24px',
                          border: '3px solid #000000',
                          background: isSelected ? '#000000' : '#FFFFFF',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0,
                        }}
                      >
                        {isSelected && <span style={{ color: '#FFEB3B', fontSize: '16px', fontWeight: 900 }}>✓</span>}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3">
          <button type="button" onClick={onClose} className="brutal-button" style={{ padding: '10px 20px', fontSize: '0.875rem' }}>
            CANCEL
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={isSaving}
            className="brutal-button-primary"
            style={{
              padding: '10px 20px',
              fontSize: '0.875rem',
              fontWeight: 700,
              opacity: isSaving ? 0.5 : 1,
            }}
          >
            {isSaving ? 'SAVING...' : 'SAVE'}
          </button>
        </div>
      </div>
    </PopUp>
  );
};
