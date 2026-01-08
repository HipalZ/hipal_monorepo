/**
 * BulkAddonModal.tsx
 *
 * Allows bulk creation of addons via text/CSV input.
 * Format: Name | Min | Max | Type | choice1:price, choice2:price...
 * Neo-Brutalism UI.
 */

import PopUp from '@/components/atom/popUp';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Textarea } from '@/components/ui/textarea';
import { memo, useState } from 'react';
import toast from 'react-hot-toast';
import { HiCheck, HiExclamation, HiX } from 'react-icons/hi';

import { BulkAddonRowSchema } from '../../validations';

import '../../styles/brutalist.css';

interface BulkAddonModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const BulkAddonModal = memo(function BulkAddonModal({ isOpen, onClose }: BulkAddonModalProps) {
  const [rawText, setRawText] = useState('');
  const [parsedData, setParsedData] = useState<any[]>([]);
  const [errors, setErrors] = useState<Map<number, string>>(new Map());
  const [isProcessing, setIsProcessing] = useState(false);

  const parseText = () => {
    const lines = rawText.split('\n').filter((l) => l.trim().length > 0);
    const results: any[] = [];
    const newErrors = new Map<number, string>();

    lines.forEach((line, idx) => {
      try {
        // Format: Name | Min | Max | Type | Choices
        const parts = line.split('|').map((p) => p.trim());
        if (parts.length < 5) throw new Error('Invalid format. Need 5 parts.');

        const [name, minStr, maxStr, typeStr, choicesStr] = parts;
        const min = parseInt(minStr);
        const max = parseInt(maxStr);
        // Normalize Type
        const type = typeStr.toUpperCase() === 'MULTIPLE' ? 'MULTIPLE' : 'SINGLE';

        const choices = choicesStr.split(',').map((c: string) => {
          const [cName, cPrice] = c.split(':').map((s: string) => s.trim());
          if (!cName) throw new Error('Choice name missing');
          return { name: cName, price: Number(cPrice) || 0 };
        });

        const rowData = { name, min, max, type, choices };
        // Validate
        const result = BulkAddonRowSchema.safeParse(rowData);
        if (!result.success) {
          throw new Error(result.error.issues[0].message);
        }

        results.push(rowData);
      } catch (e: any) {
        newErrors.set(idx, e.message);
        results.push(null); // Keep index alignment
      }
    });

    setParsedData(results);
    setErrors(newErrors);
  };

  const handleCreate = async () => {
    if (errors.size > 0) {
      toast.error('Please fix errors before creating');
      return;
    }
    const validItems = parsedData.filter((i) => i !== null);
    if (validItems.length === 0) return;

    setIsProcessing(true);
    try {
      let count = 0;
      for (const item of validItems) {
        const payload = {
          name: item.name,
          compulsory: item.min,
          addOnMaxQuantity: item.max,
          choices: item.choices,
        };
        // Mock Create
        // await DraftOpsRepository.createAddon(businessId, payload);
        await new Promise((r) => setTimeout(r, 100)); // Simul
        count++;
      }
      toast.success(`Created ${count} addons successfully`);
      onClose();
      setRawText('');
      setParsedData([]);
    } catch (e) {
      toast.error('Failed to create addons');
    } finally {
      setIsProcessing(false);
    }
  };

  if (!isOpen) return null;

  return (
    <PopUp show={isOpen} onClose={onClose} hide>
      <section
        className="hide-scrollbar max-h-[100dvh] min-h-[100dvh] overflow-y-auto pb-[5rem] lg:max-h-[90dvh] lg:min-h-[70dvh]"
        style={{ background: '#F3F4F6' }}
      >
        <button
          className="brutal-button absolute right-4 top-6 z-50 bg-white"
          type="button"
          onClick={onClose}
          style={{ width: '40px', height: '40px', padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
        >
          <HiX style={{ width: '20px', height: '20px' }} />
        </button>

        <div className="brutal-card m-6 overflow-hidden bg-white p-0 md:mx-auto md:max-w-4xl">
          <div className="border-b-4 border-black bg-white p-6">
            <h2 className="brutal-heading text-xl">BULK ADD ADDONS</h2>
          </div>

          <div className="flex h-full flex-col gap-4 p-6">
            <div className="brutal-card bg-yellow-50 p-4 text-xs font-bold text-gray-800">
              <p className="mb-2 uppercase">Format Instructions:</p>
              <code className="block bg-black p-2 text-white">Name | Min | Max | SINGLE/MULTIPLE | Choice1:Price, Choice2:Price</code>
              <p className="mt-2">Example: Toppings | 0 | 2 | MULTIPLE | Cheese:20, Olives:30</p>
            </div>

            <div className="grid h-full grid-cols-1 gap-6 lg:grid-cols-2">
              {/* Input */}
              <div className="flex flex-col gap-2">
                <Label className="brutal-label">RAW DATA (PASTE HERE)</Label>
                <Textarea
                  value={rawText}
                  onChange={(e) => setRawText(e.target.value)}
                  placeholder="Paste your CSV data here..."
                  className="brutal-input flex-1 font-mono text-xs"
                  spellCheck={false}
                  rows={15}
                />
                <Button onClick={parseText} className="brutal-button bg-cyan-300">
                  PREVIEW & VALIDATE
                </Button>
              </div>

              {/* Preview */}
              <div className="flex flex-col gap-2">
                <Label className="brutal-label">PREVIEW</Label>
                <ScrollArea className="h-[300px] flex-1 rounded border-2 border-black bg-white p-2">
                  {parsedData.length === 0 && !rawText && <div className="p-4 text-center text-xs text-gray-400">Waiting for data...</div>}

                  <div className="space-y-2">
                    {parsedData.map((item, idx) => {
                      const error = errors.get(idx);
                      if (error) {
                        return (
                          <div key={idx} className="flex items-start gap-2 rounded bg-red-100 p-2 text-xs text-red-700">
                            <HiExclamation className="mt-0.5 flex-shrink-0" />
                            <div>
                              <span className="font-bold">Row {idx + 1}: </span>
                              {error}
                            </div>
                          </div>
                        );
                      }
                      if (!item) return null;
                      return (
                        <div key={idx} className="flex flex-col rounded bg-green-50 p-2 text-xs">
                          <div className="flex items-center gap-2 font-bold">
                            <HiCheck className="text-green-600" />
                            <span>{item.name}</span>
                            <span className="rounded bg-black px-1 text-white">{item.type}</span>
                            <span>
                              ({item.min}-{item.max})
                            </span>
                          </div>
                          <div className="mt-1 pl-5 text-gray-600">{item.choices.map((c: any) => `${c.name} (${c.price})`).join(', ')}</div>
                        </div>
                      );
                    })}
                  </div>
                </ScrollArea>

                <Button
                  onClick={handleCreate}
                  disabled={parsedData.length === 0 || errors.size > 0 || isProcessing}
                  className="brutal-button-primary w-full"
                >
                  {isProcessing ? 'PROCESSING...' : `IMPORT ${parsedData.filter((x) => x).length} ADDONS`}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </PopUp>
  );
});
