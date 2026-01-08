/**
 * AddonRow Component
 *
 * Reusable component for displaying addon rows with availability toggle and choices dropdown.
 */

import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Switch } from '@/components/ui/switch';
import { ChevronDown, Edit } from 'lucide-react';
import { memo } from 'react';
import '../styles/brutalist.css';
import type { AddonChoice, MenuAddon } from '../types';
import { formatDate } from '../utils/dateFormatter';

interface AddonRowProps {
  addon: MenuAddon;
  businessId: string;
  onEdit: (addon: MenuAddon) => void;
  onToggleAvailability: (addonId: string, availability: boolean) => void;
}

export const AddonRow = memo(function AddonRow({ addon, businessId, onEdit, onToggleAvailability }: AddonRowProps) {
  const dishIds = Array.isArray(addon.dishIds) ? addon.dishIds : [];
  const choices = Array.isArray(addon.choices) ? addon.choices : [];
  const availability = addon.availability !== false;

  return (
    <div
      className="brutal-table-row grid grid-cols-8 items-center gap-4 px-3 py-3"
      style={{ fontSize: '0.875rem', borderBottom: '2px solid #000000' }}
    >
      <div className="brutal-body" style={{ fontWeight: 700, textTransform: 'uppercase' }}>
        {addon.name}
      </div>
      <span className={addon.compulsory ? 'brutal-badge-yellow' : 'brutal-badge'}>{addon.compulsory ? 'YES' : 'NO'}</span>
      <div className="brutal-data">{addon.addOnMaxQuantity || '-'}</div>
      <div className="brutal-body">{(addon as MenuAddon & { choiceType?: string }).choiceType || '-'}</div>
      <div className="brutal-body">
        {dishIds.length} DISH{dishIds.length !== 1 ? 'ES' : ''}
      </div>
      <div className="brutal-data" style={{ fontSize: '0.75rem' }}>
        <div className="flex flex-col gap-0.5">
          {addon.createdAt && (
            <div>
              <span className="brutal-body" style={{ fontSize: '0.625rem', fontWeight: 700 }}>
                CREATED:{' '}
              </span>
              <span>{formatDate(addon.createdAt)}</span>
            </div>
          )}
          {addon.updatedAt && (
            <div>
              <span className="brutal-body" style={{ fontSize: '0.625rem', fontWeight: 700 }}>
                UPDATED:{' '}
              </span>
              <span>{formatDate(addon.updatedAt)}</span>
            </div>
          )}
          {!addon.createdAt && !addon.updatedAt && <span>-</span>}
        </div>
      </div>
      <div className="flex items-center justify-center">
        <Switch
          checked={availability}
          onCheckedChange={(checked) => {
            if (businessId) {
              onToggleAvailability(addon._id, checked);
            }
          }}
        />
      </div>
      <div className="flex items-center gap-2">
        {choices.length > 0 && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button type="button" className="brutal-button" style={{ height: '28px', fontSize: '0.75rem', padding: '4px 8px' }}>
                CHOICES <ChevronDown className="brutal-icon" style={{ width: '12px', height: '12px', display: 'inline', marginLeft: '4px' }} />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="brutal-card" style={{ width: '320px', border: '3px solid #000000' }}>
              <div className="max-h-64 overflow-y-auto p-2">
                <div className="brutal-heading mb-2" style={{ fontSize: '0.75rem' }}>
                  CHOICES ({choices.length})
                </div>
                <div className="space-y-2">
                  {choices.map((choice: AddonChoice, idx: number) => (
                    <div key={choice._id || idx} className="brutal-card" style={{ padding: '8px', fontSize: '0.75rem', marginBottom: '4px' }}>
                      <div className="brutal-body" style={{ fontWeight: 700 }}>
                        {choice.name}
                      </div>
                      <div className="brutal-data">PRICE: ₹{choice.price || 0}</div>
                      {choice.choiceMaxQuantity && <div className="brutal-data">MAX: {choice.choiceMaxQuantity}</div>}
                      {choice.choiceDishType && (
                        <div className="brutal-body">
                          TYPE:{' '}
                          {Array.isArray(choice.choiceDishType)
                            ? choice.choiceDishType.join(', ').toUpperCase()
                            : String(choice.choiceDishType).toUpperCase()}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
        <button
          type="button"
          onClick={() => onEdit(addon)}
          className="brutal-button"
          style={{ width: '32px', height: '32px', padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
        >
          <Edit className="brutal-icon" style={{ width: '16px', height: '16px' }} />
        </button>
      </div>
    </div>
  );
});
