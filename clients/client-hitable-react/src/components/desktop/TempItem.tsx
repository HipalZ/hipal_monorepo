import { zodResolver } from '@hookform/resolvers/zod';
import { memo, useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { useParams } from 'react-router-dom';
import { z } from 'zod';

import CommonBottomButton from '@/components/atoms/bottomButton';
import BottomPopUp from '@/components/atoms/universalPopup';

import { useHiClientZ } from '@/components/store/useHiClientzData';
import { useOrderStore } from '@/components/store/useOrderData';
import { useTempItemStore } from '@/components/store/useTempItemStore';

import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useGetAllOrders } from '../hooks/useOrder';
import { useCreateTempItem } from '../hooks/useTempItem';

const schema = z.object({
  itemName: z.string().min(1, 'Item name is required'),
  itemPrice: z.coerce.number().min(0, 'Price cannot be negative'),
  itemQuantity: z.coerce.number().int().min(1, 'Quantity must be at least 1'),
});

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

  const initialName = useTempItemStore((s) => s.initialName);
  const initialPrice = useTempItemStore((s) => s.initialPrice);
  const initialQty = useTempItemStore((s) => s.initialQty);
  const clear = useTempItemStore((s) => s.clear);

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      itemName: '',
      itemPrice: 0,
      itemQuantity: 1,
    },
    mode: 'onChange',
  });

  // seed defaults on open
  useEffect(() => {
    if (!show) return;
    form.reset({
      itemName: initialName ?? '',
      itemPrice: initialPrice === '' ? 0 : Number(initialPrice ?? 0),
      itemQuantity: initialQty ?? 1,
    });
  }, [show]);

  const resetToDefaults = () => {
    form.reset({
      itemName: initialName ?? '',
      itemPrice: initialPrice === '' ? 0 : Number(initialPrice ?? 0),
      itemQuantity: initialQty ?? 1,
    });
  };

  const hardReset = () => {
    clear();
    form.reset({ itemName: '', itemPrice: 0, itemQuantity: 1 });
  };

  const { mutate, isPending } = useCreateTempItem({
    onSuccess: () => {
      hardReset();
      onClose();
      refetchOrders();
    },
  });

  const values = form.watch();
  const isDirtyValid = useMemo(() => form.formState.isValid, [form.formState.isValid]);

  const handleSubmit = (data: FormValues) => {
    mutate({
      staffId: userDetails?._id || '',
      businessId: (businessId as string) || '',
      tableName: selectedTable?.name || '',
      itemName: data.itemName.trim(),
      itemPrice: data.itemPrice,
      itemQuantity: data.itemQuantity,
    });
  };

  return (
    <BottomPopUp
      show={show}
      onClose={() => {
        hardReset();
        onClose();
      }}
      hide
      rightTopBack
      width="w-full lg:w-[55dvw]"
      height="h-[100dvh] lg:h-[90dvh]"
    >
      <div className="mx-auto w-full max-w-2xl px-4 py-3">
        <h2 className="mb-3 text-xl font-semibold">Add Temp Item</h2>

        <Form {...form}>
          <form className="space-y-4" onSubmit={form.handleSubmit(handleSubmit)}>
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

            {/* Inline helpers */}
            <div className="bg-muted/50 rounded-md px-3 py-2 text-xs">
              <div>
                <span className="font-medium">Table:</span> {selectedTable?.name || '—'}
              </div>
              <div>
                <span className="font-medium">Staff:</span> {userDetails?.name || userDetails?._id || '—'}
              </div>
            </div>

            {/* Optional inline reset */}
            <div className="flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={resetToDefaults}
                className="text-muted-foreground hover:text-foreground text-xs underline underline-offset-2"
              >
                Reset to defaults
              </button>
              <button type="button" onClick={hardReset} className="text-muted-foreground hover:text-foreground text-xs underline underline-offset-2">
                Clear form
              </button>
            </div>
          </form>
        </Form>
      </div>

      {/* Your required bottom buttons */}
      <CommonBottomButton
        fixed={true}
        position="mid"
        maxWidth="30rem"
        buttons={[
          {
            text: '',
            onClick: () => {
              hardReset();
              onClose();
            },
            isBackButton: true,
            className: 'rounded-md pl-3',
          },
          {
            text: isPending ? 'Adding…' : 'Add Item',
            onClick: () => form.handleSubmit(handleSubmit)(),
            color: '#7c3aed',
            textColor: '#ffffff',
            disable: isPending || !isDirtyValid || !values.itemName,
            swipe: true,
          },
        ]}
      />
    </BottomPopUp>
  );
};

const TempItemModal = memo(MemoTempItemModal);
export default TempItemModal;
