"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface GuestSelectionProps {
  selectedGuests: number | null;
  onGuestSelect: (count: number) => void;
  onContinue: () => void;
}

export default function GuestSelection({
  selectedGuests,
  onGuestSelect,
  onContinue,
}: GuestSelectionProps) {
  // Generate numbers 1-30 for guest selection
  const guestNumbers = Array.from({ length: 30 }, (_, i) => i + 1);

  return (
    <div className="p-6 pb-24">
      <div className="text-center mb-6">
        <div className="w-12 h-1 bg-gray-300 rounded-full mx-auto mb-6" />
        <h2 className="text-2xl font-bold text-gray-800">How many guests?</h2>
        <p className="text-gray-500 mt-2">Please select the number of guests</p>
      </div>

      <div className="grid grid-cols-5 gap-2 mb-8">
        {guestNumbers.map((num) => (
          <button
            type="button"
            key={num}
            onClick={() => onGuestSelect(num)}
            className={cn(
              "h-12 rounded-lg font-medium transition-all",
              selectedGuests === num
                ? "bg-purple-600 text-white shadow-md scale-105"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200",
            )}
          >
            {num}
          </button>
        ))}
      </div>

      <Button
        className="w-full bg-purple-600 hover:bg-purple-700 text-white py-3 rounded-lg font-medium"
        disabled={selectedGuests === null}
        onClick={onContinue}
      >
        Continue
      </Button>
    </div>
  );
}
