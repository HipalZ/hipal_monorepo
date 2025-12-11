import DeleteButton from '@/components/templates/whatsappTemplates/deleteButton';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/components/utils/helper';
import { Handle, Position } from '@xyflow/react';
import { MessageCircle, Plus, X } from 'lucide-react';
import type { ButtonItem, InteractiveButtonMeta, InteractiveButtonNodeProps } from './types';

export function InteractiveButtonNode({ data, selected }: InteractiveButtonNodeProps) {
  const m: InteractiveButtonMeta = data.meta ?? {
    layout: 'button',
    header: { type: 'none', mediaUrl: '', useUpload: false },
    bodyText: '',
    footerText: '',
    buttons: [{ id: 'btn_1', type: 'reply', title: '' }],
    list: { sections: [] },
    routes: {},
  };

  const nid = (): string => `btn_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;

  const addButton = (): void => {
    const newBtn: ButtonItem = { id: nid(), type: 'reply', title: '', url: '' };
    data.onPatch({ meta: { ...m, buttons: [...(m.buttons || []), newBtn] } });
  };

  const updateButton = (i: number, patch: Partial<ButtonItem>): void => {
    const buttons: ButtonItem[] = (m.buttons || []).map((b, idx) => (idx === i ? { ...b, ...patch } : b));
    data.onPatch({ meta: { ...m, buttons } });
  };

  const removeButton = (i: number): void => {
    const buttons: ButtonItem[] = (m.buttons || []).filter((_, idx) => idx !== i);
    data.onPatch({ meta: { ...m, buttons } });
  };

  return (
    <div className="relative">
      <Handle type="target" position={Position.Left} className="z-50 !h-5 !w-5 !border-4 !border-white !bg-gray-600 shadow-xl" />
      <DeleteButton data={data} />
      <Card
        className={cn(
          'w-96 overflow-hidden rounded-2xl border-2 shadow-xl transition-all',
          selected ? 'border-indigo-500 ring-4 ring-indigo-200/30' : 'border-gray-300',
        )}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-4 text-white">
          <div className="flex items-center gap-2">
            <MessageCircle className="h-6 w-6" />
            <h3 className="text-lg font-bold">Buttons</h3>
          </div>
        </div>

        <CardContent className="space-y-5 bg-gray-50 p-5">
          <div className="relative">
            <Textarea
              placeholder="Enter your message..."
              value={m.bodyText || ''}
              onChange={(e) => data.onPatch({ meta: { ...m, bodyText: e.target.value } })}
              className="min-h-24 border-gray-300 focus:border-indigo-500"
              maxLength={4096}
            />
            <div aria-hidden className="absolute bottom-2 right-3 select-none text-xs text-gray-500">
              {(m.bodyText || '').length} / 4096
            </div>
          </div>
          <div className="space-y-3">
            <p className="text-xs">*Max 3 buttons allowed</p>
            {(m.buttons || []).map((btn, i) => (
              <div
                key={btn.id}
                className="group relative gap-3 space-y-2 rounded-xl border border-gray-200 bg-white p-3 transition-all hover:border-indigo-400"
              >
                <Handle
                  type="source"
                  id={btn.id}
                  position={Position.Right}
                  className="z-50 mt-4 !h-5 !w-5 !border-4 !border-white !bg-blue-600 shadow-xl"
                />
                <div className="flex items-center">
                  <span className="rounded-md bg-indigo-600/10 px-2 py-1 text-xs font-medium text-indigo-700">Reply Button</span>
                </div>

                {/* Title Input */}
                <div className="relative">
                  <Input
                    placeholder="Button Text"
                    value={btn.title}
                    maxLength={20}
                    onChange={(e) => updateButton(i, { title: e.target.value })}
                    className="h-10 flex-1 text-sm font-medium focus:ring-0"
                  />
                  <div aria-hidden className="absolute bottom-2 right-3 select-none text-xs text-gray-500">
                    {(btn.title || '').length} / 20
                  </div>
                </div>
                {/* Remove Button */}
                <button
                  type="button"
                  onClick={() => removeButton(i)}
                  className="absolute -right-2 -top-2 rounded-full border border-red-100 bg-white p-1.5 text-red-500"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ))}
            <Button
              onClick={addButton}
              disabled={(m.buttons || []).length >= 3}
              size="sm"
              className="h-11 w-full rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 font-medium text-white shadow-md hover:from-indigo-700 hover:to-purple-700"
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Button
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
