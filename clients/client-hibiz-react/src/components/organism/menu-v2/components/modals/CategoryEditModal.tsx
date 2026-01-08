/**
 * CategoryEditModal Component
 *
 * Reusable modal for editing category details (name, visibility).
 */

import PopUp from '@/components/atom/popUp';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { memo, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { HiX } from 'react-icons/hi';
import { DraftOpsRepository } from '../../db/DraftOpsRepository';
import '../../styles/brutalist.css';
import type { CategoryEditModalProps, CategoryUpdatePayload } from '../../types';

export const CategoryEditModal = memo(function CategoryEditModal({ category, isOpen, onClose, businessId }: CategoryEditModalProps) {
  const [name, setName] = useState(category?.name || '');
  const [visibility, setVisibility] = useState(category?.visibility !== false);

  useEffect(() => {
    if (category) {
      setName(category.name || '');
      setVisibility(category.visibility !== false);
    }
  }, [category]);

  const handleSave = async () => {
    if (!category) return;
    try {
      const updates: CategoryUpdatePayload = {
        name,
        visibility,
      };
      await DraftOpsRepository.updateCategory(category._id, businessId, updates);
      toast.success('Category updated successfully');
      onClose();
    } catch (error) {
      toast.error('Failed to update category');
    }
  };

  if (!category) return null;

  return (
    <PopUp show={isOpen} onClose={onClose} hide>
      <section
        className="hide-scrollbar max-h-[100dvh] min-h-[100dvh] overflow-y-auto pb-[5rem] lg:max-h-[90dvh] lg:min-h-[70dvh]"
        style={{ background: '#F3F4F6' }}
      >
        <button
          className="brutal-button absolute right-4 top-6 z-50"
          type="button"
          onClick={onClose}
          style={{ width: '40px', height: '40px', padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
        >
          <HiX style={{ width: '20px', height: '20px' }} />
        </button>
        <div className="brutal-card" style={{ margin: '24px', padding: '24px' }}>
          <h2 className="brutal-heading mb-2" style={{ fontSize: '1.5rem' }}>
            EDIT CATEGORY: {category.name.toUpperCase()}
          </h2>
          <p className="brutal-body mb-6" style={{ fontSize: '0.875rem' }}>
            UPDATE CATEGORY NAME AND VISIBILITY
          </p>

          <div className="space-y-6">
            <div className="space-y-2">
              <Label className="brutal-heading" style={{ fontSize: '0.875rem' }}>
                CATEGORY NAME
              </Label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="ENTER CATEGORY NAME"
                className="brutal-input"
                style={{ width: '100%', padding: '8px 12px', fontSize: '0.875rem' }}
              />
            </div>

            <div className="space-y-2">
              <Label className="brutal-heading" style={{ fontSize: '0.875rem' }}>
                VISIBILITY
              </Label>
              <div className="flex items-center gap-2">
                <Switch checked={visibility} onCheckedChange={setVisibility} />
                <span className="brutal-body">{visibility ? 'VISIBLE' : 'HIDDEN'}</span>
              </div>
            </div>

            <div className="flex gap-3 pb-8 pt-4">
              <button type="button" onClick={handleSave} className="brutal-button-primary" style={{ padding: '8px 16px', fontSize: '0.875rem' }}>
                SAVE
              </button>
              <button type="button" onClick={onClose} className="brutal-button" style={{ padding: '8px 16px', fontSize: '0.875rem' }}>
                CANCEL
              </button>
            </div>
          </div>
        </div>
      </section>
    </PopUp>
  );
});
