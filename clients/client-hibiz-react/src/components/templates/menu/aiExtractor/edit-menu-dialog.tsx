import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Edit2, Check, MoveRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Category, Dish } from "@/lib/menu/types";
import { useMenuStore } from "@/lib/menu/store";

interface EditMenuDialogProps {
  open: boolean;
  onClose: () => void;
  dish: Dish;
  categoryId: string;
  subcategoryId: string;
  allCategories: Category[];
}

const dishTypeOptions = [
  { value: "veg", label: "Vegetarian", icon: "🥬" },
  { value: "nonveg", label: "Non-Veg", icon: "🍗" },
  { value: "egg", label: "Egg", icon: "🥚" },
  { value: "vegan", label: "Vegan", icon: "🌱" },
];

export function EditMenuDialog({
  open,
  onClose,
  dish,
  categoryId,
  subcategoryId,
  allCategories,
}: EditMenuDialogProps) {
  const { updateDishDetails, moveDishToCategory } = useMenuStore();

  const [dishName, setDishName] = useState(dish.dishName);
  const [price, setPrice] = useState(dish.price.toString());
  const [dishType, setDishType] = useState(dish.dishType);
  const [selectedCategoryId, setSelectedCategoryId] = useState(categoryId);
  const [selectedSubcategoryId, setSelectedSubcategoryId] =
    useState(subcategoryId);

  const handleSave = () => {
    // Update dish details
    updateDishDetails(categoryId, subcategoryId, dish.id, {
      dishName,
      price: Number.parseFloat(price) || 0,
      dishType,
    });

    // Move dish if category changed
    if (
      selectedCategoryId !== categoryId ||
      selectedSubcategoryId !== subcategoryId
    ) {
      moveDishToCategory(
        dish.id,
        categoryId,
        subcategoryId,
        selectedCategoryId,
        selectedSubcategoryId,
      );
    }

    onClose();
  };

  const selectedCategory = allCategories.find(
    (c) => c.id === selectedCategoryId,
  );
  const subcategories = selectedCategory?.subcategories || [];

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6">
              <div className="flex items-center justify-between text-white">
                <div className="flex items-center gap-3">
                  <Edit2 className="w-6 h-6" />
                  <h3 className="text-xl font-bold">Edit Dish</h3>
                </div>
                <button
                  onClick={onClose}
                  className="hover:bg-white/20 rounded-full p-2 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Dish Name */}
              <div className="space-y-2">
                <Label
                  htmlFor="dishName"
                  className="text-sm font-medium text-gray-700"
                >
                  Dish Name
                </Label>
                <Input
                  id="dishName"
                  value={dishName}
                  onChange={(e) => setDishName(e.target.value)}
                  placeholder="Enter dish name"
                  className="w-full"
                />
              </div>

              {/* Price */}
              <div className="space-y-2">
                <Label
                  htmlFor="price"
                  className="text-sm font-medium text-gray-700"
                >
                  Price (₹)
                </Label>
                <Input
                  id="price"
                  type="number"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="Enter price"
                  className="w-full"
                />
              </div>

              {/* Dish Type */}
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700">
                  Dish Type
                </Label>
                <div className="grid grid-cols-2 gap-3">
                  {dishTypeOptions.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => setDishType(option.value)}
                      className={`flex items-center gap-3 p-3 rounded-lg border-2 transition-all ${
                        dishType === option.value
                          ? "border-blue-600 bg-blue-50"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <span className="text-2xl">{option.icon}</span>
                      <span className="font-medium text-sm">
                        {option.label}
                      </span>
                      {dishType === option.value && (
                        <Check className="w-4 h-4 text-blue-600 ml-auto" />
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Category Selection */}
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700">
                  Category
                </Label>
                <Select
                  value={selectedCategoryId}
                  onValueChange={setSelectedCategoryId}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {allCategories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id}>
                        {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Subcategory Selection */}
              {subcategories.length > 0 && (
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-700">
                    Subcategory
                  </Label>
                  <Select
                    value={selectedSubcategoryId}
                    onValueChange={setSelectedSubcategoryId}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select subcategory" />
                    </SelectTrigger>
                    <SelectContent>
                      {subcategories.map((sub) => (
                        <SelectItem key={sub.id} value={sub.id}>
                          {sub.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* Category Change Indicator */}
              {(selectedCategoryId !== categoryId ||
                selectedSubcategoryId !== subcategoryId) && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center gap-2 p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-700"
                >
                  <MoveRight className="w-4 h-4" />
                  <span>This dish will be moved to a different category</span>
                </motion.div>
              )}
            </div>

            <div className="p-6 bg-gray-50 border-t flex justify-end gap-3">
              <Button variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button
                onClick={handleSave}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              >
                Save Changes
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
