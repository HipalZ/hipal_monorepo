/**
 * ParentCategoryRow Component
 *
 * Reusable component for displaying parent category rows with nested child categories.
 */

import { Switch } from '@/components/ui/switch';
import { Edit } from 'lucide-react';
import { memo } from 'react';
import '../styles/brutalist.css';
import type { MenuCategory } from '../types';
import { formatDate } from '../utils/dateFormatter';
import { CategoryRow } from './CategoryRow';

interface ParentCategoryRowProps {
  category: MenuCategory;
  childCategories: MenuCategory[];
  dishCountByCategoryId: Map<string, number>;
  businessId: string;
  onEdit: (category: MenuCategory) => void;
  onToggleVisibility: (categoryId: string, visibility: boolean) => void;
}

export const ParentCategoryRow = memo(function ParentCategoryRow({
  category,
  childCategories,
  dishCountByCategoryId,
  businessId,
  onEdit,
  onToggleVisibility,
}: ParentCategoryRowProps) {
  const visibility = category.visibility !== false;

  if (category.hierarchy !== 'PARENT') {
    return null;
  }

  return (
    <div style={{ borderBottom: '2px solid #000000' }}>
      {/* Parent Row */}
      <div className="brutal-table-row grid grid-cols-7 items-center gap-4 px-3 py-3" style={{ fontSize: '0.875rem' }}>
        <div className="brutal-body" style={{ fontWeight: 700, textTransform: 'uppercase' }}>
          {category.name}
        </div>
        <div className="brutal-body">
          {childCategories.length > 0 ? (
            <span style={{ fontSize: '0.875rem' }}>
              {childCategories.length} CHILD{childCategories.length !== 1 ? 'REN' : ''}
            </span>
          ) : (
            <span style={{ fontSize: '0.875rem' }}>NO CHILDREN</span>
          )}
        </div>
        <span className={visibility ? 'brutal-badge-yellow' : 'brutal-badge'}>{visibility ? 'ACTIVE' : 'INACTIVE'}</span>
        <div className="brutal-data" style={{ fontSize: '0.75rem' }}>
          <div className="flex flex-col gap-0.5">
            {category.createdAt && (
              <div>
                <span className="brutal-body" style={{ fontSize: '0.625rem', fontWeight: 700 }}>
                  CREATED:{' '}
                </span>
                <span>{formatDate(category.createdAt)}</span>
              </div>
            )}
            {category.updatedAt && (
              <div>
                <span className="brutal-body" style={{ fontSize: '0.625rem', fontWeight: 700 }}>
                  UPDATED:{' '}
                </span>
                <span>{formatDate(category.updatedAt)}</span>
              </div>
            )}
            {!category.createdAt && !category.updatedAt && <span>-</span>}
          </div>
        </div>
        <div className="flex items-center justify-center">
          <Switch checked={visibility} onCheckedChange={(checked) => onToggleVisibility(category._id, checked)} />
        </div>
        <div />
        <button
          type="button"
          onClick={() => onEdit(category)}
          className="brutal-button"
          style={{ width: '32px', height: '32px', padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
        >
          <Edit className="brutal-icon" style={{ width: '16px', height: '16px' }} />
        </button>
      </div>
      {/* Child Categories Nested */}
      {childCategories.length > 0 && (
        <div style={{ background: '#F3F4F6', paddingLeft: '32px', borderLeft: '3px solid #000000' }}>
          <div
            className="brutal-table-header grid grid-cols-6 gap-4 px-3 py-2"
            style={{ fontSize: '0.75rem', letterSpacing: '0.05em', background: '#000000', color: '#FFFFFF' }}
          >
            <span>CHILD NAME</span>
            <span>DISH COUNT</span>
            <span>DATES</span>
            <span>VISIBILITY</span>
            <span />
            <span>ACTIONS</span>
          </div>
          {childCategories.map((child) => {
            const dishCount = dishCountByCategoryId.get(child._id || '') || 0;
            return (
              <CategoryRow
                key={child._id}
                category={child}
                dishCount={dishCount}
                businessId={businessId}
                onEdit={onEdit}
                onToggleVisibility={onToggleVisibility}
              />
            );
          })}
        </div>
      )}
    </div>
  );
});
