import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { useMenuUIStore } from '../store/useMenuUIStore';
import { VirtualizedDishTable } from './VirtualizedDishTable';

export const DishesView = () => {
  const selectedSidebarItem = useMenuUIStore((s) => s.selectedSidebarItem);
  const isAllView = selectedSidebarItem === 'ALL';

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{isAllView ? 'All Dishes (Catalog)' : 'Menu-Specific Dishes'}</h1>
          <p className="mt-1 text-sm text-gray-500">
            {isAllView
              ? 'Edit base catalog prices and availability. Changes apply to all menus.'
              : 'Create menu-specific overrides for prices and portions.'}
          </p>
        </div>

        <Button className="gap-2 bg-purple-600 hover:bg-purple-700">
          <Plus className="h-4 w-4" />
          Add Dish
        </Button>
      </div>

      <VirtualizedDishTable />
    </div>
  );
};
