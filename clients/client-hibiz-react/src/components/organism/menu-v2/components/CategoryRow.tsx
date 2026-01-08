/**
 * CategoryRow Component
 * 
 * Reusable component for displaying category rows with visibility toggle.
 */

import { memo } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Edit } from 'lucide-react';
import '../styles/brutalist.css';
import type { MenuCategory } from '../types';
import { formatDate } from '../utils/dateFormatter';

interface CategoryRowProps {
  category: MenuCategory;
  dishCount: number;
  businessId: string;
  onEdit: (category: MenuCategory) => void;
  onToggleVisibility: (categoryId: string, visibility: boolean) => void;
  parentName?: string;
}

export const CategoryRow = memo(function CategoryRow({
  category,
  dishCount,
  businessId,
  onEdit,
  onToggleVisibility,
  parentName,
}: CategoryRowProps) {
  const visibility = category.visibility !== false;

  // If parentName is provided, this is for child categories tab (6 columns: Name, Parent, Dish Count, Created At, Visibility, Actions)
  // Otherwise, it's for nested child rows under parent (different layout)
  if (parentName !== undefined) {
    return (
      <div
        className="brutal-table-row grid grid-cols-6 items-center gap-4 px-3 py-3"
        style={{ fontSize: '0.875rem', borderBottom: '2px solid #000000' }}
      >
        <div className="brutal-body" style={{ fontWeight: 700, textTransform: 'uppercase' }}>
          {category.name}
        </div>
        <div className="brutal-body">{parentName}</div>
        <span className="brutal-badge">{dishCount} DISHES</span>
        <div className="brutal-data" style={{ fontSize: '0.75rem' }}>
          <div className="flex flex-col gap-0.5">
            {category.createdAt && (
              <div>
                <span className="brutal-body" style={{ fontSize: '0.625rem', fontWeight: 700 }}>CREATED: </span>
                <span>{formatDate(category.createdAt)}</span>
              </div>
            )}
            {category.updatedAt && (
              <div>
                <span className="brutal-body" style={{ fontSize: '0.625rem', fontWeight: 700 }}>UPDATED: </span>
                <span>{formatDate(category.updatedAt)}</span>
              </div>
            )}
            {!category.createdAt && !category.updatedAt && <span>-</span>}
          </div>
        </div>
        <div className="flex items-center justify-center">
          <Switch
            checked={visibility}
            onCheckedChange={(checked) => onToggleVisibility(category._id, checked)}
          />
        </div>
        <button
          type="button"
          onClick={() => onEdit(category)}
          className="brutal-button"
          style={{ width: '32px', height: '32px', padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
        >
          <Edit className="brutal-icon" style={{ width: '16px', height: '16px' }} />
        </button>
      </div>
    );
  }

  // Nested child row layout (6 columns: Child Name, Dish Count, Created At, Visibility, empty, Actions)
  return (
    <div
      className="brutal-table-row grid grid-cols-6 items-center gap-4 px-3 py-2"
      style={{ fontSize: '0.875rem', borderBottom: '2px solid #000000' }}
    >
      <div className="brutal-body">{category.name}</div>
      <span className="brutal-badge" style={{ width: 'fit-content' }}>
        {dishCount} DISHES
      </span>
      <div className="brutal-data" style={{ fontSize: '0.75rem' }}>
        {category.createdAt ? new Date(category.createdAt).toLocaleDateString() : '-'}
      </div>
      <div className="flex items-center justify-center">
        <Switch
          checked={visibility}
          onCheckedChange={(checked) => onToggleVisibility(category._id, checked)}
        />
      </div>
      <div />
      <button
        type="button"
        onClick={() => onEdit(category)}
        className="brutal-button"
        style={{ width: '28px', height: '28px', padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
      >
        <Edit className="brutal-icon" style={{ width: '12px', height: '12px' }} />
      </button>
    </div>
  );
});
