import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useLiveQuery } from 'dexie-react-hooks';
import { ChevronLeft } from 'lucide-react';
import { db } from '../db/menu.database';
import { useMenuUIStore } from '../store/useMenuUIStore';

export const MenuSidebar = () => {
  const { selectedSidebarItem, setSelectedSidebarItem, isSidebarOpen, toggleSidebar } = useMenuUIStore();

  const menus = useLiveQuery(() => db.menus.toArray(), []);

  if (!isSidebarOpen) return null;

  return (
    <aside className="w-64 border-r border-gray-200 bg-white">
      <div className="flex h-full flex-col">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-200 px-4 py-4">
          <h2 className="font-semibold text-gray-900">Menu Layouts</h2>
          <Button variant="ghost" size="icon" onClick={toggleSidebar} className="h-8 w-8">
            <ChevronLeft className="h-4 w-4" />
          </Button>
        </div>

        {/* Menu List */}
        <div className="flex-1 overflow-y-auto py-2">
          <Button
            variant="ghost"
            onClick={() => setSelectedSidebarItem('ALL')}
            className={cn(
              'w-full justify-start rounded-none px-4 py-3 font-medium',
              selectedSidebarItem === 'ALL' ? 'border-l-4 border-purple-600 bg-purple-50 text-purple-700' : 'text-gray-700 hover:bg-gray-50',
            )}
          >
            All (Catalog)
          </Button>

          <div className="mt-2 space-y-1">
            {menus?.map((menu) => (
              <Button
                key={menu._id}
                variant="ghost"
                onClick={() => setSelectedSidebarItem(menu._id)}
                className={cn(
                  'w-full justify-start rounded-none px-4 py-3 text-left',
                  selectedSidebarItem === menu._id ? 'border-l-4 border-purple-600 bg-purple-50 text-purple-700' : 'text-gray-700 hover:bg-gray-50',
                )}
              >
                <div className="flex-1 overflow-hidden">
                  <div className="truncate font-medium">{menu.name}</div>
                  {menu.zoneIds && menu.zoneIds.length > 0 && <div className="text-xs text-gray-500">{menu.zoneIds.length} zone(s)</div>}
                </div>
              </Button>
            ))}
          </div>
        </div>
      </div>
    </aside>
  );
};
