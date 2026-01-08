/**
 * Kitchen Routing Panel
 *
 * Main component for managing Zone → Kitchen → Dish routing.
 * Screen A: Zones List
 */

import useBusinessData from '@/components/store/useBusinessData';
import { useLiveQuery } from 'dexie-react-hooks';
import { useMemo, useState } from 'react';
import { db } from '../db/menu.database';
import { ZonesRepository } from '../db/ZonesRepository';
import '../styles/brutalist.css';
import { ZoneKitchensView } from './kitchen-routing/ZoneKitchensView';

export const KitchenRoutingPanel = () => {
  const businessId = useBusinessData((s) => s.outletInfo?.businessId);
  const [selectedZoneId, setSelectedZoneId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Get draft ops count for zones
  const draftOpsCount =
    useLiveQuery(async () => {
      if (!businessId) return 0;
      const ops = await db.draftOps
        .where('businessId')
        .equals(businessId)
        .filter((op) => op.entity === 'ZONE_KITCHENS' || op.entity === 'DISH_ZONE_KITCHEN')
        .toArray();
      return ops.length;
    }, [businessId]) || 0;

  // Get all zones for this business
  const zones =
    useLiveQuery(async () => {
      if (!businessId) return [];
      return await ZonesRepository.getAll(businessId);
    }, [businessId]) || [];

  // Get kitchen count per zone
  const zoneKitchenCounts =
    useLiveQuery(async () => {
      if (!businessId) return new Map<string, number>();
      const counts = new Map<string, number>();

      for (const zone of zones) {
        const zoneData = await db.zones.get(zone._id);
        counts.set(zone._id, zoneData?.kitchenIds?.length || 0);
      }

      return counts;
    }, [zones, businessId]) || new Map<string, number>();

  // Filter zones by search
  const filteredZones = useMemo(() => {
    if (!searchQuery.trim()) return zones;
    const q = searchQuery.toLowerCase();
    return zones.filter((z) => z.name?.toLowerCase().includes(q));
  }, [zones, searchQuery]);

  // If zone selected, show zone detail view
  if (selectedZoneId) {
    const selectedZone = zones.find((z) => z._id === selectedZoneId);
    if (!selectedZone) {
      setSelectedZoneId(null);
      return null;
    }

    return <ZoneKitchensView zone={selectedZone} businessId={businessId || ''} onBack={() => setSelectedZoneId(null)} />;
  }

  // Main zones list view
  return (
    <div className="brutal-card" style={{ padding: '24px' }}>
      {/* Header */}
      <div className="mb-6 flex items-center justify-between" style={{ borderBottom: '3px solid #000000', paddingBottom: '16px' }}>
        <div>
          <h2 className="brutal-heading" style={{ fontSize: '1.5rem', marginBottom: '8px' }}>
            KITCHEN ROUTING
          </h2>
          <div className="brutal-data" style={{ fontSize: '0.875rem' }}>
            Link kitchens to zones and route dishes to kitchens by zone
          </div>
        </div>
        {draftOpsCount > 0 && (
          <div className="brutal-badge-yellow" style={{ padding: '8px 16px', fontSize: '0.875rem' }}>
            {draftOpsCount} PENDING CHANGES
          </div>
        )}
      </div>

      {/* Search */}
      <div className="mb-4">
        <input
          type="text"
          placeholder="SEARCH ZONES"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="brutal-input"
          style={{ width: '100%', maxWidth: '400px', padding: '12px 16px', fontSize: '0.875rem' }}
        />
      </div>

      {/* Zones List */}
      {filteredZones.length === 0 ? (
        <div className="brutal-card" style={{ padding: '48px', textAlign: 'center', border: '3px solid #000000' }}>
          <div className="brutal-body" style={{ fontSize: '1rem', marginBottom: '16px' }}>
            {searchQuery ? 'NO ZONES FOUND' : 'NO ZONES AVAILABLE'}
          </div>
          {!searchQuery && (
            <div className="brutal-data" style={{ fontSize: '0.875rem', color: '#666' }}>
              Zones will appear here once they are created for this business.
            </div>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredZones.map((zone) => {
            const kitchenCount = zoneKitchenCounts.get(zone._id) || 0;
            return (
              <div
                key={zone._id}
                className="brutal-card cursor-pointer"
                style={{
                  border: '3px solid #000000',
                  padding: '20px',
                  transition: 'all 0.2s',
                }}
                onClick={() => setSelectedZoneId(zone._id)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    setSelectedZoneId(zone._id);
                  }
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = '#FFEB3B';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = '#FFFFFF';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                <div className="brutal-heading" style={{ fontSize: '1.125rem', marginBottom: '12px' }}>
                  {zone.name}
                </div>
                <div className="mb-2 flex items-center gap-2">
                  <span className="brutal-badge" style={{ fontSize: '0.75rem', padding: '4px 8px' }}>
                    {kitchenCount} KITCHEN{kitchenCount !== 1 ? 'S' : ''} LINKED
                  </span>
                  {!zone.visibility && (
                    <span className="brutal-badge" style={{ fontSize: '0.75rem', padding: '4px 8px', background: '#999' }}>
                      HIDDEN
                    </span>
                  )}
                </div>
                <div className="brutal-data" style={{ fontSize: '0.875rem', color: '#666', marginTop: '8px' }}>
                  Click to manage kitchens
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
