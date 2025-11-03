import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import {
  Background,
  BaseEdge,
  Controls,
  Handle,
  Position,
  ReactFlow,
  ReactFlowProvider,
  addEdge,
  applyEdgeChanges,
  applyNodeChanges,
  getBezierPath,
  useReactFlow,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import {
  AlertCircle,
  CheckCircle,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Code,
  Diamond,
  Download,
  FileInputIcon,
  FileText,
  FileUp,
  GripVertical,
  Hash,
  ImageIcon,
  Info,
  MessageCircle,
  PanelLeftOpen,
  PanelRightOpen,
  Play,
  Plus,
  Trash2,
  Upload,
  Variable,
  X,
  Zap,
} from 'lucide-react';
import { useCallback, useMemo, useRef, useState } from 'react';
import { useMediaUpload } from '../../../hooks/useTemplates';
import { VariableSelect } from './variableSelect';

const NodeTypes = {
  SEND: 'send_message',
  ASK: 'ask_question',
  COND: 'set_condition',
  TRIGGER: 'trigger',
  INTERACTIVE: 'interactive',
  FORM: 'form',
};

const INPUT_TYPES = [
  { id: 'text', label: 'Text' },
  { id: 'phone', label: 'Phone' },
  { id: 'email', label: 'Email' },
  { id: 'number', label: 'Number' },
];

const nid = () => Math.random().toString(36).slice(2, 10);

function ButtonEdge({ id, sourceX, sourceY, targetX, targetY, markerEnd }) {
  const [path] = getBezierPath({ sourceX, sourceY, targetX, targetY });
  return <BaseEdge id={id} path={path} markerEnd={markerEnd} />;
}

const edgeTypes = {
  button: ButtonEdge,
};

// Send Message Node
function SendNode({ data, selected }) {
  const m = data.meta.contentType
    ? data.meta
    : {
        contentType: 'text',
        text: '',
        mediaUrl: '',
        fileName: '',
        caption: '',
        useUpload: false,
      };
  const textRef = useRef(null);
  const [uploading, setUploading] = useState(false);

  const { uploadMediaPassFile } = useMediaUpload();
  const insertVariable = (variable) => {
    if (!variable) return;
    const el = textRef.current;
    const placeholder = `{{${variable}}}`;
    if (!el) return;

    const start = el.selectionStart || 0;
    const end = el.selectionEnd || 0;
    const currentText = m.text || '';
    const newText = currentText.substring(0, start) + placeholder + currentText.substring(end);

    data.onPatch({ meta: { ...m, text: newText } });

    setTimeout(() => {
      el.focus();
      el.setSelectionRange(start + placeholder.length, start + placeholder.length);
    }, 0);
  };

  const handleUpload = async (file, type) => {
    if (!file) return;
    try {
      setUploading(true);
      const { url } = await uploadMediaPassFile(file);
      data.onPatch({
        meta: {
          ...m,
          mediaUrl: url,
          fileName: file.name,
          contentType: type,
        },
      });
    } catch (err) {
      console.error(`${type} upload failed`, err);
    } finally {
      setUploading(false);
    }
  };

  const contentTypes = [
    { value: 'text', label: 'Text', icon: <FileText className="h-3 w-3" /> },
    { value: 'image', label: 'Image', icon: <ImageIcon className="h-3 w-3" /> },
    { value: 'document', label: 'Document', icon: <FileUp className="h-3 w-3" /> },
  ];

  return (
    <div className="relative">
      {/* Incoming Handle */}
      <Handle type="target" position={Position.Left} className="z-50 !h-[0.75rem] !w-[0.75rem]" />

      <Card
        className={cn(
          'relative w-80 overflow-hidden border-2 shadow-lg transition-all',
          selected ? 'border-emerald-500 ring-2 ring-emerald-500 ring-opacity-20' : 'border-gray-300',
        )}
      >
        {/* 🗑️ Delete Button */}
        <button
          onClick={() => data?.remove?.(data.id)}
          type="button"
          className="absolute right-4 top-4 z-20 rounded-full bg-white/80 p-1 text-red-600 shadow hover:bg-red-50"
          title="Delete node"
        >
          <Trash2 className="h-4 w-4" />
        </button>

        {/* Header */}
        <div className="relative bg-gradient-to-r from-emerald-500 to-teal-600 p-4 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MessageCircle className="h-5 w-5" />
              <h3 className="text-lg font-bold">Send Message</h3>
            </div>
          </div>
        </div>

        <CardContent className="space-y-4 bg-gray-100 p-4">
          {/* Message type selector */}
          <div className="flex gap-1 rounded-lg bg-white p-1 shadow-sm">
            {contentTypes.map((type) => (
              <Button
                key={type.value}
                variant={m.contentType === type.value ? 'default' : 'ghost'}
                size="sm"
                onClick={() =>
                  data.onPatch({
                    meta: { ...m, contentType: type.value, mediaUrl: '' },
                  })
                }
                className={cn(
                  'flex-1 gap-1 text-xs font-medium',
                  m.contentType === type.value
                    ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                    : 'text-gray-400 hover:bg-gray-100 hover:text-gray-700',
                )}
              >
                {type.icon}
                {type.label}
              </Button>
            ))}
          </div>

          {/* TEXT MODE */}
          {m.contentType === 'text' && (
            <div className="space-y-3">
              {data.variables?.length ? (
                <VariableSelect
                  value={m.selectedVars || []}
                  options={data.variables || []}
                  onChange={(vals) => data.onPatch({ meta: { ...m, selectedVars: vals } })}
                  onInsert={insertVariable}
                />
              ) : (
                <p className="text-xs italic text-gray-500">No variables yet</p>
              )}
              <div>
                <label className="mb-2 flex items-center gap-2 text-xs font-medium text-gray-700">
                  <FileText className="h-3 w-3" />
                  Message Text
                </label>
                <Textarea
                  ref={textRef}
                  value={m.text || ''}
                  onChange={(e) =>
                    data.onPatch({
                      meta: { ...m, text: e.target.value },
                    })
                  }
                  placeholder="Type your message... use {{variable}} for dynamic content"
                  className="min-h-24 resize-none border-gray-300 text-sm placeholder:text-gray-500 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                />
              </div>
            </div>
          )}
          <div>
            <label className="mb-1 text-xs font-medium text-gray-700">Store response in variable (optional)</label>
            <Input
              value={m.storeVariable || ''}
              onChange={(e) =>
                data.onPatch({
                  meta: { ...m, storeVariable: e.target.value.startsWith('@') ? e.target.value : `@${e.target.value}` },
                })
              }
              placeholder="e.g. @user_feedback"
              className="border-gray-300 text-sm focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
            />
            <p className="mt-1 text-[11px] text-gray-500">Prefix automatically with @ to store user reply.</p>
          </div>

          {/* IMAGE MODE */}
          {m.contentType === 'image' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-medium text-gray-700">Image Upload or URL</label>
                <Button
                  size="sm"
                  variant="outline"
                  className="text-xs"
                  onClick={() =>
                    data.onPatch({
                      meta: { ...m, useUpload: !m.useUpload, mediaUrl: '' },
                    })
                  }
                >
                  {m.useUpload ? 'Use URL' : 'Upload File'}
                </Button>
              </div>

              {m.useUpload ? (
                <div className="space-y-2">
                  <label className="flex h-12 cursor-pointer items-center justify-center gap-2 bg-gray-200 text-xs text-gray-700 hover:text-emerald-600">
                    <Upload className="h-4 w-4" />
                    <input type="file" accept="image/*" className="hidden" onChange={(e) => handleUpload(e.target.files?.[0], 'image')} />
                    {uploading ? 'Uploading...' : 'Click to upload image'}
                  </label>
                  {m.mediaUrl && <img src={m.mediaUrl} alt="Preview" className="h-24 w-full rounded-md border object-cover" />}
                </div>
              ) : (
                <Input
                  value={m.mediaUrl || ''}
                  onChange={(e) =>
                    data.onPatch({
                      meta: { ...m, mediaUrl: e.target.value },
                    })
                  }
                  placeholder="https://example.com/image.png"
                  className="border-gray-300 text-sm focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                />
              )}

              <Input
                value={m.caption || ''}
                onChange={(e) =>
                  data.onPatch({
                    meta: { ...m, caption: e.target.value },
                  })
                }
                placeholder="Add a caption for your image..."
                className="border-gray-300 text-sm focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
              />
            </div>
          )}

          {/* DOCUMENT MODE */}
          {m.contentType === 'document' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-medium text-gray-700">Document Upload or URL</label>
                <Button
                  size="sm"
                  variant="outline"
                  className="text-xs"
                  onClick={() =>
                    data.onPatch({
                      meta: { ...m, useUpload: !m.useUpload, mediaUrl: '' },
                    })
                  }
                >
                  {m.useUpload ? 'Use URL' : 'Upload File'}
                </Button>
              </div>

              {m.useUpload ? (
                <div className="space-y-2">
                  <label className="flex h-12 cursor-pointer items-center justify-center gap-2 bg-gray-200 text-xs text-gray-700 hover:text-emerald-600">
                    <Upload className="h-4 w-4" />
                    <input type="file" accept=".pdf,.doc,.docx" className="hidden" onChange={(e) => handleUpload(e.target.files?.[0], 'document')} />
                    {uploading ? 'Uploading...' : 'Click to upload document'}
                  </label>

                  {m.mediaUrl && <p className="truncate text-xs text-emerald-700">Uploaded: {m.fileName}</p>}
                </div>
              ) : (
                <Input
                  value={m.mediaUrl || ''}
                  onChange={(e) =>
                    data.onPatch({
                      meta: { ...m, mediaUrl: e.target.value },
                    })
                  }
                  placeholder="https://example.com/document.pdf"
                  className="border-gray-300 text-sm focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                />
              )}

              <Input
                value={m.fileName || ''}
                onChange={(e) =>
                  data.onPatch({
                    meta: { ...m, fileName: e.target.value },
                  })
                }
                placeholder="document.pdf"
                className="border-gray-300 text-sm focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
              />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Outgoing Handle */}
      <Handle type="source" position={Position.Right} className="z-50 !h-[0.75rem] !w-[0.75rem]" />
    </div>
  );
}

// Ask Question Node
function AskNode({ data, selected }) {
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
          {/* 🗑️ Delete Button */}
          <button
            onClick={() => data?.remove?.(data.id)}
            type="button"
            className="absolute right-4 top-4 z-20 rounded-full bg-white/80 p-1 text-red-600 shadow hover:bg-red-50"
            title="Delete node"
          >
            <Trash2 className="h-4 w-4" />
          </button>
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

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-2 flex items-center gap-2 text-xs font-medium text-gray-700">
                <Variable className="h-3 w-3" />
                Store in Variable
              </label>
              <Select value={m.variable || ''} onValueChange={(v) => data.onPatch({ meta: { ...m, variable: v } })}>
                <SelectTrigger className="h-9 text-sm">
                  <SelectValue placeholder="Select variable" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  {data.variables.map((v) => (
                    <SelectItem key={v} value={v}>
                      {v}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="mb-2 flex items-center gap-2 text-xs font-medium text-gray-700">
                <FileInputIcon className="h-3 w-3" />
                Input Type
              </label>
              <Select value={m.inputType || 'text'} onValueChange={(t) => data.onPatch({ meta: { ...m, inputType: t } })}>
                <SelectTrigger className="h-9 text-sm">
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  {INPUT_TYPES.map((t) => (
                    <SelectItem key={t.id} value={t.id}>
                      {t.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="required"
              checked={m.required ?? true}
              onCheckedChange={(checked) => data.onPatch({ meta: { ...m, required: !!checked } })}
              className="border-gray-300 focus:border-indigo-500"
            />
            <label htmlFor="required" className="text-xs font-medium text-gray-700">
              Required Field
            </label>
          </div>

          {m.prompt && (
            <Badge variant="outline" className="text-xs">
              Preview: {m.prompt.substring(0, 30)}...
            </Badge>
          )}
        </CardContent>
      </Card>
      <Handle type="source" position={Position.Right} className="z-50 !h-[0.75rem] !w-[0.75rem]" />
    </div>
  );
}

// Condition Node
function CondNode({ data, selected }) {
  const logic = data.meta?.logic || [];
  const variables = data.variables || []; // available variables passed from parent
  const hasLogic = logic.length > 0;
  const [expanded, setExpanded] = useState(false);

  const updateLogic = (i, patch) => {
    const updated = logic.map((l, idx) => (idx === i ? { ...l, ...patch } : l));
    data.onPatch({ meta: { ...data.meta, logic: updated } });
  };

  const addCondition = () => {
    if (variables.length === 0) return;
    data.onPatch({
      meta: {
        ...data.meta,
        logic: [...logic, { var: variables[0], op: 'eq', value: '' }],
      },
    });
  };

  const removeCondition = (i) => {
    const updated = logic.filter((_, j) => j !== i);
    data.onPatch({ meta: { ...data.meta, logic: updated } });
  };

  const conditionPreview = hasLogic
    ? logic.map((l, i) => `${i === 0 ? 'IF' : 'AND'} ${l.var} ${l.op} "${l.value || '...'}"`).join('\n')
    : 'No conditions set';

  return (
    <div className="relative">
      {/* Incoming connection handle */}
      <Handle
        type="target"
        position={Position.Left}
        className="z-50 !h-[0.9rem] !w-[0.9rem] rounded-full border-2 border-amber-400 bg-amber-500 transition-transform hover:scale-110"
      />

      <Card
        className={cn(
          'group relative w-96 overflow-hidden rounded-xl border bg-white shadow-md transition-all',
          selected ? 'border-2 border-amber-500 shadow-2xl ring-2 ring-amber-500/30' : 'border-amber-300 hover:border-amber-400 hover:shadow-lg',
        )}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-amber-50 via-amber-100 to-amber-200 opacity-80" />

        <div className="relative z-10 p-4 text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 transform items-center justify-center rounded-full bg-gradient-to-r from-amber-400 to-amber-600 shadow-lg transition-transform group-hover:rotate-12">
            <Diamond className="h-6 w-6 text-white" />
          </div>
          <h3 className="mb-1 text-sm font-bold text-amber-800">Condition</h3>
          <p className="text-xs text-amber-600">Branch your flow</p>
        </div>

        <CardContent className="relative z-10 space-y-3 px-4 pb-4">
          {/* If there are conditions, show editable UI */}
          {hasLogic ? (
            <div className="space-y-3">
              <Button variant="ghost" size="sm" className="w-full justify-between text-amber-700" onClick={() => setExpanded(!expanded)}>
                <span className="text-xs">Preview Logic</span>
                <ChevronDown className={`h-3 w-3 transition-transform ${expanded ? 'rotate-180' : ''}`} />
              </Button>

              {expanded && (
                <div className="max-h-24 overflow-y-auto rounded-lg border border-amber-200 bg-white/80 p-3">
                  <code className="block whitespace-pre-wrap font-mono text-xs text-amber-800">{conditionPreview}</code>
                </div>
              )}

              {/* Inline condition editor */}
              <div className="space-y-2">
                {logic.map((l, i) => (
                  <div key={i} className="rounded-lg border border-amber-200 bg-white/70 p-2 shadow-sm">
                    <div className="flex items-center justify-between">
                      <Badge variant="secondary" className="text-[10px] text-amber-800">
                        {i === 0 ? 'IF' : 'AND'}
                      </Badge>
                      <Button variant="ghost" size="sm" onClick={() => removeCondition(i)} className="h-6 w-6 p-0 text-red-500 hover:bg-red-50">
                        <X className="h-3 w-3" />
                      </Button>
                    </div>

                    <div className="mt-2 grid grid-cols-3 gap-2">
                      <select
                        value={l.var}
                        onChange={(e) => updateLogic(i, { var: e.target.value })}
                        className="rounded border border-gray-300 px-2 py-1 text-xs"
                      >
                        {variables.map((v) => (
                          <option key={v} value={v}>
                            {v}
                          </option>
                        ))}
                      </select>

                      <select
                        value={l.op}
                        onChange={(e) => updateLogic(i, { op: e.target.value })}
                        className="rounded border border-gray-300 px-2 py-1 text-xs"
                      >
                        <option value="exists">exists</option>
                        <option value="eq">equals</option>
                        <option value="ne">not equals</option>
                        <option value="gt">greater than</option>
                        <option value="lt">less than</option>
                        <option value="contains">contains</option>
                      </select>

                      <input
                        type="text"
                        value={l.value}
                        onChange={(e) => updateLogic(i, { value: e.target.value })}
                        placeholder="value"
                        className="rounded border border-gray-300 px-2 py-1 text-xs"
                      />
                    </div>
                  </div>
                ))}
              </div>

              {/* Add condition button */}
              <Button variant="outline" onClick={addCondition} className="w-full border-amber-300 text-amber-700 hover:bg-amber-100">
                <Plus className="mr-1 h-3 w-3" /> Add Condition
              </Button>

              {/* True / False path badges */}
              <div className="flex gap-2 pt-2">
                <div className="flex items-center">
                  <div className="mr-1 h-3 w-3 rounded-full bg-green-500" />
                  <span className="text-green-800">True</span>
                </div>
                <div className="flex items-center">
                  <div className="mr-1 h-3 w-3 rounded-full bg-red-500" />
                  <span className="text-red-800">False</span>
                </div>
              </div>
            </div>
          ) : (
            // No conditions yet
            <div className="py-4 text-center">
              <p className="mb-2 text-xs italic text-amber-500">No conditions yet</p>
              <Button variant="outline" onClick={addCondition} className="w-full border-amber-300 text-amber-700 hover:bg-amber-100">
                <Plus className="mr-1 h-3 w-3" /> Add Condition
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* True Path Handle (Right - Top) */}
      <Handle
        id="true"
        type="source"
        position={Position.Right}
        className="!h-[0.9rem] !w-[0.9rem] rounded-full border-2 border-green-500 !bg-green-400"
        style={{ top: '30%' }}
      />

      {/* False Path Handle (Right - Bottom) */}
      <Handle
        id="false"
        type="source"
        position={Position.Right}
        className="!h-[0.9rem] !w-[0.9rem] rounded-full border-2 border-red-500 !bg-red-400"
        style={{ bottom: '30%' }}
      />
    </div>
  );
}

// Trigger Node
function TriggerNode({ data, selected }) {
  const m = data.meta || {};

  return (
    <div className="relative">
      <Handle id="start" type="source" position={Position.Right} className="z-50 !h-[0.75rem] !w-[0.75rem]" />
      <Card
        className={cn(
          'relative w-80 overflow-hidden border-2 shadow-lg transition-all',
          selected ? 'border-orange-500 ring-2 ring-orange-500 ring-opacity-20' : 'border-gray-300',
        )}
      >
        <div className="bg-gradient-to-r from-orange-500 to-red-600 p-4 text-white">
          <div className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            <h3 className="text-lg font-bold">Trigger</h3>
          </div>
          {/* 🗑️ Delete Button */}
          <button
            onClick={() => data?.remove?.(data.id)}
            type="button"
            className="absolute right-4 top-4 z-20 rounded-full bg-white/80 p-1 text-red-600 shadow hover:bg-red-50"
            title="Delete node"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>

        <CardContent className="space-y-4 bg-gray-100 p-4">
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-xs font-medium text-gray-700">
              <Hash className="h-3 w-3" />
              Trigger Keywords
            </label>
            <div className="flex flex-wrap gap-2">
              {(m.keywords || []).map((k, i) => (
                <Badge key={i} variant="secondary" className="bg-orange-100 text-xs text-orange-800">
                  {k}
                </Badge>
              ))}
              {(m.keywords || []).length === 0 && <p className="text-xs italic text-gray-500">No keywords set</p>}
            </div>
          </div>

          <div className="rounded-lg bg-gray-50 p-3">
            <p className="flex items-center gap-1 text-xs text-gray-600">
              <CheckCircle className="h-3 w-3 text-green-500" />
              Connect handle to first node to start the flow.
            </p>
          </div>

          {(m.keywords || []).length > 0 && (
            <Badge variant="outline" className="text-xs">
              Triggers on: {m.keywords.join(', ')}
            </Badge>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function InteractiveNode({ data, selected }) {
  const m = data.meta ?? {
    layout: 'button',
    header: { type: 'none', mediaUrl: '', useUpload: false },
    bodyText: '',
    footerText: '',
    buttons: [],
    list: { sections: [] },
  };

  const { uploadMediaPassFile } = useMediaUpload();
  const [uploading, setUploading] = useState(false);

  const nid = () => Math.random().toString(36).substr(2, 9);

  // --- Button Logic ---
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

  // --- List Logic ---
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
    <div>
      <Handle type="target" position={Position.Left} className="z-50 !h-[0.75rem] !w-[0.75rem]" />
      <Card
        className={cn(
          'relative w-96 overflow-hidden border-2 shadow-lg transition-all',
          selected ? 'border-blue-500 ring-2 ring-blue-500 ring-opacity-20' : 'border-gray-300',
        )}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-500 to-indigo-600 p-4 text-white">
          <div className="flex items-center gap-16">
            <div className="flex items-center gap-2">
              <MessageCircle className="h-5 w-5" />
              <h3 className="text-lg font-bold">Interactive</h3>
            </div>
            {/* Layout Switcher */}
            <Select value={m.layout || 'button'} onValueChange={(layout) => data.onPatch({ meta: { ...m, layout } })}>
              <SelectTrigger className="h-8 w-28 bg-white/10 text-xs text-white">
                <SelectValue placeholder="Layout" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="button">Buttons</SelectItem>
                <SelectItem value="list">List</SelectItem>
              </SelectContent>
            </Select>
            {/* 🗑️ Delete Button */}
            <button
              onClick={() => data?.remove?.(data.id)}
              type="button"
              className="absolute right-4 top-4 z-20 rounded-full bg-white/80 p-1 text-red-600 shadow hover:bg-red-50"
              title="Delete node"
            >
              <Trash2 className="h-6 w-6" />
            </button>
          </div>
        </div>

        {/* BODY */}
        <CardContent className="space-y-4 bg-gray-100 p-4">
          {/* Header Upload Section */}
          <Card className="border-0 bg-white shadow-sm">
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

          <div>
            <label className="text-xs font-medium text-gray-700">Footer (Optional)</label>
            <Input
              value={m.footerText || ''}
              onChange={(e) => data.onPatch({ meta: { ...m, footerText: e.target.value } })}
              placeholder="Footer note..."
              className="border-gray-300 focus:border-blue-500"
            />
          </div>

          {/* Conditional Rendering for Layout */}
          {m.layout === 'button' && (
            <Card className="border-0 bg-white shadow-sm">
              <CardHeader className="!p-4 pb-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-blue-500" />
                    <CardTitle className="text-sm font-medium text-gray-700">Interactive Buttons</CardTitle>
                  </div>
                  <Button
                    onClick={addButton}
                    disabled={(m.buttons || []).length >= 3}
                    className="bg-blue-500 px-3 py-1 text-xs text-white hover:bg-blue-600"
                  >
                    <Plus className="mr-1 h-3 w-3" />
                    Add
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {(m.buttons || []).map((btn, i) => (
                  <div key={i} className="rounded-lg border border-gray-200 p-3 hover:border-blue-300">
                    <div className="flex items-center justify-between">
                      <Select value={btn.type} onValueChange={(type) => updateButton(i, { type, ...(type !== 'reply' ? { url: '' } : {}) })}>
                        <SelectTrigger className="h-8 w-24 text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="reply">Reply</SelectItem>
                          <SelectItem value="url">URL</SelectItem>
                        </SelectContent>
                      </Select>
                      <Button variant="destructive" size="icon" onClick={() => removeButton(i)} className="h-6 w-6 bg-red-500">
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                    <Input
                      value={btn.title}
                      onChange={(e) => updateButton(i, { title: e.target.value })}
                      placeholder="Button title"
                      className="mt-2 border-gray-300"
                    />
                    {btn.type === 'url' && (
                      <Input
                        value={btn.url || ''}
                        onChange={(e) => updateButton(i, { url: e.target.value })}
                        placeholder="https://example.com"
                        className="mt-1 border-gray-300"
                      />
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {m.layout === 'list' && (
            <Card className="border-0 bg-white shadow-sm">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium text-gray-700">List Sections</CardTitle>
                  <Button onClick={addListSection} className="bg-blue-500 px-3 py-1 text-xs text-white hover:bg-blue-600">
                    <Plus className="mr-1 h-3 w-3" />
                    Add Section
                  </Button>
                </div>
              </CardHeader>

              <CardContent className="space-y-3">
                {(m.list?.sections || []).map((section, si) => (
                  <div key={section.id} className="rounded-lg border border-gray-200 p-3">
                    <div className="mb-2 flex items-center justify-between">
                      <Input
                        value={section.title}
                        onChange={(e) => {
                          const sections = [...(m.list?.sections || [])];
                          sections[si].title = e.target.value;
                          data.onPatch({
                            meta: {
                              ...m,
                              list: { ...(m.list || {}), sections },
                            },
                          });
                        }}
                        placeholder="Section Title"
                        className="border-gray-300"
                      />
                      <Button size="icon" variant="destructive" onClick={() => removeListSection(si)} className="h-6 w-6 bg-red-500">
                        <X className="h-3 w-3" />
                      </Button>
                    </div>

                    {(section.rows || []).map((row, ri) => (
                      <div key={row.id} className="mb-2 rounded border p-2">
                        <Input
                          value={row.title}
                          onChange={(e) => updateListRow(si, ri, { title: e.target.value })}
                          placeholder="Row title"
                          className="mb-1 border-gray-300"
                        />
                        <Input
                          value={row.description}
                          onChange={(e) => updateListRow(si, ri, { description: e.target.value })}
                          placeholder="Row description (optional)"
                          className="border-gray-300"
                        />
                      </div>
                    ))}

                    <Button onClick={() => addListRow(si)} className="mt-2 w-full bg-blue-500 text-xs text-white hover:bg-blue-600">
                      + Add Row
                    </Button>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>
      <Handle type="source" position={Position.Right} className="z-50 !h-[0.75rem] !w-[0.75rem]" />
    </div>
  );
}

const nodeTypes = {
  [NodeTypes.SEND]: SendNode,
  [NodeTypes.ASK]: AskNode,
  [NodeTypes.COND]: CondNode,
  [NodeTypes.TRIGGER]: TriggerNode,
  [NodeTypes.INTERACTIVE]: InteractiveNode,
};

// Palette Item Component
function PaletteItem({ label, type, icon }) {
  const onDragStart = (event, nodeType) => {
    event.dataTransfer.setData('application/reactflow', nodeType);
    event.dataTransfer.effectAllowed = 'move';
  };

  return (
    <Card
      className="cursor-grab border-gray-200 bg-white shadow-sm transition-all hover:scale-[1.02] hover:shadow-md active:cursor-grabbing active:opacity-80"
      draggable
      onDragStart={(e) => onDragStart(e, type)}
    >
      <CardContent className="flex items-center gap-3 p-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-blue-50 to-indigo-50 text-xl">{icon}</div>
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-800">{label}</p>
          <p className="text-xs text-gray-500">Drag to canvas</p>
        </div>
        <GripVertical className="h-4 w-4 text-gray-400" />
      </CardContent>
    </Card>
  );
}

// Variable Editor Component
// function VariableEditor({ variables, setVariables, onNext }) {
//   const [step, setStep] = useState('list');
//   const [v, setV] = useState('');
//   const [error, setError] = useState('');

//   const handleAdd = () => {
//     const name = v.trim();
//     if (!name) {
//       setError('Variable name cannot be empty');
//       return;
//     }
//     if (variables.includes(name)) {
//       setError('Variable already exists');
//       return;
//     }
//     setVariables((prev) => [...prev, name]);
//     setV('');
//     setError('');
//     setStep('list');
//   };

//   const handleDelete = (varToDelete) => {
//     setVariables((prev) => prev.filter((x) => x !== varToDelete));
//   };

//   return (
//     <Card className="overflow-hidden border-0 bg-white shadow-lg transition-all hover:shadow-xl">
//       <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 pb-3">
//         <div className="flex items-center gap-2">
//           <CardTitle className="text-sm font-semibold text-gray-800">Global Variables</CardTitle>
//         </div>
//       </CardHeader>
//       <CardContent className="space-y-4 p-4">
//         {step === 'list' && (
//           <>
//             <div className="space-y-3">
//               <div className="flex items-center justify-between">
//                 <h3 className="text-xs font-medium uppercase tracking-wide text-gray-600">Your Variables</h3>
//                 <Button
//                   variant="outline"
//                   size="sm"
//                   onClick={() => setStep('add')}
//                   className="h-8 border-gray-300 px-3 text-blue-600 hover:bg-blue-50"
//                 >
//                   <Plus className="mr-1 h-3 w-3" />
//                   Add
//                 </Button>
//               </div>

//               {variables.length === 0 ? (
//                 <div className="rounded-lg bg-gray-50 py-8 text-center">
//                   <Variable className="mx-auto mb-2 h-8 w-8 text-gray-400" />
//                   <p className="text-sm text-gray-500">No variables added yet.</p>
//                   <p className="mt-1 text-xs text-gray-400">Add your first variable to get started!</p>
//                 </div>
//               ) : (
//                 <div className="flex flex-wrap gap-2">
//                   {variables.map((vv) => (
//                     <Badge
//                       key={vv}
//                       variant="secondary"
//                       className="group relative flex items-center gap-1 border-blue-200 bg-blue-100 px-3 py-1 text-xs font-medium text-blue-800 transition-all hover:bg-blue-200"
//                     >
//                       {vv}
//                       <Button
//                         variant="ghost"
//                         size="sm"
//                         className="absolute -right-1 -top-1 h-4 w-4 rounded-full bg-red-500 p-0 text-white opacity-0 transition-opacity hover:bg-red-600 group-hover:opacity-100"
//                         onClick={() => handleDelete(vv)}
//                       >
//                         <X className="h-2 w-2" />
//                       </Button>
//                     </Badge>
//                   ))}
//                 </div>
//               )}
//             </div>

//             {variables.length > 0 && (
//               <Button
//                 className="flex h-10 w-full transform items-center gap-2 bg-blue-500 font-semibold text-white shadow-md transition-all hover:scale-[1.02] hover:bg-blue-600"
//                 onClick={onNext}
//               >
//                 <CheckCircle className="h-4 w-4" />
//                 Next →
//               </Button>
//             )}
//           </>
//         )}

//         {step === 'add' && (
//           <div className="space-y-4">
//             <div className="flex items-center gap-2">
//               <Variable className="h-4 w-4 text-gray-600" />
//               <h3 className="text-sm font-semibold text-gray-800">Add New Variable</h3>
//             </div>

//             <Input
//               value={v}
//               onChange={(e) => {
//                 setV(e.target.value);
//                 setError('');
//               }}
//               placeholder="e.g. user_name, phone_number"
//               className={cn(
//                 'h-10 w-full border-gray-300 text-sm transition-all focus:border-blue-500 focus:ring-1 focus:ring-blue-500',
//                 error && 'border-red-300 focus:border-red-500 focus:ring-red-500',
//               )}
//             />

//             {error && (
//               <div className="flex items-center gap-2 rounded-md bg-red-50 p-2 text-xs text-red-600">
//                 <AlertCircle className="h-3 w-3" />
//                 {error}
//               </div>
//             )}

//             <div className="flex gap-2">
//               <Button className="h-10 flex-1 bg-blue-500 font-semibold text-white shadow-md transition-all hover:bg-blue-600" onClick={handleAdd}>
//                 Add Variable
//               </Button>
//               <Button
//                 variant="outline"
//                 className="h-10 border-gray-300 bg-transparent px-4 text-gray-700 hover:bg-gray-50"
//                 onClick={() => {
//                   setStep('list');
//                   setV('');
//                   setError('');
//                 }}
//               >
//                 Cancel
//               </Button>
//             </div>
//           </div>
//         )}
//       </CardContent>
//     </Card>
//   );
// }

// Node Inspector Component
function NodeInspector({ node, onPatch, remove, vars }) {
  const data = node.data || {};

  return (
    <div className="space-y-3 rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
      {node.type === NodeTypes.ASK && <AskQuick meta={data.meta} onPatch={(m) => onPatch({ meta: m })} variables={vars} />}
      {node.type === NodeTypes.COND && <CondQuick meta={data.meta} onPatch={(m) => onPatch({ meta: m })} variables={vars} />}
      {node.type === NodeTypes.TRIGGER && <TriggerQuick meta={data.meta} onPatch={(m) => onPatch({ meta: m })} />}
    </div>
  );
}

function AskQuick({ meta = { prompt: '', inputType: 'text' }, onPatch, variables }) {
  return (
    <div className="space-y-2">
      <input
        value={meta.prompt || ''}
        onChange={(e) => onPatch({ ...meta, prompt: e.target.value })}
        placeholder="Prompt"
        className="w-full rounded border border-gray-300 px-3 py-2"
      />
      <div className="grid grid-cols-2 gap-2">
        <select
          value={meta.variable || ''}
          onChange={(e) => onPatch({ ...meta, variable: e.target.value })}
          className="rounded border border-gray-300 px-3 py-2"
        >
          <option value="">store in variable</option>
          {variables.map((v) => (
            <option key={v} value={v}>
              {v}
            </option>
          ))}
        </select>
        <select
          value={meta.inputType || 'text'}
          onChange={(e) => onPatch({ ...meta, inputType: e.target.value })}
          className="rounded border border-gray-300 px-3 py-2"
        >
          {INPUT_TYPES.map((t) => (
            <option key={t.id} value={t.id}>
              {t.label}
            </option>
          ))}
        </select>
      </div>
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" checked={meta.required ?? true} onChange={(e) => onPatch({ ...meta, required: !!e.target.checked })} /> Required
      </label>
    </div>
  );
}

function CondQuick({ meta = { logic: [] }, onPatch, variables }) {
  const logic = meta.logic || [];

  const update = (i, patch) => {
    const updatedLogic = logic.map((x, idx) => (idx === i ? { ...x, ...patch } : x));
    onPatch({ ...meta, logic: updatedLogic });
  };

  const addCondition = () => {
    if (variables.length === 0) return;
    onPatch({
      ...meta,
      logic: [...logic, { var: variables[0], op: 'eq', value: '' }],
    });
  };

  const removeCondition = (i) => {
    const updated = logic.filter((_, j) => j !== i);
    onPatch({ ...meta, logic: updated });
  };

  return (
    <Card className="border-0 bg-gradient-to-br from-emerald-50 to-emerald-100 p-6 shadow-md">
      <div className="mb-4 flex items-center justify-between">
        <Badge variant="outline" className="border-emerald-300 text-emerald-700">
          <Info className="mr-1 h-3 w-3" />
          Conditional Logic
        </Badge>
      </div>

      <div className="space-y-4">
        {logic.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-emerald-300 bg-white p-8 text-center">
            <Plus className="mb-3 h-12 w-12 text-emerald-400" />
            <p className="mb-1 text-sm font-medium text-emerald-700">No conditions yet</p>
            <p className="text-xs text-emerald-600">Add your first condition to get started</p>
            {variables.length === 0 && (
              <p className="mt-2 flex items-center text-xs text-red-500">
                <AlertCircle className="mr-1 h-3 w-3" />
                No variables available. Create some first.
              </p>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {logic.map((l, i) => (
              <Card key={i} className="border-emerald-200 bg-white p-4 shadow-sm">
                <div className="mb-2 flex items-center justify-between">
                  <Badge variant="secondary" className="text-xs">
                    {i === 0 ? 'IF' : 'AND'}
                  </Badge>
                  <Button variant="ghost" size="sm" onClick={() => removeCondition(i)} className="h-6 w-6 p-0 text-red-500 hover:bg-red-50">
                    <X className="h-4 w-4" />
                  </Button>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <select
                    value={l.var}
                    onChange={(e) => update(i, { var: e.target.value })}
                    className="rounded border border-gray-300 px-2 py-1 text-sm"
                  >
                    {variables.map((v) => (
                      <option key={v} value={v}>
                        {v}
                      </option>
                    ))}
                  </select>

                  <select
                    value={l.op}
                    onChange={(e) => update(i, { op: e.target.value })}
                    className="rounded border border-gray-300 px-2 py-1 text-sm"
                  >
                    <option value="exists">exists</option>
                    <option value="eq">equals</option>
                    <option value="ne">not equals</option>
                    <option value="gt">greater than</option>
                    <option value="lt">less than</option>
                    <option value="contains">contains</option>
                  </select>

                  <input
                    type="text"
                    value={l.value}
                    onChange={(e) => update(i, { value: e.target.value })}
                    placeholder="value"
                    className="rounded border border-gray-300 px-2 py-1 text-sm"
                  />
                </div>
              </Card>
            ))}
          </div>
        )}

        <Button onClick={addCondition} disabled={variables.length === 0} className="w-full bg-emerald-600 text-white hover:bg-emerald-700">
          <Plus className="mr-2 h-4 w-4" />
          Add Condition
        </Button>
      </div>
    </Card>
  );
}

function TriggerQuick({ meta = { keywords: [] }, onPatch }) {
  const [kw, setKw] = useState('');
  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <input value={kw} onChange={(e) => setKw(e.target.value)} placeholder="keyword" className="flex-1 rounded border border-gray-300 px-3 py-2" />
        <Button
          className="rounded border border-gray-300 px-3 py-2"
          onClick={() => {
            const v = kw.trim();
            if (!v) return;
            const arr = [...(meta.keywords || [])];
            if (!arr.includes(v)) arr.push(v);
            onPatch({ ...meta, keywords: arr });
            setKw('');
          }}
        >
          Add
        </Button>
      </div>
      <div className="flex flex-wrap gap-2">
        {(meta.keywords || []).map((k) => (
          <span key={k} className="rounded-full border border-gray-300 px-2 py-1 text-xs">
            {k}
          </span>
        ))}
      </div>
      <div className="text-xs text-gray-500">Connect bottom handle to first node.</div>
    </div>
  );
}

// Helper Functions
function makeNode({ id, type, position, patch, updateGlobalVariables, remove, variables }) {
  return {
    id,
    type,
    position,
    data: {
      id,
      onPatch: patch,
      variables,
      updateGlobalVariables,
      remove,
      meta: {},
    },
  };
}

function labelFor(t) {
  return {
    [NodeTypes.SEND]: 'Send Message',
    [NodeTypes.ASK]: 'Ask a Question',
    [NodeTypes.COND]: 'Set a Condition',
    [NodeTypes.TRIGGER]: 'Trigger Keyword',
    [NodeTypes.INTERACTIVE]: 'Interactive Message',
  }[t];
}

function iconFor(t) {
  return {
    [NodeTypes.SEND]: '💬',
    [NodeTypes.ASK]: '❓',
    [NodeTypes.COND]: '🔀',
    [NodeTypes.TRIGGER]: '🏁',
    [NodeTypes.INTERACTIVE]: '🧩',
  }[t];
}

function defaultMeta(t) {
  if (t === NodeTypes.SEND)
    return {
      contentType: 'text',
      text: '',
      mediaUrl: '',
      fileName: '',
      caption: '',
    };

  if (t === NodeTypes.INTERACTIVE)
    return {
      layout: 'button',
      bodyText: '',
      footerText: '',
      buttons: [],
    };

  if (t === NodeTypes.ASK) return { prompt: '', variable: '', inputType: 'text', required: true };

  if (t === NodeTypes.COND) return { logic: [] };

  if (t === NodeTypes.TRIGGER) return { keywords: [] };

  return {};
}

function buildFinalFromGraph(nodes, edges) {
  const byId = Object.fromEntries(nodes.map((n) => [n.id, n]));
  const metaById = Object.fromEntries(nodes.map((n) => [n.id, JSON.parse(JSON.stringify(n.data.meta || {}))]));

  const runtimeNodes = [];
  const triggers = [];

  // 🔗 Map connections
  for (const e of edges) {
    const { source, target, data } = e;
    const sNode = byId[source];
    if (!sNode) continue;
    const m = metaById[source] || {};

    if (sNode.type === NodeTypes.COND) {
      if (data?.kind === 'cond:true') m.trueNext = target;
      else if (data?.kind === 'cond:false') m.falseNext = target;
    } else if (sNode.type === NodeTypes.TRIGGER && data?.kind === 'trigger:start') {
      m.startNext = target;
    } else {
      m.next = target;
    }
    metaById[source] = m;
  }

  // 🧩 Build node objects
  for (const n of nodes) {
    const m = metaById[n.id] || {};

    // 🎯 TRIGGER NODE
    if (n.type === NodeTypes.TRIGGER) {
      triggers.push({ keywords: m.keywords || [], start: m.startNext || null });
      continue;
    }

    // 💬 SEND MESSAGE NODE
    if (n.type === NodeTypes.SEND) {
      runtimeNodes.push({
        id: n.id,
        type: 'send_message',
        next: m.next || null,
        contentType: m.contentType || 'text',
        text: m.text || '',
        mediaUrl: m.mediaUrl || '',
        fileName: m.fileName || '',
        caption: m.caption || '',
        selectedVars: m.selectedVars || [], // ✅ include selected vars used in text
        storeVariable: m.storeVariable || null, // ✅ store user reply or state variable
      });
      continue;
    }

    // ❓ ASK QUESTION NODE
    if (n.type === NodeTypes.ASK) {
      runtimeNodes.push({
        id: n.id,
        type: 'ask_question',
        next: m.next || null,
        prompt: m.prompt || '',
        variable: m.variable || '',
        inputType: m.inputType || 'text',
        required: !!(m.required ?? true),
        storeVariable: m.storeVariable || null, // ✅ NEW
      });
      continue;
    }

    // 🧩 INTERACTIVE NODE
    if (n.type === NodeTypes.INTERACTIVE) {
      runtimeNodes.push({
        id: n.id,
        type: 'interactive_message',
        layout: m.layout || 'button',
        header: m.header || null,
        bodyText: m.bodyText || '',
        footerText: m.footerText || '',
        buttons: m.buttons || [],
        list: m.list || null,
        next: m.next || null,
        storeVariable: m.storeVariable || null, // ✅ optional — to store selection
      });
      continue;
    }

    // 🔀 CONDITION NODE
    if (n.type === NodeTypes.COND) {
      runtimeNodes.push({
        id: n.id,
        type: 'set_condition',
        logic: m.logic || [],
        trueNext: m.trueNext || null,
        falseNext: m.falseNext || null,
      });
    }
  }

  return { version: 2, triggers, nodes: runtimeNodes };
}

function downloadJSON(obj) {
  const s = JSON.stringify(obj, null, 2);
  const blob = new Blob([s], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `whatsapp_flow_${Date.now()}.json`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

function loadSample(setNodes, setEdges) {
  const t1 = nid();
  const askName = nid();
  const askPhone = nid();
  const cond = nid();
  const send = nid();

  const nodes = [
    {
      id: t1,
      type: NodeTypes.TRIGGER,
      position: { x: 60, y: 40 },
      data: { name: 'Start', icon: '🏁', meta: { keywords: ['start', 'hello'] } },
    },
    {
      id: askName,
      type: NodeTypes.ASK,
      position: { x: 360, y: 180 },
      data: {
        name: 'Ask Name',
        icon: '❓',
        variables: ['name', 'phone'],
        meta: { prompt: 'Your full name?', variable: 'name', inputType: 'text', required: true },
      },
    },
    {
      id: askPhone,
      type: NodeTypes.ASK,
      position: { x: 640, y: 180 },
      data: {
        name: 'Ask Phone',
        icon: '❓',
        variables: ['name', 'phone'],
        meta: { prompt: 'Your phone number?', variable: 'phone', inputType: 'phone', required: true },
      },
    },
    {
      id: cond,
      type: NodeTypes.COND,
      position: { x: 940, y: 180 },
      data: {
        name: 'Has Phone?',
        icon: '🔀',
        variables: ['name', 'phone'],
        meta: { logic: [{ var: 'phone', op: 'exists', value: '' }] },
      },
    },
    {
      id: send,
      type: NodeTypes.SEND,
      position: { x: 1240, y: 160 },
      data: {
        name: 'Thanks Msg',
        icon: '💬',
        meta: { contentType: 'text', text: 'Thanks {{name}}. We will call you soon.' },
      },
    },
  ];

  const edges = [
    { id: nid(), source: t1, sourceHandle: 'start', target: askName, data: { kind: 'trigger:start' } },
    { id: nid(), source: askName, target: askPhone },
    { id: nid(), source: askPhone, target: cond },
    { id: nid(), source: cond, sourceHandle: 'true', target: send, data: { kind: 'cond:true' } },
  ];

  setNodes(nodes);
  setEdges(edges);
}

// Main Editor Shell
function EditorShell() {
  const [rfNodes, setRfNodes] = useState([]);
  const [rfEdges, setRfEdges] = useState([]);
  const [selId, setSelId] = useState(null);
  const [variables, setVariables] = useState(['name', 'phone']);
  const [leftOpen, setLeftOpen] = useState(true);
  const [rightOpen, setRightOpen] = useState(true);

  const reactFlowWrapper = useRef(null);
  const { screenToFlowPosition } = useReactFlow();

  const updateGlobalVariables = useCallback((newVars) => {
    setVariables((prev) => {
      const merged = Array.from(new Set([...prev, ...newVars]));
      return merged;
    });

    // Also push updates into all existing nodes
    setRfNodes((nds) =>
      nds.map((n) => ({
        ...n,
        data: {
          ...n.data,
          variables: Array.from(new Set([...(n.data.variables || []), ...newVars])),
        },
      })),
    );
  }, []);

  const onNodesChange = useCallback((changes) => setRfNodes((nds) => applyNodeChanges(changes, nds)), []);
  const onEdgesChange = useCallback((changes) => setRfEdges((eds) => applyEdgeChanges(changes, eds)), []);

  const onConnect = useCallback((params) => {
    const edge = { ...params, id: `e-${nid()}`, data: {} };

    if (params.sourceHandle === 'true') edge.data.kind = 'cond:true';
    else if (params.sourceHandle === 'false') edge.data.kind = 'cond:false';
    else if (params.sourceHandle === 'start') edge.data.kind = 'trigger:start';

    setRfEdges((eds) => addEdge(edge, eds));
  }, []);

  const onNodeClick = useCallback((_, node) => setSelId(node.id), []);

  function addNode(type, position) {
    const id = nid();
    setRfNodes((nds) => [
      ...nds,
      makeNode({
        id,
        type,
        position,
        variables,
        patch: (p) => patchNode(id, p),
        onVariableAdd: updateGlobalVariables,
        remove: (nodeId) => removeNode(nodeId),
      }),
    ]);
    setSelId(id);
  }

  const onDrop = useCallback(
    (event) => {
      event.preventDefault();
      const type = event.dataTransfer.getData('application/reactflow');
      if (!type) return;

      const position = screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });
      addNode(type, position);
    },
    [screenToFlowPosition, variables],
  );

  const onDragOver = useCallback((event) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const patchNode = useCallback((id, patch) => {
    setRfNodes((nds) =>
      nds.map((n) =>
        n.id === id
          ? {
              ...n,
              data: {
                ...n.data,
                ...patch,
                meta: { ...n.data.meta, ...(patch.meta || {}) },
                remove: (nodeId) => removeNode(nodeId),
              },
            }
          : n,
      ),
    );
  }, []);

  const selected = useMemo(() => rfNodes.find((n) => n.id === selId) || null, [rfNodes, selId]);
  const finalObject = useMemo(() => buildFinalFromGraph(rfNodes, rfEdges), [rfNodes, rfEdges]);

  function removeNode(id) {
    setRfNodes((nds) => nds.filter((n) => n.id !== id));
    setRfEdges((eds) => eds.filter((e) => e.source !== id && e.target !== id));
    setSelId((s) => (s === id ? null : s));
  }

  return (
    <div className="flex h-full w-full overflow-hidden bg-gray-100">
      <div className={cn('relative border-r border-gray-200 bg-white shadow-lg transition-all duration-300', leftOpen ? 'w-[320px]' : 'w-11')}>
        <div className="absolute right-0 top-4 z-20">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setLeftOpen((v) => !v)}
            className="h-9 w-9 rounded-full border-gray-200 hover:bg-gray-100"
          >
            {leftOpen ? <ChevronLeft className="h-4 w-4" /> : <PanelLeftOpen className="h-4 w-4" />}
          </Button>
        </div>

        {leftOpen && (
          <ScrollArea>
            <div>
              <Card className="border-0 bg-gradient-to-r from-gray-50 to-gray-100">
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-2">
                    <Zap className="h-5 w-5 text-indigo-600" />
                    <CardTitle className="text-lg font-semibold text-gray-800">Chat Bot Builder</CardTitle>
                  </div>
                </CardHeader>
              </Card>

              <Card className="border-0 shadow-sm">
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-2 text-sm font-medium text-gray-700">
                    <MessageCircle className="h-4 w-4" />
                    Node Palette
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <PaletteItem label="Send Message" type={NodeTypes.SEND} icon="💬" />
                  <PaletteItem label="Ask a Question" type={NodeTypes.ASK} icon="❓" />
                  <PaletteItem label="Set a Condition" type={NodeTypes.COND} icon="🔀" />
                  <PaletteItem label="Trigger Keyword" type={NodeTypes.TRIGGER} icon="🏁" />
                  <PaletteItem label="Interactive Message" type={NodeTypes.INTERACTIVE} icon="🧩" />
                </CardContent>
              </Card>

              {/* <Card className="border-0 shadow-sm">
                <CardContent className="space-y-3">
                  <VariableEditor
                    variables={variables}
                    setVariables={(newVars) => {
                      setVariables(newVars);
                      setRfNodes((nds) =>
                        nds.map((n) => ({
                          ...n,
                          data: {
                            ...n.data,
                            variables: newVars, // ✅ sync into every node
                          },
                        })),
                      );
                    }}
                    onNext={() => {
                      // Close sidebar if needed
                      setLeftOpen(false);

                      // Also sync to all nodes before closing
                      setRfNodes((nds) =>
                        nds.map((n) => ({
                          ...n,
                          data: {
                            ...n.data,
                            variables,
                          },
                        })),
                      );
                    }}
                  />
                </CardContent>
              </Card> */}

              <Card className="border-0 shadow-sm">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-700">Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Button
                    className="w-full bg-blue-500 text-white shadow-md transition-all hover:bg-blue-600"
                    onClick={() => downloadJSON(finalObject)}
                  >
                    <Download className="mr-2 h-4 w-4" />
                    Export JSON
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full border-gray-300 bg-transparent hover:bg-gray-50"
                    onClick={() => loadSample(setRfNodes, setRfEdges)}
                  >
                    <Upload className="mr-2 h-4 w-4" />
                    Load Sample
                  </Button>
                </CardContent>
              </Card>
            </div>
          </ScrollArea>
        )}
      </div>

      <div className="relative h-[86dvh] flex-1" ref={reactFlowWrapper}>
        <ReactFlow
          nodes={rfNodes}
          edges={rfEdges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onDrop={onDrop}
          onDragOver={onDragOver}
          onNodeClick={onNodeClick}
          nodeTypes={nodeTypes}
          edgeTypes={edgeTypes}
          fitView
          className="bg-gray-50"
          proOptions={{ hideAttribution: true }}
        >
          <Background variant="dots" gap={12} size={1} className="bg-gray-100" />
          <Controls className="rounded-lg border border-gray-200 bg-white shadow-md" />
        </ReactFlow>
      </div>

      <div className={cn('relative border-l border-gray-200 bg-white shadow-lg transition-all duration-300', rightOpen ? 'w-[400px]' : 'w-11')}>
        <div className="absolute left-0 top-4 z-20">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setRightOpen((v) => !v)}
            className="h-9 w-9 rounded-full border-gray-200 hover:bg-gray-100"
          >
            {rightOpen ? <ChevronRight className="h-4 w-4" /> : <PanelRightOpen className="h-4 w-4" />}
          </Button>
        </div>

        {rightOpen && (
          <ScrollArea className="h-full">
            <div className="space-y-6 p-4">
              <Card className="border-0 bg-gradient-to-r from-gray-50 to-gray-100">
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-2">
                    <Play className="h-5 w-5 text-indigo-600" />
                    <CardTitle className="text-lg font-semibold text-gray-800">Inspector</CardTitle>
                  </div>
                </CardHeader>
              </Card>

              {!selected ? (
                <Card className="border-0 bg-gray-50 text-center">
                  <CardContent className="p-8">
                    <MessageCircle className="mx-auto mb-2 h-12 w-12 text-gray-300" />
                    <p className="text-sm text-gray-500">Select a node to edit its properties.</p>
                  </CardContent>
                </Card>
              ) : (
                <NodeInspector node={selected} onPatch={(p) => patchNode(selected.id, p)} remove={() => removeNode(selected.id)} vars={variables} />
              )}

              <Card className="border-0 shadow-sm">
                <CardHeader className="pb-2">
                  <div className="flex items-center gap-2">
                    <Code className="h-4 w-4 text-gray-600" />
                    <CardTitle className="text-sm font-medium text-gray-700">Live JSON Preview</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="max-h-[40vh] overflow-auto">
                  <pre className="rounded-lg bg-gray-900 p-3 font-mono text-xs text-gray-100">{JSON.stringify(finalObject, null, 2)}</pre>
                </CardContent>
              </Card>
            </div>
          </ScrollArea>
        )}
      </div>
    </div>
  );
}

export default function WhatsAppFlowBuilder() {
  return (
    <ReactFlowProvider>
      <EditorShell />
    </ReactFlowProvider>
  );
}
