import DeleteButton from '@/components/templates/whatsappTemplates/deleteButton';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/components/utils/helper';
import { useMediaUpload } from '@/hooks/useTemplates';
import { Handle, Position } from '@xyflow/react';
import { FileText, MessageCircle, Plus, Upload, X } from 'lucide-react';
import { useState } from 'react';

export function InteractiveReply({ data, selected }) {
  const m = data.meta ?? {
    layout: 'button',
    header: { type: 'none', mediaUrl: '', useUpload: false },
    bodyText: '',
    footerText: '',
    buttons: [{ id: 'btn_1', type: 'reply', title: 'Option 1' }],
    list: { sections: [] },
    routes: {},
  };

  const { uploadMediaPassFile } = useMediaUpload();
  const [uploading, setUploading] = useState(false);
  const [localVar, setLocalVar] = useState(m.variable?.replace(/^@/, '') || '');

  // Local variable typing
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
  const nid = () => `${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;

  // === BUTTON LOGIC ===
  const addButton = () => {
    const newBtn = { id: `btn_${nid()}`, type: 'reply', title: '', url: '' };
    data.onPatch({ meta: { ...m, buttons: [...(m.buttons || []), newBtn] } });
  };

  const updateButton = (i, patch) => {
    const buttons = (m.buttons || []).map((b, idx) => (idx === i ? { ...b, ...patch } : b));
    data.onPatch({ meta: { ...m, buttons } });
  };

  const removeButton = (i) => {
    const buttons = (m.buttons || []).filter((_, idx) => idx !== i);
    data.onPatch({ meta: { ...m, buttons } });
  };

  // === LIST LOGIC (unchanged) ===
  const addListSection = () => {
    const newSection = { id: `sec_${nid()}`, title: '', rows: [] };
    data.onPatch({
      meta: {
        ...m,
        list: {
          ...(m.list || {}),
          sections: [...(m.list?.sections || []), newSection],
        },
      },
    });
  };
  const addListRow = (sectionIndex) => {
    const sections = (m.list?.sections || []).map((s, idx) =>
      idx === sectionIndex
        ? {
            ...s,
            rows: [...(s.rows || []), { id: `row_${nid()}`, title: '', description: '' }],
          }
        : s,
    );
    data.onPatch({
      meta: { ...m, list: { ...(m.list || {}), sections } },
    });
  };
  const updateListRow = (sectionIndex, rowIndex, patch) => {
    const sections = (m.list?.sections || []).map((s, idx) => {
      if (idx !== sectionIndex) return s;
      const rows = (s.rows || []).map((r, i) => (i === rowIndex ? { ...r, ...patch } : r));
      return { ...s, rows };
    });
    data.onPatch({
      meta: { ...m, list: { ...(m.list || {}), sections } },
    });
  };
  const removeListSection = (sectionIndex) => {
    const sections = (m.list?.sections || []).filter((_, idx) => idx !== sectionIndex);
    data.onPatch({
      meta: { ...m, list: { ...(m.list || {}), sections } },
    });
  };

  const handleHeaderUpload = async (file) => {
    if (!file) return;
    try {
      setUploading(true);
      const { url } = await uploadMediaPassFile(file);
      data.onPatch({
        meta: {
          ...m,
          header: { ...m.header, type: 'image', mediaUrl: url, fileName: file.name },
        },
      });
    } catch (err) {
      console.error('Header upload failed', err);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="relative">
      <Handle type="target" position={Position.Left} className="z-50 !h-5 !w-5 !border-4 !border-white !bg-gray-600 shadow-xl" />

      <Card className={cn('w-96 border-2 shadow-2xl transition-all', selected ? 'border-blue-500 ring-4 ring-blue-300/30' : 'border-gray-300')}>
        <DeleteButton data={data} />

        {/* Header */}
        <div className="rounded-t-lg bg-gradient-to-r from-blue-600 to-purple-600 p-5 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <MessageCircle className="h-7 w-7" />
              <h3 className="text-xl font-bold">Interactives</h3>
            </div>
            <Select value={m.layout || 'none'} onValueChange={(v) => data.onPatch({ meta: { ...m, layout: v } })}>
              <SelectTrigger className="h-10 w-36 border-white/30 bg-white/20 text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="button">Buttons</SelectItem>
                <SelectItem value="list">List Menu</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* BODY */}
        <CardContent className="space-y-4 p-4">
          {/* Header Upload Section */}
          <Card className="border bg-white shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-700">Header (Optional)</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Select
                value={m.header?.type || 'none'}
                onValueChange={(type) =>
                  data.onPatch({
                    meta: {
                      ...m,
                      header: { type, mediaUrl: '', useUpload: false },
                    },
                  })
                }
              >
                <SelectTrigger className="h-9">
                  <SelectValue placeholder="Choose header type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  <SelectItem value="image">Image</SelectItem>
                </SelectContent>
              </Select>

              {m.header?.type === 'image' && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-medium text-gray-700">Image Upload or URL</label>
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-xs"
                      onClick={() =>
                        data.onPatch({
                          meta: {
                            ...m,
                            header: {
                              ...m.header,
                              useUpload: !m.header?.useUpload,
                              mediaUrl: '',
                            },
                          },
                        })
                      }
                    >
                      {m.header?.useUpload ? 'Use URL' : 'Upload File'}
                    </Button>
                  </div>

                  {m.header?.useUpload ? (
                    <>
                      {/* Upload Button — shown only if no image */}
                      {!m.header?.mediaUrl && (
                        <label className="relative flex h-12 cursor-pointer items-center justify-center gap-2 rounded bg-gray-200 text-xs text-gray-700 hover:text-blue-600">
                          <Upload className="h-4 w-4" />
                          <input type="file" accept="image/*" className="hidden" onChange={(e) => handleHeaderUpload(e.target.files?.[0])} />
                          {uploading ? 'Uploading...' : 'Click to upload image'}
                        </label>
                      )}

                      {/* Preview with Delete Option */}
                      {m.header?.mediaUrl && (
                        <div className="relative">
                          <img src={m.header.mediaUrl} alt="Header Preview" className="h-full w-full rounded-lg border object-cover" />

                          {/* Delete Icon */}
                          <button
                            type="button"
                            onClick={() =>
                              data.onPatch({
                                meta: { ...m, header: { ...m.header, mediaUrl: '', fileName: '' } },
                              })
                            }
                            className="absolute right-1 top-1 rounded-full bg-white/80 p-1 text-red-500 shadow hover:bg-red-100"
                            title="Remove image"
                          >
                            <X className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      )}
                    </>
                  ) : (
                    <Input
                      value={m.header?.mediaUrl || ''}
                      onChange={(e) =>
                        data.onPatch({
                          meta: {
                            ...m,
                            header: { ...m.header, mediaUrl: e.target.value },
                          },
                        })
                      }
                      placeholder="https://example.com/header-image.png"
                      className="border-gray-300 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    />
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Body and Footer */}
          <div>
            <label className="text-xs font-medium text-gray-700">Body Text</label>
            <Textarea
              value={m.bodyText || ''}
              onChange={(e) => data.onPatch({ meta: { ...m, bodyText: e.target.value } })}
              placeholder="Message content..."
              className="focus:border-bg-white min-h-40 resize-none border-gray-300 bg-white"
            />
          </div>

          {/* Footer */}
          <Input
            placeholder="Footer text (optional)"
            value={m.footerText}
            onChange={(e) => data.onPatch({ meta: { ...m, footerText: e.target.value } })}
          />

          {/* BUTTONS LAYOUT - FULLY RESTORED */}
          {m.layout === 'button' && (
            <div className="space-y-4 rounded-xl border-2 border-gray-200 bg-white p-5">
              <div className="mb-4 flex items-center justify-between">
                <h4 className="flex items-center gap-2 font-bold text-gray-800">Quick Reply Buttons</h4>
                <Button size="sm" onClick={addButton} disabled={(m.buttons || []).length >= 3} className="bg-blue-600 hover:bg-blue-700">
                  <Plus className="mr-1 h-4 w-4" /> Add Button
                </Button>
              </div>

              {(m.buttons || []).map((btn, i) => (
                <div key={btn.id} className="relative rounded-xl pr-16 transition-all">
                  <Handle
                    type="source"
                    position={Position.Right}
                    id={btn.id}
                    style={{ top: '50%', transform: 'translateY(-50%)' }}
                    className="z-50 !h-6 !w-6 rounded-full !border-4 !border-white !bg-blue-600 shadow-xl transition-all hover:scale-110 hover:!bg-blue-700"
                  />

                  <div className="space-y-3">
                    {/* Button Type Selector */}
                    <div className="flex items-center gap-3">
                      <p className="rounded-md bg-indigo-600/10 px-2 py-1 text-xs font-medium text-indigo-700">Reply Button</p>

                      <Button size="icon" variant="ghost" onClick={() => removeButton(i)} className="text-red-600 hover:bg-red-100">
                        <X className="h-5 w-5" />
                      </Button>
                    </div>

                    {/* Title */}
                    <Input
                      placeholder="Button text (e.g. Yes, I'm interested)"
                      value={btn.title}
                      onChange={(e) => updateButton(i, { title: e.target.value })}
                      className="font-medium"
                    />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* LIST LAYOUT - Also with perfect handles */}
          {m.layout === 'list' && (
            <div className="space-y-5 rounded-xl border-2 border-gray-200 bg-white p-5">
              <div className="mb-4 flex items-center justify-between">
                <h4 className="font-bold text-gray-800">List Menu Options</h4>
                <Button size="sm" onClick={addListSection}>
                  <Plus className="mr-1 h-4 w-4" /> Add Section
                </Button>
              </div>

              {(m.list?.sections || []).map((section, si) => (
                <div key={section.id} className="rounded-xl border-2 border-gray-300 bg-gray-50 p-4">
                  <div className="mb-3 flex justify-between">
                    <Input
                      placeholder="Section title"
                      value={section.title || ''}
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

                  <div className="ml-4 space-y-3">
                    {(section.rows || []).map((row, ri) => (
                      <div
                        key={row.id}
                        className="relative rounded-lg border border-gray-300 bg-white p-4 pr-14 transition-all hover:border-green-500"
                      >
                        <Handle
                          type="source"
                          position={Position.Right}
                          id={row.id}
                          style={{ top: '50%', transform: 'translateY(-50%)' }}
                          className="z-50 !h-6 !w-6 rounded-full !border-4 !border-white !bg-green-600 shadow-xl hover:!bg-green-700"
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
          )}
        </CardContent>
        {/* STORE VARIABLE */}
        <div className="space-y-1.5 p-4">
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
      </Card>
    </div>
  );
}
