import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { FileText, Plus } from 'lucide-react';
import { useState } from 'react';
import toast from 'react-hot-toast';

const StoreVariable = ({ data }: any) => {
  const m = data.meta || {};
  const [localVar, setLocalVar] = useState(m.variable?.replace(/^@/, '') || '');

  const handleVariableTyping = (e) => setLocalVar(e.target.value);
  const handleAddVariable = () => {
    const inputValue = localVar.trim().replace(/^@/, '');
    if (!inputValue) return;
    const freshMeta = data.meta || {};

    data.onPatch({
      meta: { ...freshMeta, variable: inputValue },
    });

    if (Array.isArray(data.variables) && typeof data.onVariableAdd === 'function') {
      data.onVariableAdd([inputValue]);
    }
    toast.success('variable added');
  };
  return (
    <>
      {/* STORE VARIABLE */}
      <div className="space-y-1.5">
        <label className="flex items-center gap-2 text-xs font-medium text-gray-700">
          <FileText className="h-3 w-3 text-emerald-600" />
          Store Response In (Optional)
        </label>

        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Input
              value={localVar}
              onChange={handleVariableTyping}
              placeholder="user name"
              prefix="@"
              maxLength={16}
              className="text-sm transition-colors focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/50"
            />
            <div aria-hidden className="absolute right-3 top-1/2 -translate-y-1/2 select-none text-xs text-gray-500">
              {localVar.length} / 16
            </div>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleAddVariable}
            disabled={!localVar.trim()}
            className="bg-emerald-400 text-white"
          >
            <Plus className="mr-1 h-3 w-3" />
            Add
          </Button>
        </div>
        <Badge variant="outline" className="bg-orange-100 text-xs text-orange-800">
          {m.variable?.replace(/^@/, '')}
        </Badge>
      </div>
    </>
  );
};

export default StoreVariable;
