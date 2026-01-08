/**
 * DishRow Component
 *
 * Reusable component for displaying a single dish row in the items table.
 * Handles image display, pending uploads, and action buttons.
 */

import FoodType from '@/components/atom/FoodType';
import { Switch } from '@/components/ui/switch';
import { Edit, Plus } from 'lucide-react';
import { memo } from 'react';
import '../styles/brutalist.css';
import type { MenuDish } from '../types';
import { formatDate } from '../utils/dateFormatter';

interface DishRowProps {
  dish: MenuDish;
  pendingImages: Map<string, string[]>;
  selectedMenuId: string;
  businessId: string;
  onEdit: (dish: MenuDish) => void;
  onUploadImage: (dish: MenuDish) => void;
  onToggleAvailability: (dishId: string, availability: boolean) => void;
  onToggleVisibility: (dishId: string, visibility: boolean) => void;
}

export const DishRow = memo(function DishRow({
  dish,
  pendingImages,
  selectedMenuId,
  businessId,
  onEdit,
  onUploadImage,
  onToggleAvailability,
  onToggleVisibility,
}: DishRowProps) {
  const dishImages = Array.isArray(dish.images) ? dish.images : [];
  const pending = pendingImages.get(dish._id) || [];
  const displayImage = pending.find((img) => img) || dishImages[0];

  const displayPrice = dish.displayPrice ?? dish.price ?? 0;
  const displayVisibility = dish.displayVisibility ?? dish.visibility ?? true;
  const availability = dish.availability ?? true;

  // Determine price display (portion or regular)
  const priceDisplay = dish.portions && dish.portions.length > 0 ? `₹${dish.portions[0]?.price ?? displayPrice}` : `₹${displayPrice}`;

  return (
    <>
      <div className="col-span-2 min-w-[120px]">
        <div className="brutal-body" style={{ fontWeight: 700, textTransform: 'uppercase' }}>
          {dish.name}
        </div>
        {selectedMenuId !== 'ALL' && displayPrice !== dish.price && (
          <div className="brutal-body" style={{ fontSize: '0.6875rem', color: '#FF4444', fontWeight: 700 }}>
            OVERRIDDEN
          </div>
        )}
      </div>
      <div className="col-span-1 hidden items-center lg:flex">
        <FoodType types={dish.dishTypes || []} />
      </div>
      <div className="brutal-data col-span-1 min-w-[60px]" style={{ fontWeight: 700 }}>
        {priceDisplay}
      </div>
      <div className="brutal-data col-span-2" style={{ fontSize: '0.75rem' }}>
        <div className="flex flex-col gap-0.5">
          {dish.createdAt && (
            <div>
              <span className="brutal-body" style={{ fontSize: '0.625rem', fontWeight: 700 }}>
                CREATED:{' '}
              </span>
              <span>{formatDate(dish.createdAt)}</span>
            </div>
          )}
          {dish.updatedAt && (
            <div>
              <span className="brutal-body" style={{ fontSize: '0.625rem', fontWeight: 700 }}>
                UPDATED:{' '}
              </span>
              <span>{formatDate(dish.updatedAt)}</span>
            </div>
          )}
          {!dish.createdAt && !dish.updatedAt && <span>-</span>}
        </div>
      </div>
      <div className="col-span-1 min-w-[50px]">
        <DishImageCell dish={dish} displayImage={displayImage} hasPending={pending.length > 0} onUploadClick={() => onUploadImage(dish)} />
      </div>
      <div className="col-span-1 flex min-w-[80px] items-center justify-center px-1">
        <Switch checked={availability} onCheckedChange={(checked) => onToggleAvailability(dish._id, checked)} />
      </div>
      <div className="col-span-1 flex min-w-[80px] items-center justify-center px-1">
        <Switch checked={displayVisibility} onCheckedChange={(checked) => onToggleVisibility(dish._id, checked)} />
      </div>
      <div className="col-span-2 flex min-w-[80px] items-center gap-2">
        <button
          type="button"
          onClick={() => onEdit(dish)}
          className="brutal-button"
          style={{ width: '32px', height: '32px', padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
        >
          <Edit className="brutal-icon" style={{ width: '16px', height: '16px' }} />
        </button>
      </div>
    </>
  );
});

// Image Cell Sub-component
interface DishImageCellProps {
  dish: MenuDish;
  displayImage?: string;
  hasPending: boolean;
  onUploadClick: () => void;
}

const DishImageCell = memo(function DishImageCell({ displayImage, hasPending, onUploadClick }: DishImageCellProps) {
  if (displayImage) {
    return (
      <div className="group relative">
        <img
          src={displayImage}
          alt=""
          style={{
            width: '40px',
            height: '40px',
            objectFit: 'cover',
            border: '2px solid #000000',
          }}
        />
        {hasPending && (
          <div
            style={{
              position: 'absolute',
              right: '-4px',
              top: '-4px',
              width: '12px',
              height: '12px',
              border: '2px solid #FFFFFF',
              background: '#FFEB3B',
            }}
            title="Pending upload"
          />
        )}
        <button
          type="button"
          onClick={onUploadClick}
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'rgba(0, 0, 0, 0)',
            opacity: 0,
            transition: 'opacity 0.2s ease, background 0.2s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.opacity = '1';
            e.currentTarget.style.background = 'rgba(0, 0, 0, 0.5)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.opacity = '0';
            e.currentTarget.style.background = 'rgba(0, 0, 0, 0)';
          }}
        >
          <Edit className="brutal-icon" style={{ width: '16px', height: '16px', color: '#FFFFFF' }} />
        </button>
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={onUploadClick}
      className="brutal-button"
      style={{
        width: '40px',
        height: '40px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        borderStyle: 'dashed',
        padding: 0,
      }}
    >
      <Plus className="brutal-icon" style={{ width: '20px', height: '20px' }} />
    </button>
  );
});
