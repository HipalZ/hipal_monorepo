import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import type { DishType } from '@hi/db-models/src/validators';
import { useLiveQuery } from 'dexie-react-hooks';
import { useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { DraftOpsRepository } from '../db/DraftOpsRepository';
import { db } from '../db/menu.database';
import { useMenuUIStore } from '../store/useMenuUIStore';

interface DishRowProps {
  dish: DishType;
  isAllView: boolean;
  businessId: string;
  onUpdate: (dishId: string, field: keyof DishType, value: any) => void;
}

const DishRow = ({ dish, isAllView, businessId, onUpdate }: DishRowProps) => {
  const [isEditing, setIsEditing] = useState<string | null>(null);

  const displayPrice = dish.price;
  const displayVisibility = dish.visibility;

  const handlePriceChange = async (e: React.FocusEvent<HTMLInputElement>) => {
    const newPrice = Number.parseFloat(e.target.value);
    if (!Number.isNaN(newPrice) && newPrice !== displayPrice) {
      // In both "All" view and specific menu view, we update the dish directly
      // since dishes are now menu-specific entities.
      await DraftOpsRepository.updateDish(dish._id, businessId, { price: newPrice });
      onUpdate(dish._id, 'price', newPrice);
    }
    setIsEditing(null);
  };

  const handleAvailabilityToggle = async (checked: boolean) => {
    await DraftOpsRepository.updateDish(dish._id, businessId, { availability: checked });
    onUpdate(dish._id, 'availability', checked);
  };

  const handleVisibilityToggle = async () => {
    const newVisibility = !displayVisibility;
    await DraftOpsRepository.updateDish(dish._id, businessId, { visibility: newVisibility });
    onUpdate(dish._id, 'visibility', newVisibility);
  };

  return (
    <div className="grid grid-cols-12 gap-4 border-b border-gray-100 px-4 py-3 hover:bg-gray-50">
      <div className="col-span-4">
        <div className="font-medium text-gray-900">{dish.name}</div>
        <div className="text-xs text-gray-400">{isAllView && dish.menuId ? `Menu: ${dish.menuId.substring(0, 8)}...` : ''}</div>
      </div>

      <div className="col-span-2">
        {isEditing === 'price' ? (
          <Input type="number" defaultValue={displayPrice} onBlur={handlePriceChange} autoFocus className="h-8 w-24" />
        ) : (
          <div onClick={() => setIsEditing('price')} className="flex cursor-pointer items-center gap-2 rounded px-2 py-1 hover:bg-gray-100">
            ₹{displayPrice}
          </div>
        )}
      </div>

      <div className="col-span-2 flex items-center gap-2">
        <Checkbox checked={dish.availability ?? true} onCheckedChange={handleAvailabilityToggle} />
        <span className="text-sm text-gray-700">{dish.availability ? 'Available' : 'Unavailable'}</span>
      </div>

      <div className="col-span-2 cursor-pointer" onClick={handleVisibilityToggle}>
        <Badge variant={displayVisibility ? 'default' : 'secondary'}>{displayVisibility ? 'Visible' : 'Hidden'}</Badge>
      </div>

      <div className="col-span-2">
        {dish.portions && dish.portions.length > 0 && <span className="text-sm text-gray-500">{dish.portions.length} portions</span>}
      </div>
    </div>
  );
};

export const VirtualizedDishTable = () => {
  const { businessId } = useParams<{ businessId: string }>();
  const selectedSidebarItem = useMenuUIStore((s) => s.selectedSidebarItem);
  const isAllView = selectedSidebarItem === 'ALL';

  // Fetch Dishes
  const allDishes = useLiveQuery(() => db.dishes.toArray(), []);

  // Filter dishes by selected menu if not in ALL view
  const dishes = useMemo(() => {
    if (!allDishes) return [];
    if (isAllView) return allDishes;
    // Filter dishes belonging to the selected menu
    return allDishes.filter((d) => d.menuId === selectedSidebarItem);
  }, [allDishes, isAllView, selectedSidebarItem]);

  const handleUpdate = (dishId: string, field: keyof DishType, value: any) => {
    console.log(`Updated dish ${dishId}: ${String(field)} = ${value}`);
  };

  if (!allDishes || allDishes.length === 0) {
    return <div className="flex h-64 items-center justify-center text-gray-500">No dishes found in catalog</div>;
  }

  return (
    <div className="rounded-lg border border-gray-200 bg-white">
      <div className="sticky top-0 z-10 grid grid-cols-12 gap-4 border-b border-gray-200 bg-gray-50 bg-opacity-100 px-4 py-3 font-semibold text-gray-700">
        <div className="col-span-4">Dish Name</div>
        <div className="col-span-2">Price</div>
        <div className="col-span-2">Availability</div>
        <div className="col-span-2">Visibility</div>
        <div className="col-span-2">Portions</div>
      </div>

      <div className="max-h-[600px] overflow-y-auto">
        {dishes.length === 0 ? (
          <div className="p-8 text-center text-gray-500">No dishes mapped to this menu</div>
        ) : (
          dishes.map((dish) => <DishRow key={dish._id} dish={dish} isAllView={isAllView} businessId={businessId || ''} onUpdate={handleUpdate} />)
        )}
      </div>

      <div className="border-t border-gray-200 bg-gray-50 px-4 py-2 text-sm text-gray-600">
        Showing {dishes.length} dishes in {isAllView ? 'Catalog' : 'Menu'}
      </div>
    </div>
  );
};
