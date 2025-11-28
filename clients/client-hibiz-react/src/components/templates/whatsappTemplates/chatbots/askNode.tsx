import type { SendNodeProps } from '@/components/templates/whatsappTemplates/chatbots/types';
import DeleteButton from '@/components/templates/whatsappTemplates/deleteButton';
import { Card, CardContent } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/components/utils/helper';
import { Handle, Position } from '@xyflow/react';
import { FileInputIcon, FileText } from 'lucide-react';
import StoreVariable from './storeVariable';

export function AskNode({ data, selected }: SendNodeProps) {
  const m = data.meta || {};

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
            <div className="relative">
              <Textarea
                value={m.prompt || ''}
                maxLength={72}
                onChange={(e) => data.onPatch({ meta: { ...m, prompt: e.target.value } })}
                placeholder="Ask something..."
                className="min-h-16 resize-none border-gray-300 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
              />
              <div aria-hidden className="absolute bottom-2 right-3 select-none text-xs text-gray-500">
                {(m.prompt || '').length} / 72
              </div>
            </div>
          </div>

          {/* STORE VARIABLE */}
          <StoreVariable data={data} />
        </CardContent>
      </Card>

      <Handle type="source" position={Position.Right} className="z-50 !h-[0.75rem] !w-[0.75rem]" />
    </div>
  );
}
