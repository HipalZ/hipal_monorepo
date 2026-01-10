import { zodResolver } from '@hookform/resolvers/zod';
import { memo, useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { useParams } from 'react-router-dom';
import { z } from 'zod';

import { useHiClientZ } from '@/components/store/useHiClientzData';
import { useOrderStore } from '@/components/store/useOrderData';
import { useTempItemStore } from '@/components/store/useTempItemStore';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Sheet, SheetContent, SheetFooter, SheetHeader, SheetTitle } from '@/components/ui/sheet';

import { useGetAllKitchenByBusiness } from '@/components/hooks/useKitchenHook.ts';
import { useGetAllOrders } from '../hooks/useOrder';
import { useCreateTempItem } from '../hooks/useTempItem';

const schema = z
  .object({
    itemName: z.string().min(1, 'Item name is required'),
    itemPrice: z.coerce
      .number()
      .min(0, 'Price cannot be negative')
      .refine((v) => !Number.isNaN(v), 'Enter a valid number'),
    itemQuantity: z.coerce.number().int('Quantity must be a whole number').min(1, 'Quantity must be at least 1'),
    kitchenId: z.string().min(1, 'Kitchen is required'),
    addGst: z.boolean().default(false),
    gstType: z.enum(['0', '5', '18', 'custom']).optional(),
    customGst: z.coerce
      .number()
      .min(0, 'GST cannot be negative')
      .max(100, 'GST cannot exceed 100%')
      .refine((v) => !Number.isNaN(v), 'Enter a valid number')
      .optional(),
  })
  .refine(
    (data) => {
      // If addGst is true, gstType must be selected
      if (data.addGst && !data.gstType) {
        return false;
      }
      // If gstType is 'custom', customGst must be provided
      if (data.gstType === 'custom' && (!data.customGst || data.customGst <= 0)) {
        return false;
      }
      return true;
    },
    {
      message: 'Please select a GST rate or enter custom GST',
      path: ['gstType'],
    },
  );

type FormValues = z.infer<typeof schema>;

type Props = {
  show: boolean;
  onClose: () => void;
};

const MemoTempItemModal = ({ show, onClose }: Props) => {
  const { businessId } = useParams();

  const selectedTable = useOrderStore((s) => s.selectedTable);
  const userDetails = useHiClientZ((s) => s.captainData);
  const { refetch: refetchOrders } = useGetAllOrders();

  const { kitchenByBusinessData: kitchenData } = useGetAllKitchenByBusiness();

  const initialName = useTempItemStore((s) => s.initialName);
  const initialPrice = useTempItemStore((s) => s.initialPrice);
  const initialQty = useTempItemStore((s) => s.initialQty);
  const clearTempDefaults = useTempItemStore((s) => s.clear);

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      itemName: '',
      itemPrice: 0,
      itemQuantity: 1,
      kitchenId: '',
      addGst: false,
      gstType: undefined,
      customGst: undefined,
    },
    mode: 'onChange',
  });

  // Watch fields we care about
  const kitchenIdValue = form.watch('kitchenId');
  const itemName = form.watch('itemName');
  const addGst = form.watch('addGst');
  const gstType = form.watch('gstType');

  // Seed defaults for item fields when opening, keep whatever kitchen is set
  useEffect(() => {
    if (!show) return;

    form.reset({
      itemName: initialName ?? '',
      itemPrice: initialPrice === '' ? 0 : Number(initialPrice ?? 0),
      itemQuantity: initialQty ?? 1,
      kitchenId: form.getValues('kitchenId') || '',
      addGst: false,
      gstType: undefined,
      customGst: undefined,
    });
  }, [show, initialName, initialPrice, initialQty, form]);

  // Auto-select first kitchen only when nothing is selected
  useEffect(() => {
    if (!show) return;
    if (!kitchenIdValue && kitchenData && kitchenData.length > 0) {
      form.setValue('kitchenId', kitchenData[0]._id, { shouldValidate: true });
    }
  }, [show, kitchenIdValue, kitchenData, form]);

  // Reset GST fields when checkbox is unchecked
  useEffect(() => {
    if (!addGst) {
      form.setValue('gstType', undefined);
      form.setValue('customGst', undefined);
    }
  }, [addGst, form]);

  const hardReset = () => {
    clearTempDefaults();
    form.reset({
      itemName: '',
      itemPrice: 0,
      itemQuantity: 1,
      kitchenId: kitchenData?.[0]?._id ?? '',
      addGst: false,
      gstType: undefined,
      customGst: undefined,
    });
  };

  const { mutate, isPending } = useCreateTempItem({
    onSuccess: () => {
      hardReset();
      onClose();
      refetchOrders();
    },
  });

  const isValid = useMemo(() => form.formState.isValid, [form.formState.isValid]);

  const handleSubmit = (data: FormValues) => {
    // Calculate final GST value
    let gstValue: number | undefined = undefined;
    if (data.addGst && data.gstType) {
      if (data.gstType === 'custom' && data.customGst) {
        gstValue = data.customGst;
      } else {
        gstValue = Number(data.gstType);
      }
    }

    mutate({
      staffId: userDetails?._id || '',
      businessId: (businessId as string) || '',
      tableName: selectedTable?.name || '',
      itemName: data.itemName.trim(),
      itemPrice: data.itemPrice,
      itemQuantity: data.itemQuantity,
      kitchenId: data.kitchenId,
      gst: gstValue,
    });
  };
  //690f391f05c6e57c87cd83e9
  //6907983c24800dc542a9c926
  const handleClose = () => {
    hardReset();
    onClose();
  };

  const isSubmitDisabled = isPending || !isValid || !itemName;

  return (
    <Sheet open={show} onOpenChange={(open) => !open && handleClose()}>
      <SheetContent side="right" className="flex h-full w-full max-w-md flex-col border-l p-0">
        {/* Header */}
        <SheetHeader className="px-4 pt-4 text-left">
          <SheetTitle className="text-2xl font-bold">Add Temp Item</SheetTitle>
          <p className="text-muted-foreground mt-1 text-sm font-semibold">Create a one-time custom item for this table.</p>
        </SheetHeader>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-4 pb-4 pt-3">
          <Form {...form}>
            <form className="space-y-4" onSubmit={form.handleSubmit((data) => handleSubmit(data as FormValues))}>
              {/* Item name */}
              <FormField
                control={form.control}
                name="itemName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Item name</FormLabel>
                    <FormControl>
                      <Input placeholder="Eg. Custom Salad" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Price + Quantity */}
              <div className="grid grid-cols-2 gap-3">
                <FormField
                  control={form.control}
                  name="itemPrice"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Price</FormLabel>
                      <FormControl>
                        <Input type="number" inputMode="decimal" placeholder="0" {...field} onChange={(e) => field.onChange(e.target.value)} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="itemQuantity"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Quantity</FormLabel>
                      <FormControl>
                        <Input type="number" inputMode="numeric" min={1} {...field} onChange={(e) => field.onChange(e.target.value)} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Kitchen select */}
              <FormField
                control={form.control}
                name="kitchenId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Kitchen</FormLabel>
                    <FormControl>
                      <Select value={field.value} onValueChange={field.onChange}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select kitchen" />
                        </SelectTrigger>
                        <SelectContent>
                          {kitchenData?.map((kitchen) => (
                            <SelectItem key={kitchen._id} value={kitchen._id}>
                              {kitchen.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Add GST Checkbox */}
              <FormField
                control={form.control}
                name="addGst"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                    <FormControl>
                      <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel className="cursor-pointer">Add GST</FormLabel>
                      <p className="text-muted-foreground text-xs">Apply GST tax to this item</p>
                    </div>
                  </FormItem>
                )}
              />

              {/* GST Options - Show when addGst is checked */}
              {addGst && (
                <FormField
                  control={form.control}
                  name="gstType"
                  render={({ field }) => (
                    <FormItem className="space-y-3">
                      <FormLabel>GST Rate (%)</FormLabel>
                      <FormControl>
                        <RadioGroup onValueChange={field.onChange} value={field.value} className="flex flex-col space-y-1">
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="0" id="gst-0" />
                            <label htmlFor="gst-0" className="cursor-pointer text-sm font-medium leading-none">
                              0%
                            </label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="5" id="gst-5" />
                            <label htmlFor="gst-5" className="cursor-pointer text-sm font-medium leading-none">
                              5%
                            </label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="18" id="gst-18" />
                            <label htmlFor="gst-18" className="cursor-pointer text-sm font-medium leading-none">
                              18%
                            </label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="custom" id="gst-custom" />
                            <label htmlFor="gst-custom" className="cursor-pointer text-sm font-medium leading-none">
                              Custom
                            </label>
                          </div>
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              {/* Custom GST Input - Show when custom is selected */}
              {addGst && gstType === 'custom' && (
                <FormField
                  control={form.control}
                  name="customGst"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Custom GST (%)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          inputMode="decimal"
                          placeholder="Enter GST percentage"
                          min={0}
                          max={100}
                          {...field}
                          onChange={(e) => field.onChange(e.target.value)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              {/* Inline helpers */}
              <div className="bg-muted/50 rounded-md px-3 py-2 text-xs">
                <div>
                  <span className="font-medium">Table:</span> {selectedTable?.name || '—'}
                </div>
                <div>
                  <span className="font-medium">Staff:</span> {userDetails?.name || userDetails?._id || '—'}
                </div>
              </div>

              {/* Small text actions if you want them */}
              {/* 
              <div className="flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => {
                    form.reset({
                      itemName: initialName ?? "",
                      itemPrice:
                        initialPrice === "" ? 0 : Number(initialPrice ?? 0),
                      itemQuantity: initialQty ?? 1,
                      kitchenId: form.getValues("kitchenId") || "",
                    });
                  }}
                  className="text-xs font-medium text-muted-foreground underline underline-offset-2"
                >
                  Reset to defaults
                </button>
                <button
                  type="button"
                  onClick={hardReset}
                  className="text-xs font-medium text-muted-foreground underline underline-offset-2"
                >
                  Clear form
                </button>
              </div>
              */}
            </form>
          </Form>
        </div>

        {/* Footer with bottom buttons INSIDE sheet */}
        <SheetFooter className="border-t px-4 py-3">
          <div className="flex w-full items-center justify-between gap-2">
            <Button type="button" variant="outline" className="flex-1" onClick={handleClose} disabled={isPending}>
              Cancel
            </Button>
            <Button type="button" className="flex-1" onClick={() => form.handleSubmit(handleSubmit)()} disabled={isSubmitDisabled}>
              {isPending ? 'Adding…' : 'Add Item'}
            </Button>
          </div>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
};

const TempItemModal = memo(MemoTempItemModal);
export default TempItemModal;
