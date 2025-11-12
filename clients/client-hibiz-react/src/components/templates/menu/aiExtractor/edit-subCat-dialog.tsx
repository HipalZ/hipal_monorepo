// components/edit-subcategory-dialog.tsx
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useMenuStore } from '@/lib/menu/store';
import { AnimatePresence, motion } from 'framer-motion';
import { FolderEdit, X } from 'lucide-react';
import { useEffect, useState } from 'react';

interface EditSubcategoryDialogProps {
  open: boolean;
  onClose: () => void;
  categoryId: string;
  subcategoryId: string;
  subcategoryName: string;
}

export function EditSubcategoryDialog({ open, onClose, categoryId, subcategoryId, subcategoryName }: EditSubcategoryDialogProps) {
  const { updateSubcategoryName } = useMenuStore();
  const [name, setName] = useState(subcategoryName);

  useEffect(() => setName(subcategoryName), [subcategoryName]);

  const handleSave = () => {
    updateSubcategoryName(categoryId, subcategoryId, name.trim() || subcategoryName);
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
            <div className="bg-gradient-to-r from-violet-600 to-fuchsia-600 p-6">
              <div className="flex items-center justify-between text-white">
                <div className="flex items-center gap-3">
                  <FolderEdit className="h-6 w-6" />
                  <h3 className="text-xl font-bold">Edit Subcategory</h3>
                </div>
                <button onClick={onClose} className="rounded-full p-2 transition-colors hover:bg-white/20">
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            <div className="space-y-4 p-6">
              <div className="space-y-2">
                <Label htmlFor="subName" className="text-sm font-medium text-gray-700">
                  Subcategory Name
                </Label>
                <Input
                  id="subName"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter subcategory name"
                  className="w-full"
                  autoFocus
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 border-t bg-gray-50 p-6">
              <Button variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button className="bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-700 hover:to-fuchsia-700" onClick={handleSave}>
                Save
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
