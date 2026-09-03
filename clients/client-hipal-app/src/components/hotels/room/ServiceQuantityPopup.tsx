"use client";

import type { IService } from "@/components/hooks/useServicesHotel";
import { Info, Minus, Package, Plus, Trash2, X } from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

interface ServiceQuantityPopupProps {
  service: IService;
  quantityLimit: number;
  initialQuantity: number;
  instructionMessage?: string;
  onClose: () => void;
  onConfirm: (quantity: number) => void;
  onRemove: () => void;
}

export default function ServiceQuantityPopup({
  service,
  quantityLimit,
  initialQuantity,
  instructionMessage,
  onClose,
  onConfirm,
  onRemove,
}: ServiceQuantityPopupProps) {
  const [quantity, setQuantity] = useState(Math.max(1, initialQuantity || 1));
  const hasExistingSelection = initialQuantity > 0;
  const hasQuantityControls = quantityLimit > 1;

  useEffect(() => {
    setQuantity(Math.max(1, initialQuantity || 1));
  }, [initialQuantity, service._id]);

  const decrease = () => setQuantity((value) => Math.max(1, value - 1));
  const increase = () => setQuantity((value) => Math.min(quantityLimit, value + 1));

  if (typeof document === "undefined") return null;

  return createPortal(
    <div className="fixed inset-0 z-[2200] flex items-end justify-center bg-black/25 px-3 pb-3 pt-10 backdrop-blur-sm">
      <section className="plus-jakarta-font w-full max-w-md overflow-hidden rounded-t-[28px] bg-white text-[#111111] shadow-[0_-12px_32px_rgba(15,23,42,0.16)] sm:rounded-[28px]">
        <div className="flex items-start justify-between gap-3 border-b border-[#EEE8DF] px-5 pb-4 pt-5">
          <div className="flex min-w-0 items-center gap-3">
            {service.image ? (
              <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-[16px] border border-[#E9E4DC] bg-[#F8F5F0]">
                <Image
                  src={service.image}
                  alt={service.name}
                  width={48}
                  height={48}
                  className="h-12 w-12 object-contain p-1"
                />
              </div>
            ) : (
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[16px] bg-[#111111] text-white">
                <Package className="h-5 w-5" />
              </div>
            )}
            <div className="min-w-0">
              <h3 className="truncate text-[1.05rem] font-semibold leading-tight text-[#17120E]">{service.name}</h3>
              <p className="mt-1 text-[0.82rem] font-medium leading-snug text-[#766E66]">
                {hasQuantityControls ? "Select quantity for this request" : "Confirm this request"}
              </p>
            </div>
          </div>
          <button
            type="button"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[#E9E4DC] bg-white text-[#3B332C] shadow-sm transition active:scale-95"
            onClick={onClose}
            aria-label="Close quantity selection"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="space-y-5 px-5 pb-5 pt-4">
          <div className="flex items-start gap-3 rounded-[18px] border border-[#E9E4DC] bg-[#F8F5F0] px-4 py-3 text-[0.88rem] font-medium leading-5 text-[#4A433D]">
            <Info className="mt-0.5 h-4 w-4 shrink-0 text-[#4A433D]" />
            <div className="space-y-1">
              {instructionMessage ? <p>{instructionMessage}</p> : null}
              {hasQuantityControls ? (
                <p>
                  You can request up to <span className="font-semibold text-[#17120E]">{quantityLimit}</span> {service.name} at a time.
                </p>
              ) : null}
            </div>
          </div>

          {hasQuantityControls ? (
            <div>
              <p className="mb-3 text-sm font-semibold text-[#17120E]">Quantity</p>
              <div className="mx-auto grid h-14 w-full max-w-[18rem] grid-cols-[3.5rem_1fr_3.5rem] overflow-hidden rounded-full border border-[#E4DED7] bg-white shadow-sm">
                <button
                  type="button"
                  className="flex h-full items-center justify-center border-r border-[#E4DED7] text-[#111111] transition active:bg-[#F8F5F0] disabled:cursor-not-allowed disabled:text-neutral-300"
                  disabled={quantity <= 1}
                  onClick={decrease}
                  aria-label={`Decrease ${service.name} quantity`}
                >
                  <Minus className="h-5 w-5" />
                </button>
                <div className="flex h-full items-center justify-center text-2xl font-semibold tabular-nums text-[#111111]">
                  {quantity}
                </div>
                <button
                  type="button"
                  className="flex h-full items-center justify-center border-l border-[#E4DED7] text-[#111111] transition active:bg-[#F8F5F0] disabled:cursor-not-allowed disabled:text-neutral-300"
                  disabled={quantity >= quantityLimit}
                  onClick={increase}
                  aria-label={`Increase ${service.name} quantity`}
                >
                  <Plus className="h-5 w-5" />
                </button>
              </div>
              <p className="mt-3 text-center text-xs font-medium text-[#766E66]">Max {quantityLimit} at a time</p>
            </div>
          ) : null}

          <div className="grid grid-cols-2 gap-3 pt-1">
            <button
              type="button"
              className="flex h-11 items-center justify-center gap-2 rounded-2xl border border-[#E4DED7] bg-white text-[0.92rem] font-semibold text-[#17120E] shadow-sm transition active:scale-[0.98]"
              onClick={hasExistingSelection ? onRemove : onClose}
            >
              {hasExistingSelection ? "Remove" : "Cancel"}
              {hasExistingSelection ? <Trash2 className="h-4 w-4" /> : null}
            </button>
            <button
              type="button"
              className="h-11 rounded-2xl bg-[#111111] text-[0.92rem] font-semibold text-white shadow-sm transition active:scale-[0.98]"
              onClick={() => onConfirm(quantity)}
            >
              Confirm
            </button>
          </div>
        </div>
      </section>
    </div>,
    document.body,
  );
}
