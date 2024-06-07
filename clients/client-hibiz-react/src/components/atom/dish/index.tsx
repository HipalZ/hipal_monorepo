import { Dish } from '@/components/types/businessData';
import React, { memo, useState } from 'react';
import { toast } from 'react-toastify';

type DishComponentProps = {
  dishes: Dish[];
  selectedDishes: Dish[];
  toggleDishSelection: (dish: Dish) => void;
  onClose: () => void;
  resetAndCloseDishModal: () => void;
};

const DishComponent: React.FC<DishComponentProps> = ({ dishes, selectedDishes, toggleDishSelection, onClose, resetAndCloseDishModal }) => {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredDishes = dishes.filter((dish) => dish.name.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <>
      <div className="relative max-h-[80vh] overflow-y-auto rounded-2xl bg-[#f5f5f5] px-4 pb-[8rem] shadow">
        <section className="sticky top-0 z-20 bg-[#f5f5f5] pb-2 pt-4">
          <h3 className="pb-2 text-lg font-bold">Add Dishes</h3>
          <input
            type="search"
            placeholder="Search for dishes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="mb-4 w-full rounded-md border border-gray-300 p-2"
          />
        </section>
        <div className="space-y-4 ">
          {filteredDishes?.map((dish) => (
            <div
              onClick={() => toggleDishSelection(dish)}
              key={dish.id}
              className="flex items-center rounded-md border border-[#cacaca] bg-white p-4"
            >
              <input
                type="checkbox"
                id={`checkbox-${dish.id}`}
                checked={selectedDishes.some((selectedDish) => selectedDish.id === dish.id)}
                className="form-checkbox h-4 w-4 focus:outline-none focus:ring-0"
              />
              <span className="ml-2 text-sm font-[550]">{dish.name}</span>
            </div>
          ))}
        </div>
      </div>
      <div className="sticky bottom-5 mx-4 my-6 flex">
        <button
          type="button"
          onClick={resetAndCloseDishModal}
          className="on_active_bounce border-1 mr-2 w-full rounded-md border border-[#2B354D] bg-white py-2.5 text-[#2B354D]"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={() => {
            onClose();
            toast.success('Dishes added sucessfully');
          }}
          className="on_active_bounce w-full rounded-md bg-[#2B354D] py-2.5 text-white"
        >
          Save
        </button>
      </div>
    </>
  );
};

export default memo(DishComponent);
