import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, FolderEdit } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useMenuStore } from "@/lib/menu/store";

interface EditCategoryDialogProps {
  open: boolean;
  onClose: () => void;
  categoryId: string;
  categoryName: string;
}

export function EditCategoryDialog({
  open,
  onClose,
  categoryId,
  categoryName,
}: EditCategoryDialogProps) {
  const { updateCategoryName } = useMenuStore();
  const [name, setName] = useState(categoryName);

  const handleSave = () => {
    updateCategoryName(categoryId, name);
    onClose();
  };

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
            className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-gradient-to-r from-emerald-600 to-teal-600 p-6">
              <div className="flex items-center justify-between text-white">
                <div className="flex items-center gap-3">
                  <FolderEdit className="w-6 h-6" />
                  <h3 className="text-xl font-bold">Edit Category</h3>
                </div>
                <button
                  onClick={onClose}
                  className="hover:bg-white/20 rounded-full p-2 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-4">
              <div className="space-y-2">
                <Label
                  htmlFor="categoryName"
                  className="text-sm font-medium text-gray-700"
                >
                  Category Name
                </Label>
                <Input
                  id="categoryName"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter category name"
                  className="w-full"
                  autoFocus
                />
              </div>
            </div>

            <div className="p-6 bg-gray-50 border-t flex justify-end gap-3">
              <Button variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button
                onClick={handleSave}
                className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700"
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
