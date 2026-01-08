import { Button } from '@/components/ui/button';
import { useLiveQuery } from 'dexie-react-hooks';
import { Edit } from 'lucide-react';
import { db } from '../../db/menu.database';
import { useMenuUIStore } from '../../store/useMenuUIStore';
import type { MenuKitchen } from '../../types';
// TODO: Kitchen Module Checklist
// - [x] Create `MenuKitchen` type in `types/index.ts`
// - [x] Update `MenuDatabase` schema to include `kitchens` table
// - [x] Update `useMenuUIStore` to include `KITCHEN` tab
// - [x] Create `KitchenPanel` component container
// - [x] Create `KitchenList` component
// - [x] Create `KitchenForm` component
// - [x] Implement local CRUD operations (using Dexie hooks)
// - [x] Implement Sync Logic in `useMenuPush.ts` (handle Kitchen entity)
// - [x] Connect Sync Logic (partially done in useMenuPush)

interface KitchenListProps {
  onEdit: (kitchen: MenuKitchen) => void;
}

export const KitchenList = ({ onEdit }: KitchenListProps) => {
  const menuId = useMenuUIStore((s) => s.selectedMenuId);
  // Assuming we might have a selected menu context, for now filtering primarily by businessId
  // but if we want to show kitchens per menu we need menuId from store/props.

  const kitchens = useLiveQuery(() => db.kitchens.where({ menuId: menuId || '' }).toArray(), [menuId]);

  if (!kitchens || kitchens.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 p-12 text-center">
        <h3 className="brutal-heading text-lg text-gray-400">NO KITCHENS FOUND</h3>
        <p className="brutal-body mt-2 text-gray-500">Create your first kitchen to get started.</p>
      </div>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {kitchens.map((kitchen) => (
        <div key={kitchen._id} className="brutal-card relative flex flex-col justify-between overflow-hidden bg-white p-4">
          <div>
            <h3 className="brutal-heading text-lg">{kitchen.name}</h3>
            {kitchen.description && <p className="brutal-body mt-1 text-sm text-gray-600">{kitchen.description}</p>}
            <div className="mt-3 flex gap-2">
              <span className="brutal-badge text-xs">{`${kitchen.dishIds?.length || 0} Dishes`}</span>
              <span className="brutal-badge text-xs">{`${kitchen.staffIds?.length || 0} Staff`}</span>
            </div>
          </div>
          <div className="mt-4 flex justify-end gap-2">
            <Button size="sm" variant="outline" className="brutal-button h-8 w-8 p-0" onClick={() => onEdit(kitchen)}>
              <Edit className="h-4 w-4" />
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
};
