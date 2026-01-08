import { Badge } from '@/components/ui/badge';
import { useLiveQuery } from 'dexie-react-hooks';
import { useMemo } from 'react';
import { db } from '../db/menu.database';
import { useMenuUIStore } from '../store/useMenuUIStore';

export const CategoriesView = () => {
  const selectedSidebarItem = useMenuUIStore((s) => s.selectedSidebarItem);
  const isAllView = selectedSidebarItem === 'ALL';

  const allCategories = useLiveQuery(() => db.categories.toArray(), []);

  const categories = useMemo(() => {
    if (!allCategories) return [];
    if (isAllView) {
      // "Clubbed" View: Group by nameKey
      const map = new Map<string, any>();
      allCategories.forEach((cat) => {
        const key = cat.name.trim().toLowerCase();
        if (!map.has(key)) {
          map.set(key, { ...cat, count: 0, menus: [] });
        }
        const grouped = map.get(key);
        grouped.count++;
        if (cat.menuId) grouped.menus.push(cat.menuId);
      });
      return Array.from(map.values());
    }
    return allCategories.filter((c) => c.menuId === selectedSidebarItem);
  }, [allCategories, isAllView, selectedSidebarItem]);

  if (!allCategories) {
    return <div className="p-8 text-center text-gray-500">Loading categories...</div>;
  }

  if (categories.length === 0) {
    return <div className="p-8 text-center text-gray-500">No categories found in this view</div>;
  }

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">{isAllView ? 'All Categories (Clubbed)' : 'Menu Categories'}</h1>
        <Badge variant="secondary">{categories.length} total</Badge>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {categories.map((cat) => (
          <div key={cat._id} className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm transition-colors hover:border-purple-300">
            <div className="mb-2 flex items-center justify-between">
              <h3 className="truncate pr-2 font-semibold text-gray-900">{cat.name}</h3>
              {isAllView ? (
                <Badge variant="purple" className="border-none bg-purple-100 text-purple-700 hover:bg-purple-200">
                  {cat.count} Menus
                </Badge>
              ) : (
                <Badge variant="outline">{cat.hierarchy || 'General'}</Badge>
              )}
            </div>

            <p className="line-clamp-2 h-8 text-xs text-gray-500">{cat.description || 'No description provided.'}</p>

            {isAllView && cat.menus && (
              <div className="mt-3 flex flex-wrap gap-1">
                {cat.menus.slice(0, 3).map((mId: string, i: number) => (
                  <span key={i} className="rounded bg-gray-100 px-1.5 py-0.5 text-[10px] text-gray-600">
                    {mId.substring(0, 6)}
                  </span>
                ))}
                {cat.menus.length > 3 && <span className="text-[10px] text-gray-400">+{cat.menus.length - 3} more</span>}
              </div>
            )}

            <div className="mt-4 flex items-center justify-between border-t pt-2 text-[10px] text-gray-400">
              <span>{cat.dishIds?.length || 0} Dishes</span>
              <span>{isAllView ? 'Unified Edit' : `ID: ${cat._id.substring(0, 8)}`}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
