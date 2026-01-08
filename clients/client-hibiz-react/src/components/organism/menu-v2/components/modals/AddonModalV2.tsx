/**
 * AddonModalV2.tsx
 *
 * Create/Edit modal for single addons.
 * Supports adding choices dynamically.
 */

import PopUp from '@/components/atom/popUp';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { ScrollArea } from '@/components/ui/scroll-area';
import { zodResolver } from '@hookform/resolvers/zod';
import { memo, useEffect } from 'react';
import { Controller, useFieldArray, useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { HiPlus, HiTrash, HiX } from 'react-icons/hi';

import { DraftOpsRepository } from '../../db/DraftOpsRepository';
import { AddonFormSchema, type AddonFormValues } from '../../validations';

import '../../styles/brutalist.css';
import type { MenuAddon } from '../../types';

interface AddonModalV2Props {
  isOpen: boolean;
  onClose: () => void;
  addon: MenuAddon | null;
  businessId: string;
  selectedMenuId: string;
  isMergeMode: boolean;
}

export const AddonModalV2 = memo(function AddonModalV2({ isOpen, onClose, addon, businessId, selectedMenuId, isMergeMode }: AddonModalV2Props) {
  const isEdit = !!addon;

  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors, isValid, isSubmitting },
  } = useForm<AddonFormValues>({
    resolver: zodResolver(AddonFormSchema),
    defaultValues: {
      name: '',
      minChoice: 0,
      maxChoice: 1,
      choiceType: 'CHECKBOX',
      choices: [{ name: '', price: 0, isDefault: false }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'choices',
  });

  const watchMin = watch('minChoice');
  const watchMax = watch('maxChoice');
  const watchType = watch('choiceType');

  useEffect(() => {
    if (isOpen) {
      if (addon) {
        // Map existing data
        reset({
          name: addon.name,
          minChoice: (addon as any).minChoice || (addon.compulsory ?? 0),
          maxChoice: (addon as any).maxChoice || (addon.addOnMaxQuantity ?? 1),
          // Infer type or use stored. Reference uses NUMBER/CHECKBOX
          choiceType: (addon as any).choiceType || (addon.addOnMaxQuantity && addon.addOnMaxQuantity > 1 ? 'CHECKBOX' : 'CHECKBOX'),
          choices: (addon.choices || []).map((c) => ({
            name: c.name,
            price: c.price,
            isDefault: false, // Need to map if exists
            _id: c._id,
          })),
        });
      } else {
        reset({
          name: '',
          minChoice: 0,
          maxChoice: 1,
          choiceType: 'CHECKBOX',
          choices: [{ name: '', price: 0, isDefault: false }],
        });
      }
    }
  }, [isOpen, addon, reset]);

  // Logic: Auto-correct max if < min (user req)
  useEffect(() => {
    if (watchMin > watchMax) {
      setValue('maxChoice', watchMin);
    }
  }, [watchMin, watchMax, setValue]);

  const onSubmit = async (data: AddonFormValues) => {
    try {
      const payload: any = {
        name: data.name,
        compulsory: data.minChoice, // Mapping to legacy fields
        addOnMaxQuantity: data.maxChoice,
        choiceType: data.choiceType,
        choices: data.choices,
      };

      if (isEdit && addon) {
        if (isMergeMode) {
          await DraftOpsRepository.updateAddon(addon._id, businessId, payload);
          toast.success('Addon updated');
        } else {
          await DraftOpsRepository.updateAddon(addon._id, businessId, payload);
          toast.success('Addon updated');
        }
      } else {
        // CREATE MODE (Only allowed if NOT merged or explicitly handled)
        if (isMergeMode && selectedMenuId === 'ALL') {
          toast.error('Please select a specific menu to create addons.');
          return;
        }

        if (selectedMenuId === 'ALL') {
          toast.error('Please select a specific menu to create addons.');
          return;
        }

        // Offline-first: Write to Dexie + create draftOp (NO server call)
        const localId = await DraftOpsRepository.createAddon(
          businessId,
          selectedMenuId,
          {
            name: data.name,
            minChoice: data.minChoice,
            maxChoice: data.maxChoice,
            choiceType: data.choiceType,
            choices: data.choices,
          },
          [], // dishIds (can be linked later)
        );

        toast.success('Addon created locally. Push to server when ready.');
      }
      onClose();
    } catch (e) {
      console.error(e);
      toast.error('Failed to save addon');
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

        <div className="brutal-card m-6 overflow-hidden bg-white p-0 md:mx-auto md:max-w-2xl">
          <div className="border-b-4 border-black bg-white p-6">
            <h2 className="brutal-heading text-xl">{isEdit ? 'EDIT ADDON' : 'NEW ADDON'}</h2>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col">
            <ScrollArea className="h-[60vh] bg-gray-50 p-6">
              <div className="space-y-6">
                {/* Name */}
                <div className="brutal-card bg-white p-4">
                  <Label className="brutal-label">ADDON GROUP NAME *</Label>
                  <Input {...register('name')} className="brutal-input" placeholder="e.g. Choice of Toppings" />
                  {errors.name && <span className="text-xs font-bold text-red-600">{errors.name.message}</span>}
                </div>

                {/* Configuration */}
                <div className="brutal-card bg-white p-4">
                  <h3 className="brutal-heading mb-4 text-sm">CONFIGURATION</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="brutal-label">SELECTION TYPE</Label>
                      <Controller
                        control={control}
                        name="choiceType"
                        render={({ field }) => (
                          <RadioGroup onValueChange={field.onChange} value={field.value} className="mt-2 flex gap-4">
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="NUMBER" id="r-number" className="border-2 border-black" />
                              <Label htmlFor="r-number" className="font-bold">
                                NUMBER
                              </Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="CHECKBOX" id="r-checkbox" className="border-2 border-black" />
                              <Label htmlFor="r-checkbox" className="font-bold">
                                CHECKBOX
                              </Label>
                            </div>
                          </RadioGroup>
                        )}
                      />
                    </div>

                    <div className="flex gap-4">
                      <div className="flex-1">
                        <Label className="brutal-label">MIN CHOICE</Label>
                        <Input type="number" {...register('minChoice', { valueAsNumber: true })} className="brutal-input" />
                        {errors.minChoice && <span className="text-xs font-bold text-red-600">Invalid</span>}
                      </div>
                      <div className="flex-1">
                        <Label className="brutal-label">MAX CHOICE</Label>
                        <Input type="number" {...register('maxChoice', { valueAsNumber: true })} className="brutal-input" />
                        {errors.maxChoice && <span className="text-xs font-bold text-red-600">Invalid</span>}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Choices */}
                <div className="brutal-card bg-white p-4">
                  <div className="mb-4 flex items-center justify-between">
                    <h3 className="brutal-heading text-sm">CHOICES ({fields.length})</h3>
                    <Button
                      type="button"
                      size="sm"
                      onClick={() => append({ name: '', price: 0, isDefault: false })}
                      className="brutal-button bg-yellow-300 px-3 py-1 text-xs"
                    >
                      <HiPlus className="mr-1" /> ADD CHOICE
                    </Button>
                  </div>

                  <div className="space-y-2">
                    {fields.map((field, index) => (
                      <div key={field.id} className="flex items-center gap-2">
                        <div className="flex-1">
                          <Input {...register(`choices.${index}.name`)} placeholder="Choice Name" className="brutal-input text-xs" />
                          {errors.choices?.[index]?.name && <span className="text-[10px] text-red-600">Required</span>}
                        </div>
                        <div className="w-24">
                          <Input
                            type="number"
                            {...register(`choices.${index}.price`, { valueAsNumber: true })}
                            placeholder="Price"
                            className="brutal-input text-xs"
                          />
                        </div>
                        {/* Default Checkbox (Only if Multiple?) - User said optional default selected */}
                        <div className="flex items-center px-2">
                          <Controller
                            control={control}
                            name={`choices.${index}.isDefault`}
                            render={({ field: f }) => (
                              <Checkbox checked={f.value} onCheckedChange={f.onChange} className="border-2 border-black" title="Default Selected" />
                            )}
                          />
                        </div>
                        <Button
                          type="button"
                          variant="destructive"
                          size="icon"
                          className="h-8 w-8 border-2 border-black p-1"
                          onClick={() => remove(index)}
                        >
                          <HiTrash />
                        </Button>
                      </div>
                    ))}
                    {errors.choices && <p className="text-xs font-bold text-red-600">{errors.choices.message}</p>}
                  </div>
                </div>
              </div>
            </ScrollArea>

            <div className="border-t-4 border-black bg-white p-4">
              <div className="flex w-full justify-between gap-4">
                <Button type="button" variant="secondary" onClick={onClose} className="brutal-button w-1/3 bg-gray-200">
                  CANCEL
                </Button>
                <Button type="submit" disabled={!isValid || isSubmitting} className="brutal-button-primary w-2/3">
                  {isSubmitting ? 'SAVING...' : isEdit ? 'SAVE CHANGES' : 'CREATE ADDON'}
                </Button>
              </div>
            </div>
          </form>
        </div>
      </section>
    </PopUp>
  );
});
