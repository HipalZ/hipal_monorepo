// src/components/kds/KotList.tsx
import React, { useMemo } from 'react';
import { useKdsStore } from '../store/useKdsStore';
import type { KotOrderDoc } from '../types/kds';
import { KotCard } from './KotCard';

const waiterLabel = (o: KotOrderDoc) => ((o as any).acceptedByName || (o as any).acceptedBy || o.name || '').toString().trim();

export const KotList = ({ orders, staffId }: { orders: KotOrderDoc[]; staffId?: string }) => {
  const { selectedDishNames, onlyActive, waiterFilter, tableFilter } = useKdsStore();

  const filtered = useMemo(() => {
    let out = orders;

    // Dish filter (any dish match)
    if (selectedDishNames.size > 0) {
      out = out.filter((o) => o.cart.some((ci) => selectedDishNames.has(ci.dish?.name ?? '')));
    }

    // Waiter filter (if any selected)
    if (waiterFilter.size > 0) {
      out = out.filter((o) => waiterFilter.has(waiterLabel(o)));
    }

    // Table filter (if any selected)
    if (tableFilter.size > 0) {
      out = out.filter((o) => tableFilter.has(o.tableName ?? ''));
    }

    // Only active (Open tab UX)
    if (onlyActive) {
      out = out.filter((o) => o.kotStatus !== 'COMPLETED');
    }

    return out;
  }, [orders, selectedDishNames, onlyActive, waiterFilter, tableFilter]);

  if (!filtered.length) return <div className="py-6 text-sm text-zinc-500">No KOTs found.</div>;

  return (
    <div className="grid grid-cols-1 items-start gap-3 pb-[5rem] md:grid-cols-2 2xl:grid-cols-3">
      {filtered.map((o) => (
        <KotCard key={o._id} order={o} staffId={staffId} />
      ))}
    </div>
  );
};
