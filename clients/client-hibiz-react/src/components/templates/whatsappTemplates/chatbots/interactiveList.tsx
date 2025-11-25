import type { InteractiveListMeta, InteractiveListNodeData, ListRow, ListSection } from '@/components/templates/whatsappTemplates/chatbots/types';
import DeleteButton from '@/components/templates/whatsappTemplates/deleteButton';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/components/utils/helper';
import { Handle, Position } from '@xyflow/react';
import { MessageCircle, Plus, X } from 'lucide-react';
import type { InteractiveListNodeProps } from './types';

export function InteractiveListNode({ data, selected }: InteractiveListNodeProps) {
  const m = normaliseMeta(data);

  const nid = () => `${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
  const addListSection = () => {
    const newSection = { id: `sec_${nid()}`, title: '', rows: [] };
    const updatedList = { ...m.list, sections: [...m.list.sections, newSection] };

    data.onPatch({ meta: { ...m, list: updatedList } });
  };

  const addListRow = (si: number) => {
    const newRowId = `row_${nid()}`;
    const updatedSections = m.list.sections.map((sec, i) =>
      i === si ? { ...sec, rows: [...sec.rows, { id: newRowId, title: '', description: '' }] } : sec,
    );

    data.onPatch({
      meta: {
        ...m,
        list: { ...m.list, sections: updatedSections },
        routes: { ...(m.routes || {}), [newRowId]: '' },
      },
    });
  };

  const updateListRow = (si: number, ri: number, patch: Partial<ListRow>) => {
    const updatedSections = m.list.sections.map((sec, i) =>
      si !== i ? sec : { ...sec, rows: sec.rows.map((row, j) => (j === ri ? { ...row, ...patch } : row)) },
    );
    data.onPatch({ meta: { ...m, list: { ...m.list, sections: updatedSections } } });
  };

  const removeListSection = (si: number) => {
    const updatedSections = m.list.sections.filter((_, i) => i !== si);
    data.onPatch({ meta: { ...m, list: { ...m.list, sections: updatedSections } } });
  };

  return (
    <div className="relative">
      <Handle type="target" position={Position.Left} className="z-50 !h-5 !w-5 !border-4 !border-white !bg-gray-600 shadow-xl" />
      <DeleteButton data={data} />

      <Card className={cn('w-96 border-2 shadow-2xl transition-all', selected ? 'border-blue-500 ring-4 ring-blue-300/30' : 'border-gray-300')}>
        {/* Header */}
        <div className="rounded-t-lg bg-gradient-to-r from-blue-600 to-purple-600 p-5 text-white">
          <div className="flex items-center gap-3">
            <MessageCircle className="h-6 w-6" />
            <h3 className="text-lg font-bold">List Message</h3>
          </div>
        </div>

        <CardContent className="space-y-5 p-4">
          {/* Header Text */}
          <div>
            <label className="text-xs font-medium text-gray-700">Header Text (Optional)</label>
            <Input
              placeholder="Menu Header"
              value={m.headerText || ''}
              onChange={(e) => data.onPatch({ meta: { ...m, headerText: e.target.value } })}
              className="mt-1"
            />
          </div>

          {/* Body Text */}
          <div>
            <label className="text-xs font-medium text-gray-700">Body Text</label>
            <Textarea
              placeholder="Main message (required)"
              value={m.bodyText || ''}
              onChange={(e) => data.onPatch({ meta: { ...m, bodyText: e.target.value } })}
              className="min-h-24"
            />
          </div>

          {/* Footer Text */}
          <div>
            <label className="text-xs font-medium text-gray-700">Footer Text (Optional)</label>
            <Input
              placeholder="Footer text..."
              value={m.footerText || ''}
              onChange={(e) => data.onPatch({ meta: { ...m, footerText: e.target.value } })}
            />
          </div>

          {/* Button Label */}
          <div>
            <label className="text-xs font-medium text-gray-700">List Button Text</label>
            <Input
              placeholder="e.g., View Menu"
              value={m.list?.buttonText || ''}
              onChange={(e) =>
                data.onPatch({
                  meta: { ...m, list: { ...m.list, buttonText: e.target.value } },
                })
              }
            />
          </div>

          {/* Sections */}
          <div className="space-y-5 rounded-xl border-2 border-gray-200 bg-white p-5">
            <div className="mb-4 flex items-center justify-between">
              <h4 className="font-bold text-gray-800">List Sections</h4>
              <Button size="sm" onClick={addListSection}>
                <Plus className="mr-1 h-4 w-4" /> Add Section
              </Button>
            </div>

            {(m.list.sections || []).map((section, si) => (
              <div key={section.id} className="rounded-xl border-2 border-gray-300 bg-gray-50 p-4">
                <div className="mb-3 flex justify-between">
                  <Input
                    placeholder="Section title"
                    value={section.title || ''}
                    onChange={(e) => {
                      const sections: ListSection[] = [...m.list.sections];
                      sections[si].title = e.target.value;
                      data.onPatch({
                        meta: { ...m, list: { ...m.list, sections } },
                      });
                    }}
                    className="text-lg font-semibold"
                  />
                  <Button size="icon" variant="ghost" onClick={() => removeListSection(si)}>
                    <X className="h-5 w-5" />
                  </Button>
                </div>

                <div className="ml-4 space-y-3">
                  {(section.rows || []).map((row, ri) => (
                    <div key={row.id} className="relative rounded-lg border border-gray-300 bg-white p-4 pr-14 transition-all hover:border-green-500">
                      <Handle
                        type="source"
                        position={Position.Right}
                        id={row.id}
                        className="z-50 -mr-2 !h-5 !w-5 !border-4 !border-white !bg-gray-600 shadow-xl"
                      />

                      <Input
                        placeholder="Option title"
                        value={row.title}
                        onChange={(e) => updateListRow(si, ri, { title: e.target.value })}
                        className="font-medium"
                      />
                      <Input
                        placeholder="Description (optional)"
                        value={row.description || ''}
                        onChange={(e) => updateListRow(si, ri, { description: e.target.value })}
                        className="mt-2 text-sm text-gray-600"
                      />
                    </div>
                  ))}

                  <Button size="sm" variant="outline" onClick={() => addListRow(si)} className="w-full">
                    + Add Option
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function normaliseMeta(data: InteractiveListNodeData): InteractiveListMeta {
  const raw = data.meta || {};

  const requiredDefaults: InteractiveListMeta = {
    type: 'interactive_list_message',
    layout: 'list',
    headerText: raw.headerText ?? '',
    bodyText: raw.bodyText ?? '',
    footerText: raw.footerText ?? '',
    list: {
      buttonText: raw.list?.buttonText ?? 'Choose',
      sections: raw.list?.sections ?? [],
    },
    routes: raw.routes ?? {},
  };

  const missing = raw.type !== 'interactive_list_message' || raw.layout !== 'list' || !raw.list || !raw.list.sections;

  if (missing) {
    data.onPatch({ meta: requiredDefaults });
  }

  return requiredDefaults;
}
