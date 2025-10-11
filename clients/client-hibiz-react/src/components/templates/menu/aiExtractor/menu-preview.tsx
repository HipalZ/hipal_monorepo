import { SortableContext, rectSortingStrategy } from "@dnd-kit/sortable";
import type { Category } from "@/lib/menu/types";
import { dishNodeId, subNodeId } from "@/lib/utils";
import { SortableDish } from "./sortable-dish";
import { DroppableSubcategory } from "./droppable-subcategory";

interface MenuPreviewProps {
  categories: Category[];
  isEditing: boolean;
}

export function MenuPreview({ categories, isEditing }: MenuPreviewProps) {
  if (categories.length === 0) {
    return (
      <div className="text-center text-gray-500">No extracted menu yet.</div>
    );
  }

  return (
    <div className="space-y-8 overflow-auto max-h-[40dvh] pr-2">
      {categories.map((cat) => (
        <div key={cat.id} className="bg-gray-50 rounded-2xl border p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-gray-900">{cat.name}</h2>
            <span className="text-xs px-2 py-1 rounded-full bg-gray-200 text-gray-700">
              {cat.subcategories.length} subcategor
              {cat.subcategories.length === 1 ? "y" : "ies"}
            </span>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {cat.subcategories.map((sub) => (
              <div
                key={sub.id}
                className="rounded-xl bg-white border shadow-sm"
              >
                <div className="px-4 py-3 border-b flex items-center justify-between">
                  <h3 className="font-semibold text-gray-800">{sub.name}</h3>
                  <span className="text-xs text-gray-500">
                    {sub.dishes.length} item
                    {sub.dishes.length === 1 ? "" : "s"}
                  </span>
                </div>

                <div
                  className="p-4 space-y-3 min-h-[64px]"
                  id={subNodeId(sub.id)}
                >
                  <DroppableSubcategory id={sub.id}>
                    <SortableContext
                      items={sub.dishes.map((d) => dishNodeId(d.id))}
                      strategy={rectSortingStrategy}
                    >
                      {sub.dishes.map((d) => (
                        <SortableDish
                          key={d.id}
                          dish={d}
                          disabled={!isEditing}
                        />
                      ))}
                    </SortableContext>
                  </DroppableSubcategory>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
