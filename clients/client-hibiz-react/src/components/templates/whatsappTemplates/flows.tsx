import { useWhatsapp } from '@/components/store/useWhatsapp';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/components/utils/helper';
import {
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  FileText,
  GripVertical,
  Hash,
  ImageIcon,
  MessageSquare,
  PanelLeftOpen,
  PanelRightOpen,
  Plus,
  Upload,
  Variable,
  X,
  XCircle,
} from 'lucide-react';
import { useCallback, useMemo, useRef, useState } from 'react';
import ReactFlow, {
  Background,
  BaseEdge,
  Controls,
  Handle,
  MiniMap,
  Position,
  ReactFlowProvider,
  addEdge,
  applyEdgeChanges,
  applyNodeChanges,
  getBezierPath,
  useReactFlow,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { useMediaUpload } from '../../../hooks/useTemplates';
import { Button } from '../../ui/button';

// =============================
// WhatsApp Flow Builder (React Flow)
// - Drag nodes from palette → canvas
// - Connect via handles (TRUE/FALSE, template buttons, trigger start)
// - Inspector to edit node meta
// - Variables & Templates side-panels
// - Export JSON (runtime-ready)
// - Load Sample graph
// - FIXES: applyNodeChanges/applyEdgeChanges + screenToFlowPosition
// =============================

const NodeTypes = {
  SEND: 'send_message',
  ASK: 'ask_question',
  COND: 'set_condition',
  TEMPLATE: 'template',
  TRIGGER: 'trigger',
  INTERACTIVE: 'interactive',
  FORM: 'form',
};

function ButtonEdge({ id, sourceX, sourceY, targetX, targetY, markerEnd }) {
  const [path] = getBezierPath({ sourceX, sourceY, targetX, targetY });
  return <BaseEdge id={id} path={path} markerEnd={markerEnd} />;
}

const edgeTypes = {
  button: ButtonEdge,
};

const INPUT_TYPES = [
  { id: 'text', label: 'Text' },
  { id: 'phone', label: 'Phone' },
  { id: 'email', label: 'Email' },
  { id: 'number', label: 'Number' },
];

const nid = () => Math.random().toString(36).slice(2, 10);
function BaseNode({ data, selected, children, border = '#262626' }) {
  return (
    <div className="min-w-[260px] rounded-xl border bg-white text-neutral-100" style={{ borderColor: selected ? '#10b981' : border }}>
      <div className="flex items-center gap-2 border-b border-neutral-800 px-3 py-2 text-sm">
        <span className="text-lg" role="img" aria-label="icon">
          {data.icon}
        </span>
        <h1 className="flex-1 font-semibold text-neutral-900">{data.name}</h1>
      </div>
      <div className="space-y-2 p-3 text-sm">{children}</div>
    </div>
  );
}

function SendNode({ data, selected }) {
  const m = data.meta || {};
  const { uploadMedia } = useMediaUpload();
  const { setImageFiles } = useWhatsapp((s) => ({
    setImageFiles: s.setImageFiles,
  }));

  const [newVar, setNewVar] = useState('');
  const [showAddVar, setShowAddVar] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const textRef = useRef(null);

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

    // Restore focus and cursor position
    setTimeout(() => {
      el.focus();
      el.setSelectionRange(start + placeholder.length, start + placeholder.length);
    }, 0);
  };

  const handleAddVariable = () => {
    const v = newVar.trim();
    if (!v || data.variables.includes(v)) return;

    const updated = [...data.variables, v];
    data.onPatch({ variables: updated });
    data.updateGlobalVariables?.([v]);
    insertVariable(v);
    setNewVar('');
    setShowAddVar(false);
  };

  const handleFileChange = async (file) => {
    if (!file) return;
    setImageFiles(file);
    data.onPatch({ meta: { ...m, uploading: true } });

    try {
      const { url } = await uploadMedia();
      data.onPatch({
        meta: {
          ...m,
          mediaUrl: url,
          fileName: file.name,
          uploading: false,
        },
      });
    } catch (err) {
      console.error('Upload failed', err);
      data.onPatch({ meta: { ...m, uploading: false } });
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      handleFileChange(file);
    }
  };

  const contentTypes = [
    { value: 'text', label: 'Text', icon: <FileText className="h-3 w-3" /> },
    { value: 'image', label: 'Image', icon: <ImageIcon className="h-3 w-3" /> },
    { value: 'document', label: 'Document', icon: <FileText className="h-3 w-3" /> },
  ];

  return (
    <div className="relative">
      <Handle type="target" position={Position.Left} className="opacity-0" />

      <Card
        className={cn(
          'w-80 border-2 shadow-lg transition-all',
          selected ? 'border-emerald-500 ring-2 ring-emerald-500 ring-opacity-20' : 'border-neutral-700',
          'bg-gray-200 text-gray-900',
        )}
      >
        <div className="space-y-4 p-4">
          {/* Header: Content Type Tabs */}
          <div className="flex gap-1 rounded-lg p-1">
            {contentTypes.map((type) => (
              <Button
                key={type.value}
                variant={m.contentType === type.value ? 'default' : 'ghost'}
                size="sm"
                onClick={() => data.onPatch({ meta: { ...m, contentType: type.value } })}
                className={cn(
                  'flex-1 gap-1 text-xs font-medium',
                  m.contentType === type.value
                    ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                    : 'text-gray-400 hover:bg-gray-700 hover:text-white',
                )}
              >
                {type.icon}
                {type.label}
              </Button>
            ))}
          </div>

          {/* TEXT CONTENT */}
          {m.contentType === 'text' && (
            <div className="space-y-3">
              {/* Variables */}
              <div className="space-y-2">
                <div className="flex flex-wrap gap-1">
                  {data.variables.map((v) => (
                    <Badge
                      key={v}
                      variant="secondary"
                      className="cursor-pointer px-2 py-0.5 text-xs font-medium transition-colors hover:bg-emerald-600"
                      onClick={() => insertVariable(v)}
                    >
                      {v}
                    </Badge>
                  ))}
                  {data.variables.length === 0 && <p className="text-xs italic text-gray-500">No variables yet</p>}
                </div>

                {/* Add variable form */}
                {showAddVar ? (
                  <div className="flex gap-2">
                    <Input
                      value={newVar}
                      onChange={(e) => setNewVar(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleAddVariable()}
                      placeholder="new_variable"
                      className="h-8 text-xs"
                      autoFocus
                    />
                    <Button size="sm" onClick={handleAddVariable} className="h-8 px-3">
                      Add
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => setShowAddVar(false)} className="h-8 px-3">
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                ) : (
                  <Button variant="outline" size="sm" onClick={() => setShowAddVar(true)} className="h-8 w-full text-xs">
                    <Plus className="mr-1 h-3 w-3" /> Add Variable
                  </Button>
                )}
              </div>

              {/* Message Textarea */}
              <Textarea
                ref={textRef}
                value={m.text || ''}
                onChange={(e) => data.onPatch({ meta: { ...m, text: e.target.value } })}
                placeholder="Type your message... use {{variable}} for dynamic content"
                className="min-h-24 resize-none border-neutral-700 text-sm placeholder:text-gray-500"
              />
            </div>
          )}

          {/* IMAGE CONTENT */}
          {m.contentType === 'image' && (
            <div className="space-y-3">
              {/* Upload Area */}
              <div
                className={cn(
                  'rounded-lg border-2 border-dashed p-4 text-center transition-colors',
                  isDragging ? 'border-emerald-500 bg-emerald-900/20' : 'border-neutral-700',
                  m.mediaUrl && 'border-solid',
                )}
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsDragging(true);
                }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleDrop}
              >
                {m.uploading ? (
                  <div className="space-y-2">
                    <Skeleton className="h-32 w-full rounded" />
                    <p className="text-xs text-gray-400">Uploading...</p>
                  </div>
                ) : m.mediaUrl ? (
                  <div className="space-y-2">
                    <img src={m.mediaUrl} alt="Preview" className="mx-auto h-32 w-32 rounded-lg border border-neutral-700 object-cover" />
                    <p className="truncate text-xs text-gray-400">{m.fileName}</p>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => data.onPatch({ meta: { ...m, mediaUrl: '', fileName: '', uploading: false } })}
                    >
                      Remove
                    </Button>
                  </div>
                ) : (
                  <label className="block cursor-pointer">
                    <input type="file" accept="image/*" className="hidden" onChange={(e) => handleFileChange(e.target.files?.[0])} />
                    <Upload className="mx-auto mb-2 h-8 w-8 text-gray-500" />
                    <p className="text-xs text-gray-400">Drop image or click to upload</p>
                  </label>
                )}
              </div>

              {/* Caption */}
              <Input
                value={m.caption || ''}
                onChange={(e) => data.onPatch({ meta: { ...m, caption: e.target.value } })}
                placeholder="Caption (optional)"
                className="text-sm"
              />
            </div>
          )}

          {/* DOCUMENT CONTENT */}
          {m.contentType === 'document' && (
            <div className="space-y-3">
              <Input
                value={m.mediaUrl || ''}
                onChange={(e) => data.onPatch({ meta: { ...m, mediaUrl: e.target.value } })}
                placeholder="Document URL"
                className="text-sm"
              />
              <Input
                value={m.fileName || ''}
                onChange={(e) => data.onPatch({ meta: { ...m, fileName: e.target.value } })}
                placeholder="Display file name"
                className="text-sm"
              />
            </div>
          )}
        </div>
      </Card>

      <Handle type="source" position={Position.Right} className="opacity-0" />
    </div>
  );
}

function InteractiveNode({ data, selected }) {
  const m = data.meta || {};
  console.log('InteractiveNode meta', m);
  const { uploadMedia } = useMediaUpload();
  const { setImageFiles } = useWhatsapp((s) => ({
    setImageFiles: s.setImageFiles,
  }));

  // Handle button add/remove/update
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

  return (
    <div>
      <Handle type="target" position={Position.Left} />
      <BaseNode data={data} selected={selected} border="#3b82f6">
        {/* Header upload */}
        <div className="space-y-2">
          <label className="text-xs text-neutral-400">Header (optional)</label>
          <select
            value={m.header?.type || ''}
            onChange={(e) =>
              data.onPatch({
                meta: { ...m, header: { type: e.target.value, mediaUrl: '' } },
              })
            }
            className="w-full rounded border border-neutral-800 px-3 py-2"
          >
            <option value="">None</option>
            <option value="image">Image</option>
          </select>

          {m.header?.type === 'image' && (
            <div className="space-y-2">
              <input
                type="file"
                accept="image/*"
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  setImageFiles(file);
                  try {
                    data.onPatch({ meta: { ...m, uploadingHeader: true } });
                    const { url, handle } = await uploadMedia();
                    data.onPatch({
                      meta: {
                        ...m,
                        header: {
                          type: 'image',
                          mediaUrl: url,
                          handle,
                          fileName: file.name,
                        },
                        uploadingHeader: false,
                      },
                    });
                  } catch (err) {
                    console.error('Header upload failed', err);
                    data.onPatch({ meta: { ...m, uploadingHeader: false } });
                  }
                }}
                className="w-full text-xs"
              />
              {m.uploadingHeader && <div className="text-xs text-neutral-400">Uploading header...</div>}
              {m.header?.mediaUrl && <img src={m.header.mediaUrl} alt="header" className="rounded-lg border border-neutral-800" />}
            </div>
          )}
        </div>

        {/* Body & Footer */}
        <textarea
          value={m.bodyText || ''}
          onChange={(e) => data.onPatch({ meta: { ...m, bodyText: e.target.value } })}
          placeholder="Body text..."
          rows={3}
          className="mt-3 w-full rounded border border-neutral-800 px-3 py-2"
        />
        <input
          value={m.footerText || ''}
          onChange={(e) => data.onPatch({ meta: { ...m, footerText: e.target.value } })}
          placeholder="Footer (optional)"
          className="w-full rounded border border-neutral-800 px-3 py-2"
        />

        {/* Buttons */}
        <div className="mt-3 space-y-2 border-t border-neutral-800 pt-2">
          <div className="flex items-center justify-between">
            <div className="text-xs text-neutral-400">Buttons</div>
            <Button onClick={addButton} className="rounded border border-neutral-700 px-2 py-1 text-xs hover:bg-neutral-700">
              + Add
            </Button>
          </div>

          {(m.buttons || []).map((btn, i) => (
            <div key={i} className="flex flex-col gap-2 rounded-lg border border-neutral-800 p-2">
              <div className="flex items-center gap-2">
                <select
                  value={btn.type}
                  onChange={(e) => updateButton(i, { type: e.target.value, url: '' })}
                  className="rounded border border-neutral-800 px-2 py-1 text-xs"
                >
                  <option value="reply">Reply</option>
                  <option value="url">URL</option>
                </select>
                <input
                  value={btn.title}
                  onChange={(e) => updateButton(i, { title: e.target.value })}
                  placeholder="Button Title"
                  className="flex-1 rounded border border-neutral-800 px-2 py-1 text-xs"
                />
                <Button onClick={() => removeButton(i)} className="rounded bg-red-600 px-2 py-1 text-xs">
                  ✕
                </Button>
              </div>
              {btn.type === 'url' && (
                <input
                  value={btn.url || ''}
                  onChange={(e) => updateButton(i, { url: e.target.value })}
                  placeholder="https://..."
                  className="w-full rounded border border-neutral-800 px-2 py-1 text-xs"
                />
              )}
            </div>
          ))}
        </div>
      </BaseNode>
      <Handle type="source" position={Position.Right} />
    </div>
  );
}

function AskNode({ data, selected }) {
  const m = data.meta || {};
  return (
    <div>
      <Handle type="target" position={Position.Left} />
      <BaseNode data={data} selected={selected}>
        <input
          value={m.prompt || ''}
          onChange={(e) => data.onPatch({ meta: { ...m, prompt: e.target.value } })}
          placeholder="Ask something..."
          className="w-full rounded border border-neutral-800 px-3 py-2"
        />
        <div className="grid grid-cols-2 gap-2">
          <select
            value={m.variable || ''}
            onChange={(e) => data.onPatch({ meta: { ...m, variable: e.target.value } })}
            className="rounded border border-neutral-800 px-3 py-2"
          >
            <option value="">store in variable</option>
            {data.variables.map((v) => (
              <option key={v} value={v}>
                {v}
              </option>
            ))}
          </select>
          <select
            value={m.inputType || 'text'}
            onChange={(e) => data.onPatch({ meta: { ...m, inputType: e.target.value } })}
            className="rounded border border-neutral-800 px-3 py-2"
          >
            {INPUT_TYPES.map((t) => (
              <option key={t.id} value={t.id}>
                {t.label}
              </option>
            ))}
          </select>
        </div>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={m.required ?? true} onChange={(e) => data.onPatch({ meta: { ...m, required: !!e.target.checked } })} />
          Required
        </label>
      </BaseNode>
      <Handle type="source" position={Position.Right} />
    </div>
  );
}

function CondNode({ data, selected }) {
  return (
    <div>
      <Handle type="target" position={Position.Left} />
      <BaseNode data={data} selected={selected} border="#fbbf24">
        <div className="space-y-2" />
      </BaseNode>
      <Handle id="true" type="source" position={Position.Right} />
      <Handle id="false" type="source" position={Position.Bottom} />
    </div>
  );
}

function TemplateNode({ data, selected }) {
  const entries = Object.entries(data.meta.buttonRoutes || {});
  return (
    <div>
      <Handle type="target" position={Position.Left} />
      <BaseNode data={data} selected={selected}>
        <input
          value={data.meta.templateId || ''}
          onChange={(e) => data.onPatch({ meta: { ...data.meta, templateId: e.target.value } })}
          placeholder="template id"
          className="w-full rounded border border-neutral-800 px-3 py-2"
        />
        <div className="space-y-1">
          {entries.map(([k]) => (
            <div key={k} className="text-xs">
              • {k} — drag from small handle to target
            </div>
          ))}
        </div>
        <button
          type="button"
          className="mt-2 rounded border border-neutral-700 px-3 py-1 text-xs hover:bg-neutral-700"
          onClick={() => {
            const key = prompt('Enter button payload/text key') || '';
            if (!key) return;
            const br = { ...(data.meta.buttonRoutes || {}) };
            if (br[key]) return alert('Key exists');
            br[key] = null;
            data.onPatch({ meta: { ...data.meta, buttonRoutes: br } });
          }}
        >
          + Add button mapping
        </button>
      </BaseNode>
      {/* Dynamic source handles per button */}
      <div className="relative h-0">
        {Object.keys(data.meta.buttonRoutes || {}).map((k, i) => (
          <Handle key={k} id={`btn:${k}`} type="source" position={Position.Right} style={{ top: 28 + i * 18, right: -6 }} />
        ))}
      </div>
    </div>
  );
}

function TriggerNode({ data, selected }) {
  return (
    <div>
      <BaseNode data={data} selected={selected}>
        <div className="flex flex-wrap gap-2">
          {(data.meta.keywords || []).map((k) => (
            <span key={k} className="rounded-full border border-neutral-700 px-2 py-1 text-xs">
              {k}
            </span>
          ))}
        </div>
        <div className="text-xs text-neutral-400">Connect handle to first node.</div>
      </BaseNode>
      <Handle id="start" type="source" position={Position.Right} />
    </div>
  );
}

const nodeTypes = {
  [NodeTypes.SEND]: SendNode,
  [NodeTypes.ASK]: AskNode,
  [NodeTypes.COND]: CondNode,
  [NodeTypes.TRIGGER]: TriggerNode,
  [NodeTypes.INTERACTIVE]: InteractiveNode,
  [NodeTypes.FORM]: FormNode,
};

// ----------------- Main -----------------
export default function WhatsAppFlowBuilderWithReactFlow() {
  return (
    <ReactFlowProvider>
      <EditorShell />
    </ReactFlowProvider>
  );
}

function EditorShell() {
  const [rfNodes, setRfNodes] = useState([]);
  const [rfEdges, setRfEdges] = useState([]);
  const [selId, setSelId] = useState(null);
  const [variables, setVariables] = useState(['name', 'phone', 'email']);
  const updateGlobalVariables = (newVars) => {
    setVariables((prev) => {
      const merged = Array.from(new Set([...prev, ...newVars]));
      return merged;
    });

    // Also patch all nodes to refresh their local variable list
    setRfNodes((nds) =>
      nds.map((n) => ({
        ...n,
        data: { ...n.data, variables: Array.from(new Set([...n.data.variables, ...newVars])) },
      })),
    );
  };

  // const [templates, setTemplates] = useState([]);
  const [leftOpen, setLeftOpen] = useState(true);
  const [rightOpen, setRightOpen] = useState(true);

  const { screenToFlowPosition } = useReactFlow();
  const wrapperRef = useRef(null);

  const onNodesChange = useCallback((changes) => setRfNodes((nds) => applyNodeChanges(changes, nds)), []);
  const onEdgesChange = useCallback((changes) => setRfEdges((eds) => applyEdgeChanges(changes, eds)), []);

  const onConnect = useCallback((params) => {
    const edge = { ...params, id: `e-${nid()}`, data: {} };
    if (params.sourceHandle === 'true') edge.data.kind = 'cond:true';
    if (params.sourceHandle === 'false') edge.data.kind = 'cond:false';
    if (params.sourceHandle?.startsWith('btn:')) {
      edge.data.kind = 'template:btn';
      edge.data.btnKey = params.sourceHandle.slice(4);
    }
    if (params.sourceHandle === 'start') edge.data.kind = 'trigger:start';
    setRfEdges((eds) => addEdge(edge, eds));
  }, []);

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
        addKw: (kw) => addKeyword(id, kw),
        setKw: (v) => setKwDraft(id, v),
        addLogic: () => addLogic(id),
        removeLogic: (i) => removeLogic(id, i),
        updateLogic: (i, p) => updateLogic(id, i, p),
        updateGlobalVariables, // 👈 passed here
      }),
    ]);
    setSelId(id);
  }

  const onDrop = useCallback(
    (event) => {
      event.preventDefault();
      const type = event.dataTransfer.getData('application/reactflow');
      if (!type) return;
      const pos = screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });
      addNode(type, { x: pos.x, y: pos.y });
    },
    [screenToFlowPosition, addNode],
  );

  const onDragOver = useCallback((event) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  // Node patchers
  const patchNode = (id, patch) => {
    setRfNodes((nds) =>
      nds.map((n) =>
        n.id === id
          ? {
              ...n,
              data: {
                ...n.data,
                ...patch,
                meta: { ...n.data.meta, ...(patch.meta || {}) },
              },
            }
          : n,
      ),
    );
  };
  const addKeyword = (id, kw) => {
    setRfNodes((nds) =>
      nds.map((n) => {
        if (n.id !== id) return n;
        const m = n.data.meta || { keywords: [] };
        const arr = [...(m.keywords || [])];
        if (!arr.includes(kw)) arr.push(kw);
        return {
          ...n,
          data: { ...n.data, meta: { ...m, keywords: arr } },
        };
      }),
    );
  };
  const setKwDraft = (id, v) => patchNode(id, { _kw: v });
  const addLogic = (id) => {
    setRfNodes((nds) =>
      nds.map((n) => {
        if (n.id !== id) return n;
        const m = n.data.meta || { logic: [] };
        const logic = [...(m.logic || []), { var: variables[0] || '', op: 'exists', value: '' }];
        return { ...n, data: { ...n.data, meta: { ...m, logic } } };
      }),
    );
  };
  const removeLogic = (id, idx) => {
    setRfNodes((nds) =>
      nds.map((n) => {
        if (n.id !== id) return n;
        const m = n.data.meta || { logic: [] };
        return {
          ...n,
          data: {
            ...n.data,
            meta: {
              ...m,
              logic: (m.logic || []).filter((_, i) => i !== idx),
            },
          },
        };
      }),
    );
  };
  const updateLogic = (id, idx, patch) => {
    setRfNodes((nds) =>
      nds.map((n) => {
        if (n.id !== id) return n;
        const m = n.data.meta || { logic: [] };
        const logic = (m.logic || []).map((l, i) => (i === idx ? { ...l, ...patch } : l));
        return { ...n, data: { ...n.data, meta: { ...m, logic } } };
      }),
    );
  };

  const selected = rfNodes.find((n) => n.id === selId) || null;
  const finalObject = useMemo(() => buildFinalFromGraph(rfNodes, rfEdges), [rfNodes, rfEdges]);

  return (
    <div className="flex h-[calc(100vh-8rem)] w-full overflow-hidden text-neutral-100">
      {/* LEFT SIDEBAR */}
      <div className={`relative border-r border-neutral-800 transition-all duration-300 ${leftOpen ? 'w-[300px]' : 'w-[44px]'}`}>
        <div className="absolute right-4 top-3 z-20">
          <button type="button" onClick={() => setLeftOpen((v) => !v)} className="rounded-full border border-neutral-700 p-1 hover:bg-neutral-700">
            {leftOpen ? <ChevronLeft className="h-4 w-4 text-neutral-300" /> : <PanelLeftOpen className="h-4 w-4 text-neutral-300" />}
          </button>
        </div>

        {leftOpen && (
          <div className="h-full space-y-3 overflow-y-auto p-4">
            <h2 className="text-xl font-semibold">Chat Bot</h2>
            <PaletteItem label="Send Message" type={NodeTypes.SEND} icon="💬" />
            <PaletteItem label="Ask a Question" type={NodeTypes.ASK} icon="❓" />
            <PaletteItem label="Set a Condition" type={NodeTypes.COND} icon="🔀" />
            <PaletteItem label="Trigger Keyword" type={NodeTypes.TRIGGER} icon="🏁" />
            <PaletteItem label="Interactive Form" type={NodeTypes.FORM} icon="🧩" />

            <div className="pt-6">
              <h3 className="mb-2 text-sm uppercase tracking-wide text-neutral-400">Variables</h3>
              <VariableEditor
                variables={variables}
                setVariables={setVariables}
                onNext={() => {
                  setLeftOpen(false);
                  alert('Variables saved. You can now start building your flow!');
                }}
              />
            </div>

            {/* <div className="pt-6">
              <h3 className="mb-2 text-sm uppercase tracking-wide text-neutral-400">Templates</h3>
              <TemplateList templates={templates} onUpdate={setTemplates} />
            </div> */}

            <div className="space-y-2 pt-6">
              <Button className="w-full rounded-lg bg-emerald-600 py-2 hover:bg-emerald-500" onClick={() => downloadJSON(finalObject)}>
                Export JSON
              </Button>
              <Button className="w-full rounded-lg py-2 hover:bg-neutral-700" onClick={() => loadSample(setRfNodes, setRfEdges)}>
                Load Sample
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* CANVAS */}
      <div className="relative flex-1" ref={wrapperRef}>
        <ReactFlow
          nodes={rfNodes}
          edges={rfEdges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onDrop={onDrop}
          onDragOver={onDragOver}
          onNodeClick={(_, n) => setSelId(n.id)}
          nodeTypes={nodeTypes}
          edgeTypes={edgeTypes}
          fitView
        >
          <Background />
          <MiniMap />
          <Controls />
        </ReactFlow>
      </div>

      {/* RIGHT SIDEBAR */}
      <div className={`relative border-l border-neutral-800 transition-all duration-300 ${rightOpen ? 'w-[380px]' : 'w-[44px]'}`}>
        <div className="absolute left-0 top-3 z-20">
          <button type="button" onClick={() => setRightOpen((v) => !v)} className="rounded-full border border-neutral-700 p-1 hover:bg-neutral-700">
            {rightOpen ? <ChevronRight className="h-4 w-4 text-neutral-300" /> : <PanelRightOpen className="h-4 w-4 text-neutral-300" />}
          </button>
        </div>

        {rightOpen && (
          <div className="h-full space-y-3 overflow-y-auto p-4">
            <h2 className="pl-4 text-xl font-semibold">Inspector</h2>
            {!selected && <div className="rounded-xl border border-neutral-800 p-4 text-neutral-300">Select a node to edit.</div>}
            {selected && (
              <NodeInspector node={selected} onPatch={(p) => patchNode(selected.id, p)} remove={() => removeNode(selected.id)} vars={variables} />
            )}
            <div className="pt-4">
              <h3 className="mb-2 text-sm uppercase tracking-wide text-neutral-400">Live JSON</h3>
              <pre className="max-h-[40vh] overflow-auto rounded-lg border border-neutral-800 p-3 text-xs">
                {JSON.stringify(finalObject, null, 2)}
              </pre>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  function removeNode(id) {
    setRfNodes((nds) => nds.filter((n) => n.id !== id));
    setRfEdges((eds) => eds.filter((e) => e.source !== id && e.target !== id));
    setSelId((s) => (s === id ? null : s));
  }
}

function PaletteItem({ label, type, icon }) {
  const onDragStart = (event) => {
    event.dataTransfer.setData('application/reactflow', type);
    event.dataTransfer.effectAllowed = 'move';
  };
  return (
    <div
      draggable
      onDragStart={onDragStart}
      className="flex cursor-move items-center gap-2 rounded-lg border border-neutral-700 px-3 py-2 hover:bg-neutral-700"
    >
      <span className="text-lg">{icon}</span>
      <span>{label}</span>
    </div>
  );
}

function VariableEditor({ variables, setVariables, onNext }) {
  const [v, setV] = useState('');
  const [step, setStep] = useState<'list' | 'add'>('list');
  const [error, setError] = useState('');

  const handleAdd = () => {
    const name = v.trim();
    if (!name) {
      setError('Variable name required');
      return;
    }
    if (variables.includes(name)) {
      setError('Variable already exists');
      return;
    }
    setVariables([...variables, name]);
    setV('');
    setError('');
    setStep('list'); // go back to list view after adding
  };

  return (
    <div className="space-y-3 rounded-xl border border-neutral-800 p-4">
      {step === 'list' && (
        <>
          <div className="flex items-center justify-between">
            <h3 className="text-sm uppercase tracking-wide text-neutral-400">Variables</h3>
            <Button className="rounded-lg border border-neutral-700 px-2 py-1 text-xs hover:bg-neutral-700" onClick={() => setStep('add')}>
              + Add
            </Button>
          </div>

          <div className="flex flex-wrap gap-2">
            {variables.length === 0 && <span className="text-xs text-neutral-500">No variables added yet.</span>}
            {variables.map((vv) => (
              <span key={vv} className="flex items-center gap-1 rounded-full border border-neutral-700 px-2 py-1 text-xs">
                {vv}
                <button onClick={() => setVariables((prev) => prev.filter((x) => x !== vv))} className="text-red-400 hover:text-red-300">
                  ✕
                </button>
              </span>
            ))}
          </div>

          {variables.length > 0 && (
            <div className="pt-3">
              <Button className="w-full rounded-lg bg-emerald-600 py-2 text-sm font-semibold hover:bg-emerald-500" onClick={() => onNext?.()}>
                Next →
              </Button>
            </div>
          )}
        </>
      )}

      {step === 'add' && (
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-neutral-300">Add a New Variable</h3>
          <input
            value={v}
            onChange={(e) => setV(e.target.value)}
            placeholder="Enter variable name (e.g. name, phone)"
            className="w-full rounded-lg border border-neutral-700 px-3 py-2 text-sm text-neutral-100 focus:outline-none"
          />
          {error && <div className="text-xs text-red-400">{error}</div>}
          <div className="flex gap-2">
            <Button onClick={handleAdd} className="flex-1 rounded-lg bg-emerald-600 py-2 text-sm font-semibold hover:bg-emerald-500">
              Add Variable
            </Button>
            <Button
              onClick={() => {
                setStep('list');
                setV('');
                setError('');
              }}
              className="rounded-lg py-2 text-sm font-semibold hover:bg-neutral-700"
            >
              Cancel
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

function TemplateList({ templates, onUpdate }) {
  const [name, setName] = useState('');
  const [btn, setBtn] = useState('');
  const [sel, setSel] = useState(templates[0]?.id ?? '');
  const current = templates.find((t) => t.id === sel) || null;
  return (
    <div className="space-y-3 rounded-xl border border-neutral-800 p-3">
      <label className="text-sm text-neutral-300">Select Template</label>
      <select value={sel} onChange={(e) => setSel(e.target.value)} className="w-full rounded-lg border border-neutral-700 px-3 py-2">
        {templates.map((t) => (
          <option key={t.id} value={t.id}>
            {t.name}
          </option>
        ))}
      </select>
      {current && (
        <div className="space-y-2">
          <div className="text-xs text-neutral-400">Buttons</div>
          <ul className="space-y-1">
            {current.buttons.map((b) => (
              <li key={b.id} className="text-sm text-neutral-200">
                • {b.text}
              </li>
            ))}
          </ul>
        </div>
      )}
      <div className="space-y-2 border-t border-neutral-800 pt-3">
        <div className="text-xs text-neutral-400">Create New Template (local)</div>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Name"
          className="w-full rounded-lg border border-neutral-700 px-3 py-2"
        />
        <div className="flex gap-2">
          <input
            value={btn}
            onChange={(e) => setBtn(e.target.value)}
            placeholder="Button text"
            className="flex-1 rounded-lg border border-neutral-700 px-3 py-2"
          />
          <Button
            className="rounded-lg border border-neutral-700 px-3 py-2 hover:bg-neutral-700"
            onClick={() => {
              if (!name.trim()) return;
              const t = {
                id: `tpl_${nid()}`,
                name: name.trim(),
                language: 'en',
                components: [{ type: 'BODY', text: `Hello {{1}}` }],
                buttons: btn.trim() ? [{ id: `b_${nid()}`, type: 'QUICK_REPLY', text: btn.trim() }] : [],
              };
              onUpdate([...templates, t]);
              setName('');
              setBtn('');
              setSel(t.id);
            }}
          >
            Add Template
          </Button>
        </div>
      </div>
    </div>
  );
}

export function ButtonListEditor({ buttons, onChange }) {
  const [title, setTitle] = useState('');
  return (
    <div>
      <div className="flex gap-2">
        <input
          className="flex-1 rounded-lg border border-neutral-700 px-3 py-2"
          placeholder="Button title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <button
          className="rounded-lg bg-emerald-600 px-3 py-2"
          onClick={() => {
            if (!title.trim()) return;
            const id = 'opt_' + Math.random().toString(36).slice(2, 8);
            onChange([...buttons, { id, title }]);
            setTitle('');
          }}
        >
          Add
        </button>
      </div>
      <ul className="mt-2 space-y-1 text-sm text-neutral-400">
        {buttons.map((b) => (
          <li key={b.id}>
            {b.title} <span className="text-neutral-600">({b.id})</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function ListEditor({ list, onChange }) {
  const [section, setSection] = useState('');
  return (
    <div className="space-y-2">
      <input
        type="text"
        placeholder="List button text"
        value={list.buttonText}
        onChange={(e) => onChange({ ...list, buttonText: e.target.value })}
        className="w-full rounded-lg border border-neutral-700 px-3 py-2"
      />
      <input
        type="text"
        placeholder="Section title"
        value={section}
        onChange={(e) => setSection(e.target.value)}
        className="w-full rounded-lg border border-neutral-700 px-3 py-2"
      />
      <button
        className="rounded-lg bg-emerald-600 px-3 py-2"
        onClick={() => {
          if (!section.trim()) return;
          onChange({
            ...list,
            sections: [...list.sections, { title: section, rows: [] }],
          });
          setSection('');
        }}
      >
        Add Section
      </button>
      <pre className="mt-2 text-xs text-neutral-400">{JSON.stringify(list, null, 2)}</pre>
    </div>
  );
}

function NodeInspector({ node, onPatch, remove, vars }) {
  const data = node.data || {};
  return (
    <div className="space-y-3 rounded-xl border border-neutral-800 p-3">
      <div className="flex items-center justify-between gap-2">
        <div>
          <label className="text-xs text-neutral-400">Display name</label>
          <h1 className="flex-1 font-semibold text-neutral-900">{data.name || 'Untitled'}</h1>
        </div>
        <Button className="rounded bg-red-600 px-3 py-2" onClick={remove}>
          Delete
        </Button>
      </div>

      {node.type === NodeTypes.SEND && <SendQuick meta={data.meta} onPatch={(m) => onPatch({ meta: m })} />}
      {node.type === NodeTypes.ASK && <AskQuick meta={data.meta} onPatch={(m) => onPatch({ meta: m })} variables={vars} />}
      {node.type === NodeTypes.COND && <CondQuick meta={data.meta} onPatch={(m) => onPatch({ meta: m })} variables={vars} />}
      {node.type === NodeTypes.TRIGGER && <TriggerQuick meta={data.meta} onPatch={(m) => onPatch({ meta: m })} />}
      {node.type === 'interactive_message' && (
        <div className="space-y-4">
          {/* Layout selector */}
          <label className="block text-sm font-semibold">Layout Type</label>
          <select
            value={node.data.layout || 'button'}
            onChange={(e) => onPatch({ layout: e.target.value })}
            className="w-full rounded-lg border border-neutral-700 px-3 py-2"
          >
            <option value="button">Button</option>
            <option value="list">List</option>
            <option value="cta_url">CTA (Open Link)</option>
          </select>

          {/* Common fields */}
          <input
            type="text"
            value={node.data.bodyText || ''}
            onChange={(e) => onPatch({ bodyText: e.target.value })}
            placeholder="Body Text"
            className="w-full rounded-lg border border-neutral-700 px-3 py-2"
          />
          <input
            type="text"
            value={node.data.footerText || ''}
            onChange={(e) => onPatch({ footerText: e.target.value })}
            placeholder="Footer Text"
            className="w-full rounded-lg border border-neutral-700 px-3 py-2"
          />

          {/* Header section */}
          <div>
            <label className="block text-sm font-semibold">Header Type</label>
            <select
              value={node.data.header?.type || ''}
              onChange={(e) => onPatch({ header: { ...node.data.header, type: e.target.value } })}
              className="w-full rounded-lg border border-neutral-700 px-3 py-2"
            >
              <option value="">None</option>
              <option value="image">Image</option>
              <option value="video">Video</option>
              <option value="document">Document</option>
              <option value="text">Text</option>
            </select>
            {node.data.header?.type && (
              <input
                type="text"
                value={node.data.header?.mediaUrl || ''}
                onChange={(e) =>
                  onPatch({
                    header: { ...node.data.header, mediaUrl: e.target.value },
                  })
                }
                placeholder="Header Media URL"
                className="mt-2 w-full rounded-lg border border-neutral-700 px-3 py-2"
              />
            )}
          </div>

          {/* Conditional render by layout */}
          {node.data.layout === 'button' && <ButtonListEditor buttons={node.data.buttons || []} onChange={(buttons) => onPatch({ buttons })} />}

          {node.data.layout === 'list' && (
            <ListEditor list={node.data.list || { buttonText: '', sections: [] }} onChange={(list) => onPatch({ list })} />
          )}

          {node.data.layout === 'cta_url' && (
            <div className="space-y-2">
              <input
                type="text"
                value={node.data.cta?.label || ''}
                onChange={(e) => onPatch({ cta: { ...node.data.cta, label: e.target.value } })}
                placeholder="Button Label"
                className="w-full rounded-lg border border-neutral-700 px-3 py-2"
              />
              <input
                type="text"
                value={node.data.cta?.url || ''}
                onChange={(e) => onPatch({ cta: { ...node.data.cta, url: e.target.value } })}
                placeholder="Button URL"
                className="w-full rounded-lg border border-neutral-700 px-3 py-2"
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}

const contentTypes = [
  { id: 'text', label: 'Text', icon: MessageSquare },
  { id: 'image', label: 'Image', icon: Image },
  { id: 'document', label: 'Document', icon: FileText },
];

function SendQuick({ meta = {}, onPatch }) {
  const currentMeta = { ...meta };
  const { contentType, text, mediaUrl, fileName } = currentMeta;

  return (
    // 1. Main Card Wrapper
    <div className="w-full max-w-md rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
      <div className="space-y-4">
        {/* 2. Segmented Control for Type Selection */}
        <div className="flex gap-1 rounded-lg bg-gray-100 p-1">
          {contentTypes.map((type) => (
            <button
              key={type.id}
              onClick={() => onPatch({ ...currentMeta, contentType: type.id })}
              className={cn(
                'flex-1 rounded-md px-3 py-1.5 text-sm font-medium transition-all',
                'flex items-center justify-center gap-2',
                contentType === type.id ? 'bg-white text-emerald-600 shadow-sm' : 'text-gray-500 hover:bg-white hover:shadow-sm',
              )}
            >
              {/* <type.icon className="h-4 w-4" /> */}
              <span>{type.label}</span>
            </button>
          ))}
        </div>

        {/* 3. Inputs Area */}
        <div className="space-y-3">
          {contentType === 'text' && (
            <div>
              <label htmlFor="messageText" className="mb-1.5 block text-sm font-medium text-gray-700">
                Message
              </label>
              <textarea
                id="messageText"
                value={text || ''}
                onChange={(e) => onPatch({ ...currentMeta, text: e.target.value })}
                placeholder="Type your message..."
                rows={4}
                className="w-full rounded-lg border border-gray-300 bg-gray-50 px-3 py-2 text-gray-900 placeholder-gray-400 transition-colors focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>
          )}

          {contentType === 'image' && (
            <div>
              <label htmlFor="imageUrl" className="mb-1.5 block text-sm font-medium text-gray-700">
                Image URL
              </label>
              <input
                id="imageUrl"
                type="text"
                value={mediaUrl || ''}
                onChange={(e) => onPatch({ ...currentMeta, mediaUrl: e.target.value })}
                placeholder="https://example.com/image.png"
                className="w-full rounded-lg border border-gray-300 bg-gray-50 px-3 py-2 text-gray-900 placeholder-gray-400 transition-colors focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>
          )}

          {contentType === 'document' && (
            <div className="space-y-3">
              <div>
                <label htmlFor="docUrl" className="mb-1.5 block text-sm font-medium text-gray-700">
                  Document URL
                </label>
                <input
                  id="docUrl"
                  type="text"
                  value={mediaUrl || ''}
                  onChange={(e) => onPatch({ ...currentMeta, mediaUrl: e.target.value })}
                  placeholder="https://example.com/document.pdf"
                  className="w-full rounded-lg border border-gray-300 bg-gray-50 px-3 py-2 text-gray-900 placeholder-gray-400 transition-colors focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>
              <div>
                <label htmlFor="fileName" className="mb-1.5 block text-sm font-medium text-gray-700">
                  File Name (e.g., receipt.pdf)
                </label>
                <input
                  id="fileName"
                  type="text"
                  value={fileName || ''}
                  onChange={(e) => onPatch({ ...currentMeta, fileName: e.target.value })}
                  placeholder="Annual_Report.pdf"
                  className="w-full rounded-lg border border-gray-300 bg-gray-50 px-3 py-2 text-gray-900 placeholder-gray-400 transition-colors focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function AskQuick({
  meta = {
    prompt: '',
    inputType: 'text',
  },
  onPatch,
  variables,
}) {
  return (
    <div className="space-y-2">
      <input
        value={meta.prompt || ''}
        onChange={(e) => onPatch({ ...meta, prompt: e.target.value })}
        placeholder="Prompt"
        className="w-full rounded border border-neutral-800 px-3 py-2"
      />
      <div className="grid grid-cols-2 gap-2">
        <select
          value={meta.variable || ''}
          onChange={(e) => onPatch({ ...meta, variable: e.target.value })}
          className="rounded border border-neutral-800 px-3 py-2"
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
          className="rounded border border-neutral-800 px-3 py-2"
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
  const [openDropdown, setOpenDropdown] = useState(false);
  const activeFieldRef = useRef(null); // Tracks which field is focused

  const update = (i, patch) => {
    const updatedLogic = logic.map((x, idx) => (idx === i ? { ...x, ...patch } : x));
    onPatch({ ...meta, logic: updatedLogic });
  };

  const addCondition = () => {
    onPatch({
      ...meta,
      logic: [...logic, { var: variables[0] || '', op: 'eq', value: '' }],
    });
  };

  const removeCondition = (i) => {
    onPatch({
      ...meta,
      logic: logic.filter((_, j) => j !== i),
    });
  };

  const insertVariable = (varName) => {
    if (!activeFieldRef.current) return;

    const field = activeFieldRef.current;
    const start = field.selectionStart || 0;
    const end = field.selectionEnd || 0;
    const currentValue = field.value || '';
    const newValue = currentValue.substring(0, start) + varName + currentValue.substring(end);

    // Find which condition & field
    const conditionIndex = parseInt(field.dataset.conditionIndex);
    const fieldType = field.dataset.fieldType;

    if (fieldType === 'var') {
      update(conditionIndex, { var: varName });
    } else if (fieldType === 'value') {
      update(conditionIndex, { value: newValue });
    }

    setOpenDropdown(false);
  };

  return (
    <div className="relative">
      <Card className="border-0 bg-neutral-100 p-4 shadow-sm">
        <div className="space-y-3">
          {logic.length === 0 ? (
            <div className="rounded-xl bg-emerald-50 p-8 text-center">
              <p className="text-sm text-emerald-700">No conditions added</p>
              <p className="mt-1 text-xs text-emerald-600">Click + to add a condition</p>
            </div>
          ) : (
            <div className="space-y-3">
              {logic.map((l, i) => (
                <div key={i} className="relative rounded-xl bg-emerald-50 p-4 shadow-sm ring-1 ring-emerald-200">
                  <div className="grid grid-cols-1 gap-3">
                    {/* IF + Variable */}
                    <div className="flex items-center gap-2">
                      {i === 0 && <span className="rounded bg-emerald-600 px-2 py-1 text-xs font-bold text-white">IF</span>}
                      {i > 0 && <span className="w-8 text-xs font-medium text-emerald-600">AND</span>}
                      <Select value={l.var || ''} onValueChange={(v) => update(i, { var: v })}>
                        <SelectTrigger
                          className="h-10 flex-1 border-emerald-300 bg-white text-sm"
                          onFocus={(e) => {
                            activeFieldRef.current = e.target.querySelector('input') || e.target;
                            activeFieldRef.current.dataset.conditionIndex = i;
                            activeFieldRef.current.dataset.fieldType = 'var';
                          }}
                        >
                          <SelectValue placeholder="Type or select a variable" />
                        </SelectTrigger>
                        <SelectContent>
                          {variables.map((v) => (
                            <SelectItem key={v} value={v}>
                              {v}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Operator */}
                    <Select value={l.op || 'eq'} onValueChange={(op) => update(i, { op })}>
                      <SelectTrigger className="h-10 border-emerald-300 bg-white text-sm">
                        <SelectValue>
                          {l.op === 'exists' && 'Exists'}
                          {l.op === 'eq' && 'Equal to'}
                          {l.op === 'ne' && 'Not equal to'}
                          {l.op === 'gt' && 'Greater than'}
                          {l.op === 'lt' && 'Less than'}
                          {l.op === 'contains' && 'Contains'}
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="exists">Exists</SelectItem>
                        <SelectItem value="eq">Equal to</SelectItem>
                        <SelectItem value="ne">Not equal to</SelectItem>
                        <SelectItem value="gt">Greater than</SelectItem>
                        <SelectItem value="lt">Less than</SelectItem>
                        <SelectItem value="contains">Contains</SelectItem>
                      </SelectContent>
                    </Select>

                    {/* Value Input */}
                    <Input
                      value={l.value ?? ''}
                      onChange={(e) => update(i, { value: e.target.value })}
                      onFocus={(e) => {
                        activeFieldRef.current = e.target;
                        e.target.dataset.conditionIndex = i;
                        e.target.dataset.fieldType = 'value';
                      }}
                      placeholder="Type a value"
                      className="h-10 border-emerald-300 bg-white text-sm placeholder:text-neutral-400"
                    />
                  </div>

                  {/* Cross Button */}
                  {logic.length > 1 && (
                    <Button
                      size="icon"
                      variant="ghost"
                      className="absolute -right-2 -top-2 h-7 w-7 rounded-full bg-red-100 text-red-600 hover:bg-red-200"
                      onClick={() => removeCondition(i)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* VARIABLES Dropdown Button */}
        <div className="relative">
          <Button
            variant="outline"
            className="mt-3 w-full justify-between border-emerald-300 text-emerald-700 hover:bg-emerald-50"
            onClick={() => setOpenDropdown(!openDropdown)}
          >
            <span>VARIABLES</span>
            <ChevronDown className={`h-4 w-4 transition-transform ${openDropdown ? 'rotate-180' : ''}`} />
          </Button>

          {openDropdown && (
            <div className="absolute bottom-full left-0 right-0 z-50 mb-1 rounded-lg border border-emerald-300 bg-white shadow-lg">
              <div className="max-h-48 overflow-auto p-2">
                {variables.length === 0 ? (
                  <p className="px-3 py-2 text-xs text-neutral-500">No variables</p>
                ) : (
                  variables.map((v) => (
                    <button
                      key={v}
                      onClick={() => insertVariable(v)}
                      className="block w-full rounded px-3 py-2 text-left text-sm text-neutral-700 hover:bg-emerald-50"
                    >
                      {v}
                    </button>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </Card>

      {/* Floating + Button */}
      <Button
        size="icon"
        className="absolute -bottom-6 right-4 h-12 w-12 rounded-full bg-emerald-500 text-white shadow-lg hover:bg-emerald-600"
        onClick={addCondition}
        disabled={variables.length === 0}
      >
        <Plus className="h-6 w-6" />
      </Button>

      {/* Footer */}
      <div className="mt-12 text-center text-xs text-neutral-500">
        <span className="inline-flex items-center">
          <div className="mr-1 h-2 w-2 rounded-full bg-emerald-500"></div>
          Right = TRUE
        </span>{' '}
        <span className="inline-flex items-center">
          <div className="mr-1 h-2 w-2 rounded-full bg-red-500"></div>
          Bottom = FALSE
        </span>
      </div>
    </div>
  );
}

function TemplateQuick({ meta = { buttonRoutes: {} }, onPatch }) {
  const entries = Object.entries(meta.buttonRoutes || {});
  return (
    <div className="space-y-2">
      <input
        value={meta.templateId || ''}
        onChange={(e) => onPatch({ ...meta, templateId: e.target.value })}
        placeholder="template id"
        className="w-full rounded border border-neutral-800 px-3 py-2"
      />
      <div className="space-y-1 text-xs">
        {entries.map(([k, v]) => (
          <div key={k}>
            • {k} → {v || '(connect edge)'}
          </div>
        ))}
      </div>
      <Button
        className="rounded border border-neutral-700 px-3 py-1 text-xs hover:bg-neutral-700"
        onClick={() => {
          const key = prompt('Enter button payload/text key') || '';
          if (!key) return;
          const br = { ...(meta.buttonRoutes || {}) };
          if (br[key]) return alert('Key exists');
          br[key] = null;
          onPatch({ ...meta, buttonRoutes: br });
        }}
      >
        + Add button mapping
      </Button>
      <div className="text-xs text-neutral-400">Drag edge from button handle to target node.</div>
    </div>
  );
}

function TriggerQuick({ meta = { keywords: [] }, onPatch }) {
  const [kw, setKw] = useState('');
  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <input
          value={kw}
          onChange={(e) => setKw(e.target.value)}
          placeholder="keyword"
          className="flex-1 rounded border border-neutral-800 px-3 py-2"
        />
        <Button
          className="rounded border border-neutral-700 px-3 py-2"
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
          <span key={k} className="rounded-full border border-neutral-700 px-2 py-1 text-xs">
            {k}
          </span>
        ))}
      </div>
      <div className="text-xs text-neutral-400">Connect bottom handle to first node.</div>
    </div>
  );
}

// --------------- Graph Helpers ---------------
function makeNode({ id, type, position, variables, patch, addKw, setKw, addLogic, removeLogic, updateLogic, updateGlobalVariables }) {
  return {
    id,
    type,
    position,
    data: {
      name: labelFor(type),
      icon: iconFor(type),
      meta: defaultMeta(type),
      variables,
      onPatch: patch,
      updateGlobalVariables, // 👈 added here
      addLogic: () => addLogic(id),
      removeLogic: (i) => removeLogic(id, i),
      updateLogic: (i, p) => updateLogic(id, i, p),
      _kw: '',
      _setKw: (v) => setKw(id, v),
      addKeyword: () => addKw(id, 'start'),
    },
  };
}

function labelFor(t) {
  return {
    [NodeTypes.SEND]: 'Send Message',
    [NodeTypes.ASK]: 'Ask a Question',
    [NodeTypes.COND]: 'Set a Condition',
    [NodeTypes.TRIGGER]: 'Trigger Keyword',
  }[t];
}
function iconFor(t) {
  return {
    [NodeTypes.SEND]: '💬',
    [NodeTypes.ASK]: '❓',
    [NodeTypes.COND]: '🔀',
    [NodeTypes.TRIGGER]: '🏁',
  }[t];
}

// ----------------- FORM NODE -----------------
function FormNode({ data, selected }) {
  const m = data.meta || {};
  const { uploadMedia } = useMediaUpload();
  const { setImageFiles } = useWhatsapp((s) => ({
    setImageFiles: s.setImageFiles,
  }));

  const addOption = () => {
    const newOpt = { id: `opt_${nid()}`, title: '', description: '', next: null };
    data.onPatch({ meta: { ...m, options: [...(m.options || []), newOpt] } });
  };

  const updateOption = (i, patch) => {
    const options = (m.options || []).map((o, idx) => (idx === i ? { ...o, ...patch } : o));
    data.onPatch({ meta: { ...m, options } });
  };

  const removeOption = (i) => {
    const options = (m.options || []).filter((_, idx) => idx !== i);
    data.onPatch({ meta: { ...m, options } });
  };

  return (
    <div className="relative">
      <Handle type="target" position={Position.Left} />
      <BaseNode data={data} selected={selected} border="#22c55e">
        <div className="space-y-3">
          {/* Header image upload */}
          <label className="text-xs text-neutral-400">Header (optional image)</label>
          <div className="flex h-[200px] w-[200px] items-center gap-2">
            <input
              type="file"
              accept="image/*"
              onChange={async (e) => {
                const file = e.target.files?.[0];
                if (!file) return;
                setImageFiles(file);
                try {
                  data.onPatch({ meta: { ...m, uploadingHeader: true } });
                  const { url } = await uploadMedia();
                  data.onPatch({
                    meta: {
                      ...m,
                      header: { type: 'image', mediaUrl: url, fileName: file.name },
                      uploadingHeader: false,
                    },
                  });
                } catch (err) {
                  console.error('Header upload failed', err);
                  data.onPatch({ meta: { ...m, uploadingHeader: false } });
                }
              }}
              className="h-[150px] w-[150px] text-xs"
            />
            {m.uploadingHeader && <span className="text-xs text-neutral-400">Uploading...</span>}
          </div>
          {m.header?.mediaUrl && <img src={m.header.mediaUrl} alt="header" className="rounded-lg border border-neutral-800" />}

          {/* Body / Footer */}
          <textarea
            value={m.bodyText || ''}
            onChange={(e) => data.onPatch({ meta: { ...m, bodyText: e.target.value } })}
            placeholder="Form message text..."
            rows={3}
            className="w-full rounded border border-neutral-800 px-3 py-2"
          />
          <input
            value={m.footerText || ''}
            onChange={(e) => data.onPatch({ meta: { ...m, footerText: e.target.value } })}
            placeholder="Footer (optional)"
            className="w-full rounded border border-neutral-800 px-3 py-2"
          />

          {/* Options */}
          <div className="border-t border-neutral-800 pt-2">
            <div className="mb-2 flex items-center justify-between">
              <div className="text-xs text-neutral-400">Interactive Options</div>
              <Button className="rounded border border-neutral-700 px-2 py-1 text-xs" onClick={addOption}>
                + Add
              </Button>
            </div>

            {(m.options || []).map((opt, i) => (
              <div key={opt.id} className="space-y-1 rounded-lg border border-neutral-800 p-2">
                <input
                  value={opt.title}
                  onChange={(e) => updateOption(i, { title: e.target.value })}
                  placeholder="Option title"
                  className="w-full rounded border border-neutral-800 px-2 py-1 text-xs"
                />
                <input
                  value={opt.description}
                  onChange={(e) => updateOption(i, { description: e.target.value })}
                  placeholder="Description (optional)"
                  className="w-full rounded border border-neutral-800 px-2 py-1 text-xs"
                />
                <Button onClick={() => removeOption(i)} className="mt-1 rounded bg-red-600 px-2 py-1 text-xs hover:bg-red-500">
                  ✕ Remove
                </Button>
              </div>
            ))}
          </div>
        </div>
      </BaseNode>
      <Handle type="source" position={Position.Right} />
      {/* Dynamic option connectors */}
      <div className="absolute right-0 top-3/4 h-0">
        {(m.options || []).map((opt, i) => (
          <Handle key={opt.id} id={`opt:${opt.id}`} type="source" position={Position.Right} style={{ top: 40 + i * 18, right: -6 }} />
        ))}
      </div>
    </div>
  );
}

function defaultMeta(t) {
  if (t === NodeTypes.FORM)
    return {
      layout: 'button',
      header: { type: '', mediaUrl: '', fileName: '' },
      bodyText: '',
      footerText: '',
      options: [],
      routes: {},
    };
  if (t === NodeTypes.SEND)
    return {
      contentType: 'text',
      text: '',
      mediaUrl: '',
      mediaType: 'url',
      fileName: '',
      fileHandle: '',
      caption: '',
      uploading: false,
    };

  if (t === NodeTypes.INTERACTIVE)
    return {
      layout: 'button',
      bodyText: '',
      footerText: '',
      header: { type: '', mediaUrl: '', fileName: '', handle: '' },
      buttons: [],
      routes: {},
      uploadingHeader: false,
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

  // connect edges
  for (const e of edges) {
    const { source, target, data } = e;
    const sNode = byId[source];
    if (!sNode) continue;
    const m = metaById[source] || {};
    if (sNode.type === NodeTypes.COND) {
      if (data?.kind === 'cond:true') m.trueNext = target;
      else if (data?.kind === 'cond:false') m.falseNext = target;
    } else if (data?.kind?.startsWith('opt:')) {
      const optKey = data.kind.split(':')[1];
      if (!m.routes) m.routes = {};
      m.routes[optKey] = target;
    } else if (sNode.type === NodeTypes.TRIGGER && data?.kind === 'trigger:start') {
      m.startNext = target;
    } else {
      m.next = target;
    }
    metaById[source] = m;
  }

  for (const n of nodes) {
    const m = metaById[n.id] || {};
    if (n.type === NodeTypes.TRIGGER) {
      triggers.push({ keywords: m.keywords || [], start: m.startNext || null });
      continue;
    }
    if (n.type === NodeTypes.FORM) {
      const routes = {};
      (m.options || []).forEach((o) => {
        if (m.routes?.[o.id]) routes[o.id] = m.routes[o.id];
      });
      runtimeNodes.push({
        id: n.id,
        type: 'interactive_message',
        layout: m.layout,
        header: m.header,
        bodyText: m.bodyText,
        footerText: m.footerText,
        list: undefined,
        buttons: (m.options || []).map((o) => ({ id: o.id, title: o.title, description: o.description })),
        routes,
        next: m.next || null,
      });
      continue;
    }
    // rest existing node mapping...
    if (n.type === NodeTypes.SEND) {
      runtimeNodes.push({
        id: n.id,
        type: n.type,
        next: m.next || null,
        contentType: m.contentType,
        text: m.text || '',
        mediaUrl: m.mediaUrl || '',
        fileName: m.fileName || '',
      });
    } else if (n.type === NodeTypes.ASK) {
      runtimeNodes.push({
        id: n.id,
        type: n.type,
        next: m.next || null,
        prompt: m.prompt || '',
        variable: m.variable || '',
        inputType: m.inputType || 'text',
        required: !!(m.required ?? true),
      });
    } else if (n.type === NodeTypes.COND) {
      runtimeNodes.push({
        id: n.id,
        type: n.type,
        logic: m.logic || [],
        trueNext: m.trueNext || null,
        falseNext: m.falseNext || null,
      });
    } else if (n.type === NodeTypes.INTERACTIVE) {
      runtimeNodes.push({
        id: n.id,
        type: n.type,
        layout: m.layout,
        bodyText: m.bodyText,
        footerText: m.footerText,
        header: m.header,
        buttons: m.buttons,
        routes: m.routes,
        next: m.next || null,
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
  const tpl = nid();
  const askName = nid();
  const askPhone = nid();
  const cond = nid();
  const send = nid();

  const nodes = [
    {
      id: t1,
      type: NodeTypes.TRIGGER,
      position: { x: 60, y: 40 },
      data: { name: 'Start', icon: '🏁', meta: { keywords: ['start', 'hello'] }, _kw: '', _setKw: () => {}, addKeyword: () => {} },
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
      data: { name: 'Has Phone?', icon: '🔀', variables: ['name', 'phone'], meta: { logic: [{ var: 'phone', op: 'exists', value: '' }] } },
    },
    {
      id: send,
      type: NodeTypes.SEND,
      position: { x: 1240, y: 160 },
      data: { name: 'Thanks Msg', icon: '💬', meta: { contentType: 'text', text: 'Thanks {{name}}. We will call you soon.' } },
    },
  ];

  const edges = [
    { id: nid(), source: t1, sourceHandle: 'start', target: tpl, data: { kind: 'trigger:start' } },
    { id: nid(), source: tpl, sourceHandle: 'btn:Book Appointment', target: askName, data: { kind: 'template:btn', btnKey: 'Book Appointment' } },
    { id: nid(), source: tpl, sourceHandle: 'btn:Pricing', target: send, data: { kind: 'template:btn', btnKey: 'Pricing' } },
    { id: nid(), source: askName, target: askPhone },
    { id: nid(), source: askPhone, target: cond },
    { id: nid(), source: cond, sourceHandle: 'true', target: send, data: { kind: 'cond:true' } },
    { id: nid(), source: cond, sourceHandle: 'false', target: tpl, data: { kind: 'cond:false' } },
  ];

  setNodes(nodes);
  setEdges(edges);
}
