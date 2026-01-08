/**
 * SharedDishConfirmModal Component
 * 
 * Confirmation modal shown when assigning images to a dish that exists across multiple menus.
 * Informs the user that the update will sync across all menus.
 */

import { memo } from 'react';
import PopUp from '@/components/atom/popUp';
import { HiX } from 'react-icons/hi';
import { AlertTriangle } from 'lucide-react';
import '../styles/brutalist.css';

interface SharedDishConfirmModalProps {
  isOpen: boolean;
  dishName: string;
  menuNames: string[];
  onConfirm: () => void;
  onCancel: () => void;
}

export const SharedDishConfirmModal = memo(function SharedDishConfirmModal({
  isOpen,
  dishName,
  menuNames,
  onConfirm,
  onCancel,
}: SharedDishConfirmModalProps) {
  return (
    <PopUp show={isOpen} onClose={onCancel} hide>
      <div
        className="brutal-card"
        style={{
          margin: '24px',
          padding: '24px',
          maxWidth: '500px',
          marginLeft: 'auto',
          marginRight: 'auto',
        }}
      >
        <button
          className="absolute right-4 top-6 z-50 brutal-button"
          type="button"
          onClick={onCancel}
          style={{ width: '40px', height: '40px', padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
        >
          <HiX style={{ width: '20px', height: '20px' }} />
        </button>

        <div className="mb-4 flex items-center gap-3">
          <AlertTriangle className="brutal-icon" style={{ width: '32px', height: '32px', color: '#FFEB3B' }} />
          <h2 className="brutal-heading" style={{ fontSize: '1.25rem' }}>
            SHARED DISH DETECTED
          </h2>
        </div>

        <div className="mb-6 space-y-3">
          <p className="brutal-body" style={{ fontSize: '0.875rem' }}>
            <span className="font-bold">{dishName.toUpperCase()}</span> IS USED IN{' '}
            <span className="font-bold">{menuNames.length}</span> MENU{menuNames.length !== 1 ? 'S' : ''}:
          </p>

          <div className="brutal-card" style={{ padding: '12px', background: '#F3F4F6' }}>
            <ul className="space-y-1">
              {menuNames.map((menuName, idx) => (
                <li key={idx} className="brutal-body flex items-center gap-2" style={{ fontSize: '0.875rem' }}>
                  <span className="brutal-badge-yellow" style={{ fontSize: '0.625rem', padding: '2px 6px' }}>
                    {idx + 1}
                  </span>
                  <span className="font-bold">{menuName.toUpperCase()}</span>
                </li>
              ))}
            </ul>
          </div>

          <p className="brutal-body" style={{ fontSize: '0.875rem', color: '#FF4444', fontWeight: 700 }}>
            UPDATING IMAGES WILL SYNC ACROSS ALL {menuNames.length} MENU{menuNames.length !== 1 ? 'S' : ''}. CONTINUE?
          </p>
        </div>

        <div className="flex justify-end gap-3">
          <button type="button" onClick={onCancel} className="brutal-button" style={{ padding: '8px 16px', fontSize: '0.875rem' }}>
            CANCEL
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="brutal-button-primary"
            style={{ padding: '8px 16px', fontSize: '0.875rem' }}
          >
            YES, SYNC ALL
          </button>
        </div>
      </div>
    </PopUp>
  );
});
