import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { Plus, X } from 'lucide-react';
import { useState } from 'react';

export function VariableSelect({ value = [], options = [], onChange, onInsert }) {
  const [open, setOpen] = useState(false);
  const [inputValue, setInputValue] = useState('');

  const handleSelect = (val: string) => {
    if (!value.includes(val)) onChange([...value, val]);
    onInsert?.(val);
    setInputValue('');
    setOpen(false);
  };

  const handleCreate = () => {
    const newVar = inputValue.trim();
    if (newVar && !value.includes(newVar)) {
      onChange([...value, newVar]);
      onInsert?.(newVar);
      setInputValue('');
      setOpen(false);
    }
  };

  const handleRemove = (val: string) => onChange(value.filter((v) => v !== val));
  const hasSelection = value.length > 0;

  return (
    <div className="flex flex-col gap-2">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              'w-full justify-between border-gray-300 text-sm font-normal hover:border-emerald-400 hover:bg-emerald-50',
              hasSelection ? 'bg-emerald-50 text-emerald-700' : 'text-gray-500',
            )}
          >
            <span className="flex items-center gap-2">
              <Plus className="h-4 w-4 opacity-70" />
              {hasSelection ? `Selected ${value.length} variable${value.length > 1 ? 's' : ''}` : 'Choose or add variable'}
            </span>
          </Button>
        </PopoverTrigger>

        <PopoverContent className="w-[300px] p-0" align="start">
          <Command>
            <CommandInput placeholder="Search or create variable..." value={inputValue} onValueChange={setInputValue} />
            <CommandEmpty>
              {inputValue ? (
                <Button variant="ghost" className="w-full justify-start text-left text-emerald-600 hover:bg-emerald-50" onClick={handleCreate}>
                  <Plus className="mr-2 h-4 w-4" />
                  Create “{inputValue}”
                </Button>
              ) : (
                <p className="px-3 py-2 text-xs text-gray-500">No variables found</p>
              )}
            </CommandEmpty>

            <CommandGroup heading="Available Variables">
              {options.map((opt) => (
                <CommandItem
                  key={opt}
                  onSelect={() => handleSelect(opt)}
                  className={cn(
                    'cursor-pointer text-sm',
                    value.includes(opt) ? 'bg-emerald-50 text-emerald-600' : 'hover:bg-emerald-50 hover:text-emerald-700',
                  )}
                >
                  {opt}
                  {value.includes(opt) && <span className="ml-auto text-[10px] font-medium text-emerald-600">Inserted</span>}
                </CommandItem>
              ))}
            </CommandGroup>
          </Command>
        </PopoverContent>
      </Popover>

      {/* Selected badges */}
      {hasSelection && (
        <div className="flex flex-wrap gap-2">
          {value.map((v) => (
            <Badge
              key={v}
              variant="secondary"
              className="group flex items-center gap-1 bg-emerald-100 px-2 py-1 text-xs text-emerald-800 hover:bg-emerald-200"
            >
              {v}
              <X className="h-3 w-3 cursor-pointer opacity-60 transition hover:opacity-100" onClick={() => handleRemove(v)} />
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
}
