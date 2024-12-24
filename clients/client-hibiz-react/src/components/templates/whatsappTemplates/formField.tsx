import { memo } from "react";

interface FormFieldProps {
  label: string;
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  required?: boolean;
  placeholder?: string;
  type?: string;
  maxLength?: number;
  note: string;
}

function MemoFormField({
  label,
  name,
  value,
  onChange,
  required,
  placeholder = "",
  maxLength,
  note,
}: FormFieldProps) {
  return (
    <div className="my-6">
      <label
        htmlFor={name}
        className="block mb-2 text-sm font-bold text-gray-700"
      >
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <article className="relative">
        <input
          type="text"
          id={name}
          name={name}
          value={value}
          onChange={onChange}
          required={required}
          placeholder={placeholder}
          maxLength={maxLength}
          className="w-full pl-2 pr-16 text-sm bg-white border border-gray-300 rounded-md focus:ring-0"
        />
        {maxLength && (
          <small className="absolute bottom-2 right-2">
            {value.length}/{maxLength}
          </small>
        )}
      </article>
      <strong className="text-sm">Note: {note}</strong>
      <div className="mb-4" />
    </div>
  );
}

const FormField = memo(MemoFormField);
export default FormField;
