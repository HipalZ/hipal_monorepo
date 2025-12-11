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

  const removeListRow = (si: number, ri: number) => {
    const updatedSections = m.list.sections.map((sec, i) => (i === si ? { ...sec, rows: sec.rows.filter((_, j) => j !== ri) } : sec));

    data.onPatch({
      meta: {
        ...m,
        list: { ...m.list, sections: updatedSections },
      },
    });
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
            <label className="text-xs font-medium text-gray-700">header Text (Optional)</label>
            <div className="relative">
              <Input
                placeholder="Header text..."
                value={m.headerText || ''}
                onChange={(e) => data.onPatch({ meta: { ...m, headerText: e.target.value } })}
                maxLength={60}
                className="mt-1"
              />
              <div aria-hidden className="absolute bottom-2 right-3 select-none text-xs text-gray-500">
                {(m.headerText || '').length} / 60
              </div>
            </div>
          </div>
          {/* Body Text */}
          <div>
            <label className="text-xs font-medium text-gray-700">Body Text</label>
            <div className="relative">
              <Textarea
                placeholder="Main message (required)"
                value={m.bodyText || ''}
                onChange={(e) => data.onPatch({ meta: { ...m, bodyText: e.target.value } })}
                className="min-h-24 resize-none"
                maxLength={4096}
              />
              <div aria-hidden className="absolute bottom-2 right-3 select-none text-xs text-gray-500">
                {(m.bodyText || '').length} / 4096
              </div>
            </div>
          </div>

          {/* Footer Text */}
          <div>
            <label className="text-xs font-medium text-gray-700">Footer Text (Optional)</label>
            <div className="relative">
              <Input
                placeholder="Footer text..."
                value={m.footerText || ''}
                onChange={(e) => data.onPatch({ meta: { ...m, footerText: e.target.value } })}
                maxLength={60}
                className="mt-1"
              />
              <div aria-hidden className="absolute bottom-2 right-3 select-none text-xs text-gray-500">
                {(m.footerText || '').length} / 60
              </div>
            </div>
          </div>

          {/* Button Label */}
          <div>
            <label className="text-xs font-medium text-gray-700">List Button Text</label>
            <div className="relative">
              <Input
                placeholder="e.g., View Menu"
                value={m.list?.buttonText || ''}
                onChange={(e) =>
                  data.onPatch({
                    meta: { ...m, list: { ...m.list, buttonText: e.target.value } },
                  })
                }
                maxLength={20}
                className="mt-1"
              />
              <div aria-hidden className="absolute bottom-2 right-3 select-none text-xs text-gray-500">
                {(m.list?.buttonText || '').length} / 20
              </div>
            </div>
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
                    maxLength={24}
                    onChange={(e) => {
                      const sections = [...m.list.sections];
                      sections[si].title = e.target.value;
                      data.onPatch({ meta: { ...m, list: { ...m.list, sections } } });
                    }}
                    className="text-lg font-semibold"
                  />
                  <Button size="icon" variant="ghost" onClick={() => removeListSection(si)}>
                    <X className="h-5 w-5" />
                  </Button>
                </div>

                <div className="space-y-3">
                  {(section.rows || []).map((row, ri) => (
                    <div key={row.id} className="relative rounded-lg border border-gray-300 bg-white p-4 pr-7 transition-all hover:border-green-500">
                      <Handle
                        type="source"
                        position={Position.Right}
                        id={row.id}
                        style={{ right: '-10%' }}
                        className="z-50 !h-6 !w-6 rounded-full !border-4 !border-white !bg-blue-600 shadow-xl hover:!bg-blue-700"
                      />
                      <div className="relative w-full">
                        <Input
                          placeholder="Row title"
                          value={row.title}
                          onChange={(e) => updateListRow(si, ri, { title: e.target.value })}
                          className="font-medium"
                          maxLength={24}
                        />
                        <div aria-hidden className="absolute bottom-2 right-3 select-none text-xs text-gray-500">
                          {(row.title || '').length} / 24
                        </div>
                      </div>

                      <div className="relative mt-2">
                        <Input
                          placeholder="Description (optional)"
                          value={row.description || ''}
                          onChange={(e) => updateListRow(si, ri, { description: e.target.value })}
                          className="h-16 text-sm text-gray-600"
                          maxLength={72}
                        />
                        <div aria-hidden className="absolute bottom-2 right-3 select-none text-xs text-gray-500">
                          {(row.description || '').length} / 72
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeListRow(si, ri)}
                        className="absolute -right-2 -top-2 rounded-full border border-red-100 bg-white p-1.5 text-red-500"
                      >
                        <X className="h-4 w-4" />
                      </button>
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
