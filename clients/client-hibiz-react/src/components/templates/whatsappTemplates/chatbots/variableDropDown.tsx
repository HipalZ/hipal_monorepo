import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface VariableDropdownProps {
  value: string | null | undefined;
  onChange: (value: string) => void;
  variables?: string[];
  flowParams?: string[];
  placeholder?: string;
}

export function VariableDropdown({ value, onChange, variables = [], flowParams = [], placeholder = 'Select variable' }: VariableDropdownProps) {
  const formatDisplay = (item: string): string => {
    if (flowParams.includes(item)) return item;
    if (variables.includes(item)) return `{{${item}}}`;
    return item;
  };

  return (
    <Select value={value || undefined} onValueChange={onChange}>
      <SelectTrigger className="h-8 text-xs">
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>

      <SelectContent className="w-[180px]">
        {flowParams.length > 0 && (
          <div className="px-2 py-1">
            <div className="px-2 py-1 text-xs font-medium uppercase tracking-wide text-gray-500">Stored variables</div>

            {flowParams.map((param) => (
              <SelectItem key={param} value={param} className="text-xs">
                {formatDisplay(param)}
              </SelectItem>
            ))}
          </div>
        )}
      </SelectContent>
    </Select>
  );
}
