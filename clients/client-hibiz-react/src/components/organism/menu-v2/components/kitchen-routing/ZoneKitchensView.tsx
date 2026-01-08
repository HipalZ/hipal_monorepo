/**
 * Zone Kitchens View
 *
 * Screen B: Shows kitchens linked to a zone and allows linking dishes.
 */

import { useLiveQuery } from 'dexie-react-hooks';
import { useState } from 'react';
import toast from 'react-hot-toast';
import { DishZoneKitchenRepository } from '../../db/DishZoneKitchenRepository';
import { db } from '../../db/menu.database';
import { ZonesRepository } from '../../db/ZonesRepository';
import { useMenuUIStore } from '../../store/useMenuUIStore';
import '../../styles/brutalist.css';
import type { MenuZone } from '../../types';
import { KitchenDishLinkModal } from './KitchenDishLinkModal';
import { LinkKitchenModal } from './LinkKitchenModal';

interface ZoneKitchensViewProps {
  zone: MenuZone;
  businessId: string;
  onBack: () => void;
}

export const ZoneKitchensView = ({ zone, businessId, onBack }: ZoneKitchensViewProps) => {
  const [showLinkKitchenModal, setShowLinkKitchenModal] = useState(false);
  const [selectedKitchenId, setSelectedKitchenId] = useState<string | null>(null);
  const menuId = useMenuUIStore((s) => s.selectedMenuId);
  console.log('menuId', menuId);
  // Get zone data (with latest kitchenIds)
  const zoneData = useLiveQuery(async () => {
    return await ZonesRepository.getById(zone._id);
  }, [zone._id]);

  // Get all kitchens for business
  const allKitchens = useLiveQuery(() => db.kitchens.where({ menuId: menuId || '' }).toArray(), [menuId]);
  console.log('allKitchens', allKitchens);

  // Get linked kitchens
  const linkedKitchenIds = zoneData?.kitchenIds || [];
  const linkedKitchens = allKitchens?.filter((k) => linkedKitchenIds.includes(k._id));

  // Get dish count per kitchen for this zone
  const kitchenDishCounts =
    useLiveQuery(async () => {
      const counts = new Map<string, number>();

      for (const kitchenId of linkedKitchenIds) {
        const mappings = await DishZoneKitchenRepository.getByZone(zone._id, businessId);
        const dishCount = mappings.filter((m) => m.kitchenId === kitchenId).length;
        counts.set(kitchenId, dishCount);
      }

      return counts;
    }, [linkedKitchenIds, zone._id, businessId]) || new Map<string, number>();

  const handleLinkKitchens = async (selectedKitchenIds: string[]) => {
    try {
      await ZonesRepository.updateKitchenIds(zone._id, selectedKitchenIds);

      // Create draft op
      await db.draftOps.add({
        businessId,
        entity: 'ZONE_KITCHENS',
        entityId: zone._id,
        opType: 'UPSERT',
        payload: {
          businessId,
          zoneId: zone._id,
          kitchenIds: selectedKitchenIds,
        },
        createdAt: Date.now(),
      });

      toast.success(`Linked ${selectedKitchenIds.length} kitchen(s) to zone`);
      setShowLinkKitchenModal(false);
    } catch (error) {
      console.error('Failed to link kitchens:', error);
      toast.error('Failed to link kitchens');
    }
  };

  return (
    <>
      <div className="brutal-card" style={{ padding: '24px' }}>
        {/* Header */}
        <div className="mb-6 flex items-center justify-between" style={{ borderBottom: '3px solid #000000', paddingBottom: '16px' }}>
          <div>
            <button
              type="button"
              onClick={onBack}
              className="brutal-button"
              style={{ marginBottom: '12px', padding: '8px 16px', fontSize: '0.875rem' }}
            >
              ← BACK TO ZONES
            </button>
            <h2 className="brutal-heading" style={{ fontSize: '1.5rem', marginBottom: '8px' }}>
              {zone.name}
            </h2>
            <div className="brutal-data" style={{ fontSize: '0.875rem' }}>
              Manage kitchens and dish routing for this zone
            </div>
          </div>
          <button
            type="button"
            onClick={() => setShowLinkKitchenModal(true)}
            className="brutal-button-primary"
            style={{ padding: '12px 24px', fontSize: '0.875rem', fontWeight: 700 }}
          >
            + LINK KITCHEN
          </button>
        </div>

        {/* Linked Kitchens */}
        {linkedKitchens && linkedKitchens?.length === 0 ? (
          <div className="brutal-card" style={{ padding: '48px', textAlign: 'center', border: '3px solid #000000' }}>
            <div className="brutal-body" style={{ fontSize: '1rem', marginBottom: '16px' }}>
              NO KITCHENS LINKED
            </div>
            <div className="brutal-data" style={{ fontSize: '0.875rem', color: '#666', marginBottom: '24px' }}>
              Link kitchens to this zone to start routing dishes.
            </div>
            <button
              type="button"
              onClick={() => setShowLinkKitchenModal(true)}
              className="brutal-button-primary"
              style={{ padding: '12px 24px', fontSize: '0.875rem', fontWeight: 700 }}
            >
              LINK KITCHEN
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {linkedKitchens?.map((kitchen) => {
              const dishCount = kitchenDishCounts.get(kitchen._id) || 0;
              return (
                <div
                  key={kitchen._id}
                  className="brutal-card"
                  style={{
                    border: '3px solid #000000',
                    padding: '20px',
                  }}
                >
                  <div className="brutal-heading" style={{ fontSize: '1.125rem', marginBottom: '12px' }}>
                    {kitchen.name}
                  </div>
                  {kitchen.description && (
                    <div className="brutal-data" style={{ fontSize: '0.875rem', color: '#666', marginBottom: '12px' }}>
                      {kitchen.description}
                    </div>
                  )}
                  <div className="mb-4 flex items-center gap-2">
                    <span className="brutal-badge" style={{ fontSize: '0.75rem', padding: '4px 8px' }}>
                      {dishCount} DISH{dishCount !== 1 ? 'ES' : ''} ROUTED
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSelectedKitchenId(kitchen._id)}
                    className="brutal-button-primary"
                    style={{ width: '100%', padding: '10px', fontSize: '0.875rem', fontWeight: 700 }}
                  >
                    MANAGE DISHES
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Link Kitchen Modal */}
      {showLinkKitchenModal && (
        <LinkKitchenModal
          isOpen={showLinkKitchenModal}
          onClose={() => setShowLinkKitchenModal(false)}
          zone={zone}
          businessId={businessId}
          currentKitchenIds={linkedKitchenIds}
          onSave={handleLinkKitchens}
        />
      )}

      {/* Kitchen Dish Link Modal */}
      {selectedKitchenId && linkedKitchens && (
        <KitchenDishLinkModal
          isOpen={!!selectedKitchenId}
          onClose={() => setSelectedKitchenId(null)}
          zone={zone}
          kitchen={linkedKitchens?.find((k) => k._id === selectedKitchenId)!}
          businessId={businessId}
        />
      )}
    </>
  );
};
