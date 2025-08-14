import type { ChangeEvent, FC } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export const FieldWithCounter: FC<{
  id: string;
  label: string;
  value: string;
  maxLength: number;
  onChange: (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  isTextarea?: boolean;
}> = ({ id, label, value, maxLength, onChange, isTextarea }) => (
  <div className="space-y-1 w-full">
    {label && (
      <div className="flex justify-between items-center">
        <Label htmlFor={id}>{label}</Label>
        <span className="text-xs text-gray-500">
          {value?.length || 0}/{maxLength}
        </span>
      </div>
    )}
    <div className="relative">
      {isTextarea ? (
        <Textarea
          id={id}
          value={value || ""}
          maxLength={maxLength}
          onChange={onChange}
          className="resize-none"
        />
      ) : (
        <Input
          id={id}
          value={value || ""}
          maxLength={maxLength}
          onChange={onChange}
        />
      )}
      {!label && (
        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-500">
          {value?.length || 0}/{maxLength}
        </span>
      )}
    </div>
  </div>
);
