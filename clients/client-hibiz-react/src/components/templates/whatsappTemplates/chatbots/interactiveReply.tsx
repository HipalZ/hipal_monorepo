import DeleteButton from '@/components/templates/whatsappTemplates/deleteButton';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/components/utils/helper';
import { useMediaUpload } from '@/hooks/useTemplates';
import { Handle, Position } from '@xyflow/react';
import { MessageCircle, Plus, Upload, X } from 'lucide-react';
import { useState } from 'react';
import toast from 'react-hot-toast';

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

  // Local variable typing

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
    if (file && file.size >= 5 * 1024 * 1024) return toast.error('File size limit is 5MB');
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
                          <input
                            type="file"
                            accept="image/jpeg, image/png"
                            className="hidden"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              handleHeaderUpload(file);
                            }}
                          />
                          {uploading ? 'Uploading...' : 'Click to upload image'}
                        </label>
                      )}
                      <span className="text-xs">*Max Upload size is 5MB (jpeg/png)</span>

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
            <div className="relative">
              <Textarea
                value={m.bodyText || ''}
                maxLength={4096}
                onChange={(e) => data.onPatch({ meta: { ...m, bodyText: e.target.value } })}
                placeholder="Message content..."
                className="focus:border-bg-white min-h-40 resize-none border-gray-300 bg-white pr-12"
              />
              <div aria-hidden className="absolute bottom-2 right-3 select-none text-xs text-gray-500">
                {(m.bodyText || '').length} / 4096
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="relative">
            <Input
              placeholder="Footer text (optional)"
              value={m.footerText || ''}
              maxLength={60}
              onChange={(e) => data.onPatch({ meta: { ...m, footerText: e.target.value } })}
            />
            <div aria-hidden className="absolute bottom-2 right-3 select-none text-xs text-gray-500">
              {(m.footerText || '').length} / 60
            </div>
          </div>

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
                <div key={btn.id} className="relative rounded-xl pr-4 transition-all">
                  <Handle
                    type="source"
                    position={Position.Right}
                    id={btn.id}
                    style={{ right: '-10%' }}
                    className="z-50 !h-5 !w-5 rounded-full !border-4 !border-white !bg-blue-600 shadow-xl hover:!bg-blue-700"
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

                    <div className="relative">
                      <Input
                        placeholder="(e.g. Yes, I'm interested)"
                        value={btn.title}
                        maxLength={20}
                        onChange={(e) => updateButton(i, { title: e.target.value })}
                        className="font-medium"
                      />
                      <div aria-hidden className="absolute bottom-2 right-3 select-none text-xs text-gray-500">
                        {(btn.title || '').length} / 20
                      </div>
                    </div>
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
              {/* Button */}
              <div className="relative">
                <Input
                  placeholder="Button text (optional)"
                  value={m.buttonText || ''}
                  maxLength={20}
                  onChange={(e) => data.onPatch({ meta: { ...m, buttonText: e.target.value } })}
                />
                <div aria-hidden className="absolute bottom-2 right-3 select-none text-xs text-gray-500">
                  {(m.buttonText || '').length} / 20
                </div>
              </div>
              {(m.list?.sections || []).map((section, si) => (
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
                      <div key={row.id} className="relative rounded-lg border border-gray-300 bg-white p-2 pr-7 hover:border-green-500">
                        <Handle
                          type="source"
                          position={Position.Right}
                          id={row.id}
                          style={{ right: '-20%' }}
                          className="z-50 !h-5 !w-5 rounded-full !border-4 !border-white !bg-blue-600 shadow-xl hover:!bg-blue-700"
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
          )}
        </CardContent>
      </Card>
    </div>
  );
}
