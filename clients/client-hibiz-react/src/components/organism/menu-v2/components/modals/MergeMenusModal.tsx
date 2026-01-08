/**
 * MergeMenusModal Component
 *
 * Modal for selecting multiple menus to merge into a single editing view.
 */

import PopUp from '@/components/atom/popUp';
import { Checkbox } from '@/components/ui/checkbox';
import { AlertCircle } from 'lucide-react';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { useMenuUIStore } from '../../store/useMenuUIStore';
import '../../styles/brutalist.css';
import type { MenuLayout } from '../../types';

interface MergeMenusModalProps {
  isOpen: boolean;
  onClose: () => void;
  menus: MenuLayout[];
}

export const MergeMenusModal = ({ isOpen, onClose, menus }: MergeMenusModalProps) => {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [step, setStep] = useState<1 | 2>(1);

  const setMergeMode = useMenuUIStore((s) => s.setMergeMode);
  const setMergedMenuIds = useMenuUIStore((s) => s.setMergedMenuIds);
  const setSelectedMenuId = useMenuUIStore((s) => s.setSelectedMenuId);

  // Reset state on open
  useEffect(() => {
    if (isOpen) {
      setSelectedIds([]);
      setStep(1);
    }
  }, [isOpen]);

  const handleToggle = (menuId: string) => {
    setSelectedIds((prev) => (prev.includes(menuId) ? prev.filter((id) => id !== menuId) : [...prev, menuId]));
  };

  const handleNext = () => {
    if (selectedIds.length < 2) {
      toast.error('Please select at least 2 menus to merge');
      return;
    }
    setStep(2);
  };

  const handleConfirm = () => {
    setMergedMenuIds(selectedIds);
    setMergeMode(true);
    setSelectedMenuId('ALL');
    toast.success(`Merged ${selectedIds.length} menus`);
    onClose();
  };

  return (
    <PopUp height="auto" width="600px" show={isOpen} onClose={onClose} hide>
      <div className="brutal-card p-6" style={{ background: '#FFFFFF', maxWidth: '600px', margin: '0 auto' }}>
        <h2 className="brutal-heading mb-4 text-xl">{step === 1 ? 'SELECT MENUS TO MERGE' : 'CONFIRM MERGE'}</h2>

        {step === 1 ? (
          <>
            <p className="brutal-body mb-4 text-sm text-gray-700">Select the menus where you want to sync identical items (same name).</p>
            <div className="brutal-card mb-6 max-h-[400px] overflow-y-auto p-2" style={{ border: '2px solid #000000' }}>
              {menus.map((menu) => (
                <div key={menu._id} className="flex items-center gap-3 p-3 hover:bg-gray-50" style={{ borderBottom: '1px solid #eee' }}>
                  <Checkbox
                    checked={selectedIds.includes(menu._id || '')}
                    onCheckedChange={() => handleToggle(menu._id || '')}
                    id={`menu-${menu._id}`}
                  />
                  <label htmlFor={`menu-${menu._id}`} className="brutal-body cursor-pointer text-sm font-bold">
                    {(menu.name || 'UNTITLED').toUpperCase()}
                  </label>
                </div>
              ))}
            </div>

            <div className="flex justify-end gap-3">
              <button type="button" onClick={onClose} className="brutal-button">
                CANCEL
              </button>
              <button
                type="button"
                onClick={handleNext}
                disabled={selectedIds.length < 2}
                className={`brutal-button ${selectedIds.length >= 2 ? 'bg-[#FFEB3B]' : 'cursor-not-allowed bg-gray-200'}`}
              >
                NEXT
              </button>
            </div>
          </>
        ) : (
          <>
            <div className="mb-6 rounded-none border-l-4 border-black bg-yellow-50 p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <AlertCircle className="h-5 w-5 text-black" aria-hidden="true" />
                </div>
                <div className="ml-3">
                  <h3 className="brutal-heading text-sm font-bold text-black">MERGE MODE ACTIVE</h3>
                  <div className="mt-2 text-sm text-black">
                    <p>
                      You are about to enter Merge Mode for <strong>{selectedIds.length} menus</strong>.
                    </p>
                    <ul className="mt-2 list-disc space-y-1 pl-5">
                      <li>Edits will sync across identical dishes/categories (same Name Key).</li>
                      <li>If an item exists in Menu A but not Menu B, it will be skipped for Menu B.</li>
                      <li>Prices and availability will be updated for all matched items.</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3">
              <button type="button" onClick={() => setStep(1)} className="brutal-button">
                BACK
              </button>
              <button type="button" onClick={handleConfirm} className="brutal-button bg-[#FFEB3B]">
                CONFIRM MERGE
              </button>
            </div>
          </>
        )}
      </div>
    </PopUp>
  );
};
