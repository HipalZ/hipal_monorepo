import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { Dish } from "@/lib/menu/types";
import { dishNodeId } from "@/lib/utils";

interface SortableDishProps {
  dish: Dish;
  disabled?: boolean;
}

export function SortableDish({ dish, disabled }: SortableDishProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: dishNodeId(dish.id),
    disabled,
  });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.8 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex items-center justify-between rounded-xl border p-3 bg-white shadow-sm ${
        disabled ? "cursor-default" : "cursor-move"
      }`}
      {...attributes}
      {...listeners}
    >
      <div className="flex flex-col">
        <span className="font-medium text-gray-900">{dish.dishName}</span>
        <span className="text-sm text-gray-500 capitalize">
          {dish.dishType.replaceAll("non", "non-")}
        </span>
      </div>
      <div className="text-right font-semibold text-gray-800">
        ₹ {dish.price.toFixed(2)}
      </div>
    </div>
  );
}
