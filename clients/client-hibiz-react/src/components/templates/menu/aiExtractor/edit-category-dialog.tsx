import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useMenuStore } from '@/lib/menu/store';
import { AnimatePresence, motion } from 'framer-motion';
import { FolderEdit, X } from 'lucide-react';
import { useState } from 'react';

interface EditCategoryDialogProps {
  open: boolean;
  onClose: () => void;
  categoryId: string;
  categoryName: string;
}

export function EditCategoryDialog({ open, onClose, categoryId, categoryName }: EditCategoryDialogProps) {
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
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className="w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-gradient-to-r from-emerald-600 to-teal-600 p-6">
              <div className="flex items-center justify-between text-white">
                <div className="flex items-center gap-3">
                  <FolderEdit className="h-6 w-6" />
                  <h3 className="text-xl font-bold">Edit Category</h3>
                </div>
                <button onClick={onClose} className="rounded-full p-2 transition-colors hover:bg-white/20">
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            <div className="space-y-4 p-6">
              <div className="space-y-2">
                <Label htmlFor="categoryName" className="text-sm font-medium text-gray-700">
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

            <div className="flex justify-end gap-3 border-t bg-gray-50 p-6">
              <Button variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700" onClick={handleSave}>
                Save Changes
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
