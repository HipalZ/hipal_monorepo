import { useStaffPermissionStore } from '@/components/store/usePermissions';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import type { DishType } from '@hi/db-models/src/validators';
import { motion } from 'framer-motion';
import { memo } from 'react';
import { gradientForFood, normalizeFoodTypes } from '../../utils/helpers';
import FoodType from '../dishType';
import DishQuantityButton from './dishQuantityBtn';

interface CompactDishGridProps {
  selectedCategory: {
    dishIds: DishType[];
  };
}

const MemoCompactDishGrid = ({ selectedCategory }: CompactDishGridProps) => {
  const hasPermission = useStaffPermissionStore((s) => s.hasPermission);

  // permission for add button
  const isPlaceOrderAllowed = hasPermission('place_order');

  return (
    <div className="grid grid-cols-1 gap-3 pb-[7rem] md:grid-cols-2 2xl:grid-cols-3">
      {selectedCategory?.dishIds?.map((dish: DishType, index: number) => {
        const isUnavailable = !dish.availability;
        const isHidden = !dish.visibility;
        const hasKitchen = Boolean((dish as any)?.kitchenId);

        // kitchenId must exist to allow add
        const hasKitchen = Boolean((dish as any)?.kitchenId);

        const types = normalizeFoodTypes(dish.dishTypes);

        let overlayLabel: string | null = null;
        if (isHidden) overlayLabel = 'Not Visible';
        else if (isUnavailable) overlayLabel = 'Not Available';

        const showAddButton = !overlayLabel && hasKitchen && isPlaceOrderAllowed;

        return (
          <motion.div
            key={dish?._id?.toString()}
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: index * 0.05 }}
            whileHover={{ scale: 1.02 }}
          >
            <Card
              className={cn(
                'relative h-full overflow-hidden border transition-all duration-200',
                overlayLabel && 'border-muted-foreground/20',
                gradientForFood(types),
              )}
            >
              <CardContent className="relative grid h-full grid-rows-[auto_1fr_auto_auto] gap-x-2 p-3">
                {/* HEADER */}
                <div className="flex items-start justify-between gap-2">
                  <h3 className={cn('text-sm font-semibold', overlayLabel && 'text-muted-foreground')}>{dish.name}</h3>

                  {/* KITCHEN ERROR */}
                  {!hasKitchen && !overlayLabel && (
                    <span className="rounded bg-red-600/90 px-2 py-[2px] text-[10px] font-semibold text-white">Kitchen not linked</span>
                  )}
                </div>

                {/* PRICE + FOOD TYPE */}
                <div className="mt-5 grid grid-cols-[auto_1fr] items-center gap-2">
                  {dish.dishTypes && (
                    <div>
                      <FoodType types={dish.dishTypes} />
                    </div>
                  )}
                  <span className="text-sm font-semibold">₹{dish.portions?.length ? dish.portions[0].price : dish.price}</span>
                </div>

                {/* ADD BUTTON SECTION */}
                <div className="-mt-7 flex items-center justify-end">
                  {showAddButton ? (
                    <DishQuantityButton dishData={dish} />
                  ) : (
                    !overlayLabel && !isPlaceOrderAllowed && <span className="text-xs font-semibold text-red-600">You don't have permission</span>
                  )}
                </div>

                {/* Options bottom right */}
                {(dish.addOnIds?.length || dish.portions?.length) > 0 && hasKitchen && (
                  <span className="absolute bottom-1.5 right-10 mt-1 h-4 bg-white text-xs text-[#000000] opacity-50">options</span>
                )}

                {/* AVAILABILITY TAG */}
                {overlayLabel && (
                  <div className="absolute -right-3 -top-1 flex flex-col items-center justify-center px-2 py-1">
                    <span className="rounded-none bg-red-600/80 px-1 py-[2px] text-xs font-semibold text-white shadow-md">{overlayLabel}</span>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        );
      })}
    </div>
  );
};

const CompactDishGrid = memo(MemoCompactDishGrid);
export default CompactDishGrid;
