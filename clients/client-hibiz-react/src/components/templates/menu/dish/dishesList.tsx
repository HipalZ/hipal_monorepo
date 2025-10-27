import MemoFoodType from '@/components/atom/FoodType';
import LoadingSpinner from '@/components/atom/loadingSpinner';
import useBusinessData from '@/components/store/useBusinessData';
import { useDishesStore } from '@/components/store/useDishesStore';
import useMenuPageStore from '@/components/store/useMenuStorage';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { cn } from '@/components/utils/helper';
import { useDishes } from '@/hooks/useDish';
import type { DishType } from '@hi/db-models/src/validators';
import Fuse from 'fuse.js';
import { memo, useCallback, useMemo, useState } from 'react';
import { FaEye, FaEyeSlash, FaListUl, FaThLarge } from 'react-icons/fa';

const MemoListOfDishes = () => {
  const search = useMenuPageStore((s) => s.search);
  const visibilityFilter = useMenuPageStore((s) => s.visibilityFilter);
  const sortOrder = useMenuPageStore((s) => s.sortOrder);
  const setEditDish = useMenuPageStore((s) => s.setEditDish);
  const setDishStep = useMenuPageStore((s) => s.setDishStep);
  const setEditOpenMenu = useMenuPageStore((s) => s.setEditOpenMenu);
  const setEditDishFunction = useMenuPageStore((s) => s.setEditDishFunction);

  const outLetType = useBusinessData((s) => s.outletInfo?.outLetType);
  const { dishes } = useDishesStore((s) => ({ dishes: s.dishes }));
  const { isLoading } = useDishes();

  const [viewMode, setViewMode] = useState<'card' | 'table'>('card');

  const fuse = new Fuse(dishes, {
    keys: ['name', 'description'],
    threshold: 0.1,
  });

  const filteredDishes = useMemo(() => {
    let filtered = dishes?.slice() || [];

    if (search) {
      const fuseResults = fuse.search(search).map((r) => r.item);
      const uniqueById = new Map();
      fuseResults.forEach((item) => uniqueById.set(item._id, item));
      filtered = Array.from(uniqueById.values());
    }

    if (visibilityFilter !== 'all') {
      filtered = filtered.filter((d) => d.visibility === (visibilityFilter === 'visible'));
    }

    switch (sortOrder) {
      case 'asc':
        return filtered.slice().sort((a, b) => a.name.localeCompare(b.name));
      case 'desc':
        return filtered.slice().sort((a, b) => b.name.localeCompare(a.name));
      default:
        return filtered;
    }
  }, [search, fuse, visibilityFilter, sortOrder, dishes]);

  const handleEditDish = useCallback(
    (dish: DishType) => {
      setEditDish(dish);
      setDishStep('DISH_STEP_1');
      setEditOpenMenu(true);
      setEditDishFunction(dish);
    },
    [setEditDish, setDishStep, setEditOpenMenu, setEditDishFunction],
  );

  if (isLoading) return <LoadingSpinner />;

  return (
    <section className="relative mx-4 mt-[7rem] flex flex-col gap-4 lg:mt-[5rem]">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between">
        <h3 className="text-xl font-semibold">
          {outLetType === 'OTHER' ? 'Services' : 'Dishes'} ({filteredDishes?.length})
        </h3>

        <div className="flex items-center gap-2">
          <Button
            variant={viewMode === 'card' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('card')}
            className={cn('flex items-center gap-2', viewMode === 'card' && 'bg-[#8C63FF] text-white')}
          >
            <FaThLarge /> Card View
          </Button>
          <Button
            variant={viewMode === 'table' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('table')}
            className={cn('flex items-center gap-2', viewMode === 'table' && 'bg-[#8C63FF] text-white')}
          >
            <FaListUl /> Table View
          </Button>
        </div>
      </div>

      {/* ---- CARD VIEW ---- */}
      {viewMode === 'card' && (
        <div className="flex flex-wrap justify-center gap-4">
          {filteredDishes.length > 0 ? (
            filteredDishes.map((dish) => (
              <button
                onClick={() => handleEditDish(dish)}
                type="button"
                key={dish._id}
                className="flex h-[4.5rem] w-full items-center justify-between gap-2 rounded-2xl bg-white p-3 shadow transition-all hover:shadow-md md:max-w-[21rem] lg:max-w-[20rem] xl:max-w-[20rem] 2xl:max-w-[21.5rem]"
              >
                <section className="flex items-center gap-2">
                  <MemoFoodType types={dish?.dishTypes} />
                  <h3 title={dish.name} className="text-left text-lg font-semibold">
                    {dish.name}
                  </h3>
                </section>
                <div className="mb-2 flex items-center text-gray-500">
                  {dish.visibility ? <FaEye className="text-green-500" /> : <FaEyeSlash className="text-red-500" />}
                  {!dish.availability && <span className="ml-2 text-red-500">N/A</span>}
                </div>
              </button>
            ))
          ) : (
            <p className="text-gray-500">No dishes found.</p>
          )}
        </div>
      )}

      {/* ---- TABLE VIEW ---- */}
      {viewMode === 'table' && (
        <div className="overflow-x-auto rounded-xl bg-white shadow">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Dish</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Visibility</TableHead>
                <TableHead>Availability</TableHead>
                <TableHead>Avg Prep Time</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredDishes.length > 0 ? (
                filteredDishes.map((dish) => (
                  <TableRow key={dish._id} className="hover:bg-gray-50">
                    <TableCell className="font-medium">{dish.name}</TableCell>
                    <TableCell>
                      <MemoFoodType types={dish.dishTypes} />
                    </TableCell>
                    <TableCell>₹{dish.price}</TableCell>
                    <TableCell>
                      {dish.visibility ? <span className="text-green-600">Visible</span> : <span className="text-red-500">Hidden</span>}
                    </TableCell>
                    <TableCell>
                      {dish.availability ? <span className="text-green-600">Available</span> : <span className="text-red-500">N/A</span>}
                    </TableCell>
                    <TableCell>{dish.avgPrepTime ?? '--'} min</TableCell>
                    <TableCell>
                      <Button variant="outline" size="sm" onClick={() => handleEditDish(dish)} className="text-[#8C63FF] hover:bg-[#8C63FF]/10">
                        Edit
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-gray-500">
                    No dishes found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      )}
    </section>
  );
};

const ListOfDishes = memo(MemoListOfDishes);
export default ListOfDishes;
