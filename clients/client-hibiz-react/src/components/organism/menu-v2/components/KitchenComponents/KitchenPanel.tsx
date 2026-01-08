import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { useState } from 'react';
import type { MenuKitchen } from '../../types';
import { KitchenForm } from './KitchenForm';
import { KitchenList } from './KitchenList';

export const KitchenPanel = () => {
  const [isCreating, setIsCreating] = useState(false);
  const [editingKitchen, setEditingKitchen] = useState<MenuKitchen | null>(null);

  const handleClose = () => {
    setIsCreating(false);
    setEditingKitchen(null);
  };

  const handleEdit = (kitchen: MenuKitchen) => {
    setEditingKitchen(kitchen);
    setIsCreating(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="brutal-heading text-xl">KITCHENS</h2>
          <p className="brutal-body text-sm text-gray-500">Manage your kitchen stations here.</p>
        </div>
        {!isCreating && (
          <Button onClick={() => setIsCreating(true)} className="brutal-button-primary flex items-center gap-2">
            <Plus className="h-4 w-4" />
            ADD KITCHEN
          </Button>
        )}
      </div>

      {isCreating ? <KitchenForm onClose={handleClose} initialData={editingKitchen || undefined} /> : <KitchenList onEdit={handleEdit} />}
    </div>
  );
};
