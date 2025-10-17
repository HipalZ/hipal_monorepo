// import { SortableContext, rectSortingStrategy } from "@dnd-kit/sortable";
// import type { Category } from "@/lib/menu/types";
// import { dishNodeId, subNodeId } from "@/lib/utils";
// import { SortableDish } from "./sortable-dish";
// import { DroppableSubcategory } from "./droppable-subcategory";

// interface MenuPreviewProps {
//   categories: Category[];
//   isEditing: boolean;
// }

// export function MenuPreview({ categories, isEditing }: MenuPreviewProps) {
//   if (categories.length === 0) {
//     return (
//       <div className="text-center text-gray-500">No extracted menu yet.</div>
//     );
//   }

//   return (
//     <div className="space-y-8 overflow-auto max-h-[40dvh] pr-2">
//       {categories.map((cat) => (
//         <div key={cat.id} className="bg-gray-50 rounded-2xl border p-6">
//           <div className="flex items-center justify-between mb-4">
//             <h2 className="text-2xl font-bold text-gray-900">{cat.name}</h2>
//             <span className="text-xs px-2 py-1 rounded-full bg-gray-200 text-gray-700">
//               {cat.subcategories.length} subcategor
//               {cat.subcategories.length === 1 ? "y" : "ies"}
//             </span>
//           </div>

//           <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
//             {cat.subcategories.map((sub) => (
//               <div
//                 key={sub.id}
//                 className="rounded-xl bg-white border shadow-sm"
//               >
//                 <div className="px-4 py-3 border-b flex items-center justify-between">
//                   <h3 className="font-semibold text-gray-800">{sub.name}</h3>
//                   <span className="text-xs text-gray-500">
//                     {sub.dishes.length} item
//                     {sub.dishes.length === 1 ? "" : "s"}
//                   </span>
//                 </div>

//                 <div
//                   className="p-4 space-y-3 min-h-[64px]"
//                   id={subNodeId(sub.id)}
//                 >
//                   <DroppableSubcategory id={sub.id}>
//                     <SortableContext
//                       items={sub.dishes.map((d) => dishNodeId(d.id))}
//                       strategy={rectSortingStrategy}
//                     >
//                       {sub.dishes.map((d) => (
//                         <SortableDish
//                           key={d.id}
//                           dish={d}
//                           disabled={!isEditing}
//                         />
//                       ))}
//                     </SortableContext>
//                   </DroppableSubcategory>
//                 </div>
//               </div>
//             ))}
//           </div>
//         </div>
//       ))}
//     </div>
//   );
// }
"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Edit2, FolderEdit } from "lucide-react";
import type { Category } from "@/lib/menu/types";
import { cn } from "@/lib/utils";
import { EditMenuDialog } from "./edit-menu-dialog";
import { EditCategoryDialog } from "./edit-category-dialog";

interface MenuPreviewProps {
  categories: Category[];
  isEditing: boolean;
}

const dishTypeColors = {
  veg: "bg-green-100 text-green-700 border-green-300",
  nonveg: "bg-red-100 text-red-700 border-red-300",
  egg: "bg-yellow-100 text-yellow-700 border-yellow-300",
  vegan: "bg-emerald-100 text-emerald-700 border-emerald-300",
};

const dishTypeIcons = {
  veg: "🥬",
  nonveg: "🍗",
  egg: "🥚",
  vegan: "🌱",
};

export function MenuPreview({ categories, isEditing }: MenuPreviewProps) {
  const [editingDish, setEditingDish] = useState<{
    dish: any;
    categoryId: string;
    subcategoryId: string;
  } | null>(null);
  const [editingCategory, setEditingCategory] = useState<{
    id: string;
    name: string;
  } | null>(null);

  if (categories.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <p className="text-lg">No extracted menu yet.</p>
        <p className="text-sm mt-2">
          Upload files and click "Extract Menu" to get started.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-8 overflow-auto max-h-[60vh] pr-2">
        {categories.map((cat, catIndex) => (
          <motion.div
            key={cat.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: catIndex * 0.1 }}
            className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl border-2 border-gray-200 p-6 shadow-sm"
          >
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <h2 className="text-2xl font-bold text-gray-900">{cat.name}</h2>
                {isEditing && (
                  <button
                    onClick={() =>
                      setEditingCategory({ id: cat.id, name: cat.name })
                    }
                    className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
                  >
                    <FolderEdit className="w-4 h-4 text-gray-600" />
                  </button>
                )}
              </div>
              <span className="text-xs px-3 py-1 rounded-full bg-blue-100 text-blue-700 font-medium border border-blue-200">
                {cat.subcategories.length} subcategor
                {cat.subcategories.length === 1 ? "y" : "ies"}
              </span>
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {cat.subcategories.map((sub, subIndex) => (
                <motion.div
                  key={sub.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: catIndex * 0.1 + subIndex * 0.05 }}
                  className="rounded-xl bg-white border-2 border-gray-200 shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="px-4 py-3 border-b-2 border-gray-100 bg-gradient-to-r from-gray-50 to-white">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold text-gray-800">
                        {sub.name}
                      </h3>
                      <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                        {sub.dishes.length} item
                        {sub.dishes.length === 1 ? "" : "s"}
                      </span>
                    </div>
                  </div>

                  <div className="p-4 space-y-3 min-h-[100px]">
                    {sub.dishes.map((dish, dishIndex) => (
                      <motion.div
                        key={dish.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{
                          delay:
                            catIndex * 0.1 + subIndex * 0.05 + dishIndex * 0.03,
                        }}
                        className={cn(
                          "p-3 rounded-lg border-2 transition-all relative group",
                          isEditing
                            ? "hover:shadow-md cursor-pointer hover:border-blue-300"
                            : "",
                          "bg-white",
                        )}
                        onClick={() => {
                          if (isEditing) {
                            setEditingDish({
                              dish,
                              categoryId: cat.id,
                              subcategoryId: sub.id,
                            });
                          }
                        }}
                      >
                        {isEditing && (
                          <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <div className="bg-blue-600 text-white p-1.5 rounded-full">
                              <Edit2 className="w-3 h-3" />
                            </div>
                          </div>
                        )}

                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-lg">
                                {
                                  dishTypeIcons[
                                    dish.dishType as keyof typeof dishTypeIcons
                                  ]
                                }
                              </span>
                              <h4 className="font-medium text-gray-900 text-sm truncate">
                                {dish.dishName}
                              </h4>
                            </div>
                            <div className="flex items-center gap-2">
                              <span
                                className={cn(
                                  "text-xs px-2 py-0.5 rounded-full border font-medium",
                                  dishTypeColors[
                                    dish.dishType as keyof typeof dishTypeColors
                                  ],
                                )}
                              >
                                {dish.dishType.toUpperCase()}
                              </span>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-bold text-gray-900">
                              ₹{dish.price}
                            </p>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Edit Dialogs */}
      {editingDish && (
        <EditMenuDialog
          open={!!editingDish}
          onClose={() => setEditingDish(null)}
          dish={editingDish.dish}
          categoryId={editingDish.categoryId}
          subcategoryId={editingDish.subcategoryId}
          allCategories={categories}
        />
      )}

      {editingCategory && (
        <EditCategoryDialog
          open={!!editingCategory}
          onClose={() => setEditingCategory(null)}
          categoryId={editingCategory.id}
          categoryName={editingCategory.name}
        />
      )}
    </>
  );
}
