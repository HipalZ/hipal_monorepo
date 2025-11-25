import type { SendNodeProps } from '@/components/templates/whatsappTemplates/chatbots/chatbotHelpers';
import DeleteButton from '@/components/templates/whatsappTemplates/deleteButton';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/components/utils/helper';
import { Handle, Position } from '@xyflow/react';
import { FileInputIcon, FileText, Plus } from 'lucide-react';
import { useState } from 'react';
import toast from 'react-hot-toast';

export function AskNode({ data, selected }: SendNodeProps) {
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
    <div className="relative">
      <Handle type="target" position={Position.Left} className="z-50 !h-[0.75rem] !w-[0.75rem]" />

      <Card
        className={cn(
          'relative w-80 overflow-hidden border-2 shadow-lg transition-all',
          selected ? 'border-indigo-500 ring-2 ring-indigo-500 ring-opacity-20' : 'border-gray-300',
        )}
      >
        <div className="bg-gradient-to-r from-indigo-500 to-purple-600 p-4 text-white">
          <div className="flex items-center gap-2">
            <FileInputIcon className="h-5 w-5" />
            <h3 className="text-lg font-bold">Ask User</h3>
          </div>
          <DeleteButton data={data} />
        </div>

        <CardContent className="space-y-4 bg-gray-100 p-4">
          <div>
            <label className="mb-2 flex items-center gap-2 text-xs font-medium text-gray-700">
              <FileText className="h-3 w-3" />
              Question Prompt
            </label>
            <Textarea
              value={m.prompt || ''}
              onChange={(e) => data.onPatch({ meta: { ...m, prompt: e.target.value } })}
              placeholder="Ask something... (e.g., 'What's your name?')"
              className="min-h-16 resize-none border-gray-300 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          {/* STORE VARIABLE */}
          <div className="space-y-1.5">
            <label className="flex items-center gap-2 text-xs font-medium text-gray-700">
              <FileText className="h-3 w-3 text-emerald-600" />
              Store Response In (Optional)
            </label>

            <div className="flex items-center gap-2">
              <Input
                value={localVar}
                onChange={handleVariableTyping}
                placeholder="user name"
                prefix="@"
                className="text-sm transition-colors focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/50"
              />
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
        </CardContent>
      </Card>

      <Handle type="source" position={Position.Right} className="z-50 !h-[0.75rem] !w-[0.75rem]" />
    </div>
  );
}
