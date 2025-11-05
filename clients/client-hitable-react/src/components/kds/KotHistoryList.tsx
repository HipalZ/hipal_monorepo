// src/components/kds/KotHistoryList.tsx
import { useMemo } from 'react';
import { useKdsStore } from '../store/useKdsStore';
import type { KotOrderDoc } from '../types/kds';
import { KotCard } from './KotCard';

const waiterLabel = (o: KotOrderDoc) => ((o as any).acceptedByName || (o as any).acceptedBy || o.name || '').toString().trim();

export const KotHistoryList = ({ orders, staffId }: { orders: KotOrderDoc[]; staffId?: string }) => {
  const { selectedDishNames, waiterFilter, tableFilter } = useKdsStore();

  const filtered = useMemo(() => {
    let out = orders;

    if (selectedDishNames.size > 0) {
      out = out.filter((o) => o.cart.some((ci) => selectedDishNames.has(ci.dish?.name ?? '')));
    }
    if (waiterFilter.size > 0) {
      out = out.filter((o) => waiterFilter.has(waiterLabel(o)));
    }
    if (tableFilter.size > 0) {
      out = out.filter((o) => tableFilter.has(o.tableName ?? ''));
    }
    return out;
  }, [orders, selectedDishNames, waiterFilter, tableFilter]);

  if (!filtered.length) return <div className="text-sm text-zinc-400">No completed KOTs found.</div>;

  return (
    <div className="grid grid-cols-1 gap-3 md:grid-cols-2 2xl:grid-cols-3">
      {filtered.map((o) => (
        <KotCard key={o._id} order={o} staffId={staffId} />
      ))}
    </div>
  );
};
