import useBusinessData from '@/components/store/useBusinessData';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Save, X } from 'lucide-react';
import { useState } from 'react';
import { DraftOpsRepository } from '../../db/DraftOpsRepository';
import { db } from '../../db/menu.database';
import { useMenuUIStore } from '../../store/useMenuUIStore';
import type { MenuKitchen } from '../../types';

interface KitchenFormProps {
  onClose: () => void;
  initialData?: MenuKitchen;
}

export const KitchenForm = ({ onClose, initialData }: KitchenFormProps) => {
  const businessId = useBusinessData((s) => s.outletInfo?.businessId);
  const selectedMenuId = useMenuUIStore((s) => s.selectedMenuId);

  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    description: initialData?.description || '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !businessId) return;

    setIsSubmitting(true);

    // Validation: Check for duplicate name locally
    const existingKitchen = await db.kitchens
      .where({ businessId })
      .filter((k) => k.name.toLowerCase() === formData.name.trim().toLowerCase() && k._id !== initialData?._id)
      .first();

    if (existingKitchen) {
      alert('A kitchen with this name already exists.');
      setIsSubmitting(false);
      return;
    }

    // Default description to name if empty
    const finalDescription = formData.description.trim() || formData.name.trim();

    try {
      if (initialData) {
        // Update existing via Repository
        await DraftOpsRepository.updateKitchen(
          initialData._id,
          businessId,
          {
            name: formData.name.trim(),
            description: finalDescription,
          },
          initialData,
        );
      } else {
        // Create new via Repository
        await DraftOpsRepository.createKitchen(businessId, selectedMenuId === 'ALL' ? '' : selectedMenuId, {
          name: formData.name.trim(),
          description: finalDescription,
        });
      }

      onClose();
    } catch (error) {
      console.error('Failed to save kitchen:', error);
      alert('Failed to save kitchen');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="brutal-card flex h-full flex-col bg-white p-6">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="brutal-heading text-lg">{initialData ? 'Edit Kitchen' : 'Create New Kitchen'}</h3>
        <Button variant="ghost" size="sm" onClick={onClose} className="h-8 w-8 p-0">
          <X className="h-4 w-4" />
        </Button>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-1 flex-col overflow-hidden">
        <div className="space-y-6">
          <div className="space-y-4 rounded-none border-2 border-black bg-gray-50 p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
            <h4 className="font-bold uppercase underline">Kitchen Details</h4>
            <div className="space-y-2">
              <Label htmlFor="name">Kitchen Name *</Label>
              <Input
                id="name"
                placeholder="e.g. Main Kitchen, Tandoor Station"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                className="brutal-input"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Optional description..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="brutal-input min-h-[120px]"
              />
            </div>
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-3 border-t pt-4">
          <Button type="button" variant="outline" onClick={onClose} className="brutal-button">
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting} className="brutal-button-primary flex items-center gap-2">
            <Save className="h-4 w-4" />
            {isSubmitting ? 'Saving...' : initialData ? 'Update Kitchen' : 'Save Kitchen'}
          </Button>
        </div>
      </form>
    </div>
  );
};
