/**
 * AddonEditModal Component
 *
 * Reusable modal for editing addon details (name, availability, visibility, compulsory, max quantity, choices).
 */

import PopUp from '@/components/atom/popUp';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Plus, Trash2 } from 'lucide-react';
import { memo, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { HiX } from 'react-icons/hi';
import { DraftOpsRepository } from '../../db/DraftOpsRepository';
import '../../styles/brutalist.css';
import type { AddonChoice, AddonEditModalProps, AddonUpdatePayload } from '../../types';

export const AddonEditModal = memo(function AddonEditModal({ addon, isOpen, onClose, businessId }: AddonEditModalProps) {
  const [name, setName] = useState(addon?.name || '');
  const [availability, setAvailability] = useState(addon?.availability !== false);
  const [visibility, setVisibility] = useState(addon?.visibility !== false);
  const [compulsory, setCompulsory] = useState(addon?.compulsory || 0);
  const [maxQuantity, setMaxQuantity] = useState(addon?.addOnMaxQuantity || 0);
  const [choices, setChoices] = useState<AddonChoice[]>([]);

  useEffect(() => {
    if (addon) {
      setName(addon.name || '');
      setAvailability(addon.availability !== false);
      setVisibility(addon.visibility !== false);
      setCompulsory(addon.compulsory || 0);
      setMaxQuantity(addon.addOnMaxQuantity || 0);
      setChoices(Array.isArray(addon.choices) ? [...addon.choices] : []);
    }
  }, [addon]);

  const handleSave = async () => {
    if (!addon) return;
    try {
      const updates: AddonUpdatePayload = {
        name,
        availability,
        visibility,
        compulsory,
        addOnMaxQuantity: maxQuantity,
        choices,
      };
      await DraftOpsRepository.updateAddon(addon._id, businessId, updates);
      toast.success('Addon updated successfully');
      onClose();
    } catch (error) {
      toast.error('Failed to update addon');
    }
  };

  const handleChoiceChange = (index: number, field: keyof AddonChoice, value: string | number) => {
    const updated = [...choices];
    updated[index] = { ...updated[index], [field]: value };
    setChoices(updated);
  };

  const handleAddChoice = () => {
    setChoices([...choices, { name: '', price: 0, choiceMaxQuantity: 0 }]);
  };

  const handleRemoveChoice = (index: number) => {
    setChoices(choices.filter((_, i) => i !== index));
  };

  if (!addon) return null;

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
            EDIT ADDON: {addon.name.toUpperCase()}
          </h2>
          <p className="brutal-body mb-6" style={{ fontSize: '0.875rem' }}>
            UPDATE ADDON DETAILS
          </p>

          <div className="space-y-6">
            <div className="space-y-2">
              <Label className="brutal-heading" style={{ fontSize: '0.875rem' }}>
                ADDON NAME
              </Label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="ENTER ADDON NAME"
                className="brutal-input"
                style={{ width: '100%', padding: '8px 12px', fontSize: '0.875rem' }}
              />
            </div>

            <div className="space-y-2">
              <Label className="brutal-heading" style={{ fontSize: '0.875rem' }}>
                AVAILABILITY
              </Label>
              <div className="flex items-center gap-2">
                <Switch checked={availability} onCheckedChange={setAvailability} />
                <span className="brutal-body">{availability ? 'AVAILABLE' : 'UNAVAILABLE'}</span>
              </div>
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

            <div className="space-y-2">
              <Label className="brutal-heading" style={{ fontSize: '0.875rem' }}>
                COMPULSORY (MIN CHOICES)
              </Label>
              <input
                type="number"
                value={compulsory}
                onChange={(e) => setCompulsory(Number.parseInt(e.target.value, 10) || 0)}
                min={0}
                className="brutal-input"
                style={{ width: '100%', padding: '8px 12px', fontSize: '0.875rem' }}
              />
            </div>

            <div className="space-y-2">
              <Label className="brutal-heading" style={{ fontSize: '0.875rem' }}>
                MAX QUANTITY
              </Label>
              <input
                type="number"
                value={maxQuantity}
                onChange={(e) => setMaxQuantity(Number.parseInt(e.target.value, 10) || 0)}
                min={0}
                className="brutal-input"
                style={{ width: '100%', padding: '8px 12px', fontSize: '0.875rem' }}
              />
            </div>

            <div className="space-y-3" style={{ borderTop: '3px solid #000000', paddingTop: '16px' }}>
              <div className="flex items-center justify-between">
                <Label className="brutal-heading" style={{ fontSize: '0.875rem' }}>
                  CHOICES
                </Label>
                <button type="button" onClick={handleAddChoice} className="brutal-button" style={{ padding: '6px 12px', fontSize: '0.75rem' }}>
                  <Plus className="brutal-icon" style={{ width: '16px', height: '16px', display: 'inline', marginRight: '4px' }} />
                  ADD CHOICE
                </button>
              </div>
              {choices.length === 0 ? (
                <div
                  className="brutal-input"
                  style={{
                    padding: '16px',
                    textAlign: 'center',
                    fontSize: '0.875rem',
                    borderStyle: 'dashed',
                  }}
                >
                  NO CHOICES ADDED. CLICK "ADD CHOICE" TO CREATE ONE.
                </div>
              ) : (
                <div className="max-h-64 space-y-3 overflow-y-auto">
                  {choices.map((choice, index) => (
                    <div key={choice._id || index} className="brutal-card space-y-2" style={{ padding: '12px' }}>
                      <div className="mb-2 flex items-center justify-between">
                        <span className="brutal-body" style={{ fontSize: '0.875rem', fontWeight: 700 }}>
                          CHOICE {index + 1}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleRemoveChoice(index)}
                          className="brutal-button"
                          style={{
                            padding: '4px 8px',
                            fontSize: '0.75rem',
                            background: '#FF4444',
                            color: '#FFFFFF',
                          }}
                        >
                          <Trash2 className="brutal-icon" style={{ width: '14px', height: '14px', display: 'inline', marginRight: '4px' }} />
                          REMOVE
                        </button>
                      </div>
                      <div className="space-y-2">
                        <div>
                          <Label className="brutal-body" style={{ fontSize: '0.75rem', fontWeight: 700 }}>
                            NAME
                          </Label>
                          <input
                            type="text"
                            value={choice.name || ''}
                            onChange={(e) => handleChoiceChange(index, 'name', e.target.value)}
                            placeholder="CHOICE NAME"
                            className="brutal-input"
                            style={{ width: '100%', padding: '8px 12px', fontSize: '0.875rem', marginTop: '4px' }}
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <Label className="brutal-body" style={{ fontSize: '0.75rem', fontWeight: 700 }}>
                              PRICE (₹)
                            </Label>
                            <input
                              type="number"
                              value={choice.price || 0}
                              onChange={(e) => handleChoiceChange(index, 'price', Number.parseFloat(e.target.value) || 0)}
                              min={0}
                              step="0.01"
                              className="brutal-input"
                              style={{ width: '100%', padding: '8px 12px', fontSize: '0.875rem', marginTop: '4px' }}
                            />
                          </div>
                          <div>
                            <Label className="brutal-body" style={{ fontSize: '0.75rem', fontWeight: 700 }}>
                              MAX QUANTITY
                            </Label>
                            <input
                              type="number"
                              value={choice.choiceMaxQuantity || 0}
                              onChange={(e) => handleChoiceChange(index, 'choiceMaxQuantity', Number.parseInt(e.target.value, 10) || 0)}
                              min={0}
                              className="brutal-input"
                              style={{ width: '100%', padding: '8px 12px', fontSize: '0.875rem', marginTop: '4px' }}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
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
