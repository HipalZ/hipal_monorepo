import { useWhatsapp } from '@/components/store/useWhatsapp';
import { ChevronLeft, ChevronRight, PanelLeftOpen, PanelRightOpen } from 'lucide-react';
import { useCallback, useMemo, useRef, useState } from 'react';
import ReactFlow, {
  Background,
  Controls,
  Handle,
  MiniMap,
  Position,
  ReactFlowProvider,
  addEdge,
  applyEdgeChanges,
  applyNodeChanges,
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

const INPUT_TYPES = [
  { id: 'text', label: 'Text' },
  { id: 'phone', label: 'Phone' },
  { id: 'email', label: 'Email' },
  { id: 'number', label: 'Number' },
];

const nid = () => Math.random().toString(36).slice(2, 10);
const cls = (...arr) => arr.filter(Boolean).join(' ');

// ----------------- Custom Node UIs -----------------
function BaseNode({ data, selected, children, border = '#262626' }) {
  return (
    <div className="min-w-[260px] rounded-xl border bg-white text-neutral-100" style={{ borderColor: selected ? '#10b981' : border }}>
      <div className="flex items-center gap-2 border-b border-neutral-800 px-3 py-2 text-sm">
        <span className="text-lg" role="img" aria-label="icon">
          {data.icon}
        </span>
        <input
          value={data.name || 'Untitled'}
          onChange={(e) => data.onPatch({ name: e.target.value })}
          className="flex-1 bg-transparent outline-none"
        />
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
  return (
    <div>
      <Handle type="target" position={Position.Left} />
      <BaseNode data={data} selected={selected}>
        <div className="flex gap-2">
          {['text', 'image', 'document'].map((t) => (
            <button
              type="button"
              key={t}
              onClick={() => data.onPatch({ meta: { ...m, contentType: t } })}
              className={cls(
                'rounded border px-2 py-1 text-xs',
                m.contentType === t ? 'border-emerald-500 bg-emerald-600' : 'border-neutral-700 bg-neutral-800',
              )}
            >
              {t}
            </button>
          ))}
        </div>
        {m.contentType === 'text' && (
          <textarea
            value={m.text || ''}
            onChange={(e) => data.onPatch({ meta: { ...m, text: e.target.value } })}
            placeholder="Message... use {{name}}"
            rows={4}
            className="w-full rounded border border-neutral-800 bg-neutral-950 px-3 py-2"
          />
        )}
        {m.contentType === 'image' && (
          <div className="space-y-3">
            <select
              value={m.mediaType || 'url'}
              onChange={(e) => data.onPatch({ meta: { ...m, mediaType: e.target.value } })}
              className="w-full rounded border border-neutral-800 bg-neutral-950 px-3 py-2"
            >
              <option value="url">Use URL</option>
              <option value="upload">Upload Image</option>
            </select>

            {m.mediaType === 'url' ? (
              <input
                value={m.mediaUrl || ''}
                onChange={(e) => data.onPatch({ meta: { ...m, mediaUrl: e.target.value } })}
                placeholder="Paste image URL..."
                className="w-full rounded border border-neutral-800 bg-neutral-950 px-3 py-2"
              />
            ) : (
              <div className="space-y-2">
                <input
                  type="file"
                  accept="image/*"
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;

                    // store file in global store for upload hook
                    setImageFiles(file);

                    try {
                      data.onPatch({ meta: { ...m, uploading: true } });
                      const { url, handle } = await uploadMedia();

                      // update the node with uploaded file info
                      data.onPatch({
                        meta: {
                          ...m,
                          mediaUrl: url,
                          fileHandle: handle,
                          fileName: file.name,
                          uploading: false,
                        },
                      });
                    } catch (err) {
                      console.error('Upload failed', err);
                      data.onPatch({ meta: { ...m, uploading: false } });
                    }
                  }}
                  className="w-full text-xs"
                />

                {m.uploading && <div className="text-xs text-neutral-400">Uploading...</div>}

                {m.mediaUrl && (
                  <div className="mt-2">
                    <img src={m.mediaUrl} alt="preview" className="rounded-lg border border-neutral-800" />
                    <div className="mt-1 text-xs text-neutral-400">Uploaded: {m.fileName}</div>
                  </div>
                )}
              </div>
            )}

            <input
              value={m.caption || ''}
              onChange={(e) => data.onPatch({ meta: { ...m, caption: e.target.value } })}
              placeholder="Caption (optional)"
              className="w-full rounded border border-neutral-800 bg-neutral-950 px-3 py-2"
            />
          </div>
        )}

        {m.contentType === 'document' && (
          <div className="space-y-2">
            <input
              value={m.mediaUrl || ''}
              onChange={(e) => data.onPatch({ meta: { ...m, mediaUrl: e.target.value } })}
              placeholder="Document URL"
              className="w-full rounded border border-neutral-800 bg-neutral-950 px-3 py-2"
            />
            <input
              value={m.fileName || ''}
              onChange={(e) => data.onPatch({ meta: { ...m, fileName: e.target.value } })}
              placeholder="File name"
              className="w-full rounded border border-neutral-800 bg-neutral-950 px-3 py-2"
            />
          </div>
        )}
      </BaseNode>
      <Handle type="source" position={Position.Right} />
    </div>
  );
}

function InteractiveNode({ data, selected }) {
  const m = data.meta || {};
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
            className="w-full rounded border border-neutral-800 bg-neutral-950 px-3 py-2"
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
          className="mt-3 w-full rounded border border-neutral-800 bg-neutral-950 px-3 py-2"
        />
        <input
          value={m.footerText || ''}
          onChange={(e) => data.onPatch({ meta: { ...m, footerText: e.target.value } })}
          placeholder="Footer (optional)"
          className="w-full rounded border border-neutral-800 bg-neutral-950 px-3 py-2"
        />

        {/* Buttons */}
        <div className="mt-3 space-y-2 border-t border-neutral-800 pt-2">
          <div className="flex items-center justify-between">
            <div className="text-xs text-neutral-400">Buttons</div>
            <Button onClick={addButton} className="rounded border border-neutral-700 bg-neutral-800 px-2 py-1 text-xs hover:bg-neutral-700">
              + Add
            </Button>
          </div>

          {(m.buttons || []).map((btn, i) => (
            <div key={i} className="flex flex-col gap-2 rounded-lg border border-neutral-800 bg-neutral-900 p-2">
              <div className="flex items-center gap-2">
                <select
                  value={btn.type}
                  onChange={(e) => updateButton(i, { type: e.target.value, url: '' })}
                  className="rounded border border-neutral-800 bg-neutral-950 px-2 py-1 text-xs"
                >
                  <option value="reply">Reply</option>
                  <option value="url">URL</option>
                </select>
                <input
                  value={btn.title}
                  onChange={(e) => updateButton(i, { title: e.target.value })}
                  placeholder="Button Title"
                  className="flex-1 rounded border border-neutral-800 bg-neutral-950 px-2 py-1 text-xs"
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
                  className="w-full rounded border border-neutral-800 bg-neutral-950 px-2 py-1 text-xs"
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
          className="w-full rounded border border-neutral-800 bg-neutral-950 px-3 py-2"
        />
        <div className="grid grid-cols-2 gap-2">
          <select
            value={m.variable || ''}
            onChange={(e) => data.onPatch({ meta: { ...m, variable: e.target.value } })}
            className="rounded border border-neutral-800 bg-neutral-950 px-3 py-2"
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
            className="rounded border border-neutral-800 bg-neutral-950 px-3 py-2"
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
  const logic = data.meta.logic || [];
  return (
    <div>
      <Handle type="target" position={Position.Left} />
      <BaseNode data={data} selected={selected} border="#fbbf24">
        <div className="space-y-2">
          {logic.map((l, i) => (
            <div key={i} className="grid grid-cols-12 items-center gap-2">
              <select
                value={l.var || ''}
                onChange={(e) => data.updateLogic(i, { var: e.target.value })}
                className="col-span-5 rounded border border-neutral-800 bg-neutral-950 px-2 py-1"
              >
                <option value="">variable</option>
                {data.variables.map((v) => (
                  <option key={v} value={v}>
                    {v}
                  </option>
                ))}
              </select>
              <select
                value={l.op || 'eq'}
                onChange={(e) => data.updateLogic(i, { op: e.target.value })}
                className="col-span-3 rounded border border-neutral-800 bg-neutral-950 px-2 py-1"
              >
                <option value="exists">exists</option>
                <option value="eq">=</option>
                <option value="ne">≠</option>
                <option value="gt">&gt;</option>
                <option value="lt">&lt;</option>
                <option value="contains">contains</option>
              </select>
              <input
                value={l.value ?? ''}
                onChange={(e) => data.updateLogic(i, { value: e.target.value })}
                placeholder="value"
                className="col-span-3 rounded border border-neutral-800 bg-neutral-950 px-2 py-1"
              />
              <Button className="col-span-1 rounded bg-red-600 px-2 py-1" onClick={() => data.removeLogic(i)}>
                ✕
              </Button>
            </div>
          ))}
          <Button
            type="button"
            className="rounded border border-neutral-700 bg-neutral-800 px-3 py-1 text-xs hover:bg-neutral-700"
            onClick={data.addLogic}
          >
            + Add condition
          </Button>
          <div className="text-xs text-neutral-400">Handles: right = TRUE, bottom = FALSE.</div>
        </div>
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
          className="w-full rounded border border-neutral-800 bg-neutral-950 px-3 py-2"
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
          className="mt-2 rounded border border-neutral-700 bg-neutral-800 px-3 py-1 text-xs hover:bg-neutral-700"
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
            <span key={k} className="rounded-full border border-neutral-700 bg-neutral-800 px-2 py-1 text-xs">
              {k}
            </span>
          ))}
        </div>
        <div className="flex gap-2">
          <input
            placeholder="add keyword"
            value={data._kw || ''}
            onChange={(e) => data._setKw(e.target.value)}
            className="flex-1 rounded border border-neutral-800 bg-neutral-950 px-2 py-1"
          />
          <Button type="button" className="rounded border border-neutral-700 bg-neutral-800 px-2 py-1 text-xs" onClick={() => data.addKeyword()}>
            Add
          </Button>
        </div>
        <div className="text-xs text-neutral-400">Connect bottom handle to first node.</div>
      </BaseNode>
      <Handle id="start" type="source" position={Position.Bottom} />
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
  const [templates, setTemplates] = useState([]);
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

  const addNode = useCallback(
    (type, position) => {
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
        }),
      ]);
      setSelId(id);
    },
    [variables],
  );

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
    <div className="flex h-[100vh] w-full overflow-hidden bg-neutral-950 text-neutral-100">
      {/* LEFT SIDEBAR */}
      <div className={`relative border-r border-neutral-800 transition-all duration-300 ${leftOpen ? 'w-[300px]' : 'w-[44px]'}`}>
        <div className="absolute right-4 top-3 z-20">
          <button onClick={() => setLeftOpen((v) => !v)} className="rounded-full border border-neutral-700 bg-neutral-800 p-1 hover:bg-neutral-700">
            {leftOpen ? <ChevronLeft className="h-4 w-4 text-neutral-300" /> : <PanelLeftOpen className="h-4 w-4 text-neutral-300" />}
          </button>
        </div>

        {leftOpen && (
          <div className="h-full space-y-3 overflow-y-auto p-4">
            <h2 className="text-xl font-semibold">Add blocks</h2>
            <PaletteItem label="Send Message" type={NodeTypes.SEND} icon="💬" />
            <PaletteItem label="Ask a Question" type={NodeTypes.ASK} icon="❓" />
            <PaletteItem label="Set a Condition" type={NodeTypes.COND} icon="🔀" />
            <PaletteItem label="Trigger Keyword" type={NodeTypes.TRIGGER} icon="🏁" />
            <PaletteItem label="Interactive Form" type={NodeTypes.FORM} icon="🧩" />

            {/* <div className="pt-6">
              <h3 className="mb-2 text-sm uppercase tracking-wide text-neutral-400">Variables</h3>
              <VariableEditor variables={variables} setVariables={setVariables} />
            </div> */}

            {/* <div className="pt-6">
              <h3 className="mb-2 text-sm uppercase tracking-wide text-neutral-400">Templates</h3>
              <TemplateList templates={templates} onUpdate={setTemplates} />
            </div> */}

            <div className="space-y-2 pt-6">
              <Button className="w-full rounded-lg bg-emerald-600 py-2 hover:bg-emerald-500" onClick={() => downloadJSON(finalObject)}>
                Export JSON
              </Button>
              <Button className="w-full rounded-lg bg-neutral-800 py-2 hover:bg-neutral-700" onClick={() => loadSample(setRfNodes, setRfEdges)}>
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
          <button onClick={() => setRightOpen((v) => !v)} className="rounded-full border border-neutral-700 bg-neutral-800 p-1 hover:bg-neutral-700">
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
              <pre className="max-h-[40vh] overflow-auto rounded-lg border border-neutral-800 bg-neutral-900 p-3 text-xs">
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
      className="flex cursor-move items-center gap-2 rounded-lg border border-neutral-700 bg-neutral-800 px-3 py-2 hover:bg-neutral-700"
    >
      <span className="text-lg">{icon}</span>
      <span>{label}</span>
    </div>
  );
}

function VariableEditor({ variables, setVariables }) {
  const [v, setV] = useState('');

  const addVar = () => {
    const name = v.trim();
    if (!name) return;
    if (!variables.includes(name)) {
      setVariables((prev) => [...prev, name]);
    }
    setV('');
  };

  const removeVar = (name) => {
    setVariables((prev) => prev.filter((x) => x !== name));
  };

  return (
    <div className="space-y-2 rounded-xl border border-neutral-800 p-3">
      <div className="flex gap-2">
        <input
          value={v}
          onChange={(e) => setV(e.target.value)}
          placeholder="variable_name"
          className="flex-1 rounded-lg border border-neutral-700 bg-neutral-900 px-3 py-2 focus:outline-none"
        />
        <Button onClick={addVar} className="rounded-lg bg-emerald-600 px-3 py-2 hover:bg-emerald-500">
          Add
        </Button>
      </div>

      <div className="flex flex-wrap gap-2">
        {variables.map((vv) => (
          <span key={vv} className="flex items-center gap-1 rounded-full border border-neutral-700 bg-neutral-800 px-2 py-1 text-xs">
            {vv}
            <Button onClick={() => removeVar(vv)} className="text-red-400 hover:text-red-300">
              ✕
            </Button>
          </span>
        ))}
      </div>
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
      <select value={sel} onChange={(e) => setSel(e.target.value)} className="w-full rounded-lg border border-neutral-700 bg-neutral-900 px-3 py-2">
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
          className="w-full rounded-lg border border-neutral-700 bg-neutral-900 px-3 py-2"
        />
        <div className="flex gap-2">
          <input
            value={btn}
            onChange={(e) => setBtn(e.target.value)}
            placeholder="Button text"
            className="flex-1 rounded-lg border border-neutral-700 bg-neutral-900 px-3 py-2"
          />
          <Button
            className="rounded-lg border border-neutral-700 bg-neutral-800 px-3 py-2 hover:bg-neutral-700"
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
          className="flex-1 rounded-lg border border-neutral-700 bg-neutral-900 px-3 py-2"
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
        className="w-full rounded-lg border border-neutral-700 bg-neutral-900 px-3 py-2"
      />
      <input
        type="text"
        placeholder="Section title"
        value={section}
        onChange={(e) => setSection(e.target.value)}
        className="w-full rounded-lg border border-neutral-700 bg-neutral-900 px-3 py-2"
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
    <div className="space-y-3 rounded-xl border border-neutral-800 bg-neutral-900 p-3">
      <div className="flex items-center justify-between gap-2">
        <div>
          <label className="text-xs text-neutral-400">Display name</label>
          <input
            value={data.name || 'Untitled'}
            onChange={(e) => onPatch({ name: e.target.value })}
            className="w-full rounded-lg border border-neutral-800 bg-neutral-950 px-3 py-2"
          />
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
            className="w-full rounded-lg border border-neutral-700 bg-neutral-900 px-3 py-2"
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
            className="w-full rounded-lg border border-neutral-700 bg-neutral-900 px-3 py-2"
          />
          <input
            type="text"
            value={node.data.footerText || ''}
            onChange={(e) => onPatch({ footerText: e.target.value })}
            placeholder="Footer Text"
            className="w-full rounded-lg border border-neutral-700 bg-neutral-900 px-3 py-2"
          />

          {/* Header section */}
          <div>
            <label className="block text-sm font-semibold">Header Type</label>
            <select
              value={node.data.header?.type || ''}
              onChange={(e) => onPatch({ header: { ...node.data.header, type: e.target.value } })}
              className="w-full rounded-lg border border-neutral-700 bg-neutral-900 px-3 py-2"
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
                className="mt-2 w-full rounded-lg border border-neutral-700 bg-neutral-900 px-3 py-2"
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
                className="w-full rounded-lg border border-neutral-700 bg-neutral-900 px-3 py-2"
              />
              <input
                type="text"
                value={node.data.cta?.url || ''}
                onChange={(e) => onPatch({ cta: { ...node.data.cta, url: e.target.value } })}
                placeholder="Button URL"
                className="w-full rounded-lg border border-neutral-700 bg-neutral-900 px-3 py-2"
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function SendQuick({
  meta = {
    contentType: 'text',
    mediaUrl: '',
    text: '',
    fileName: '',
  },
  onPatch,
}) {
  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        {['text', 'image', 'document'].map((t) => (
          <Button
            key={t}
            onClick={() => onPatch({ ...meta, contentType: t })}
            className={cls(
              'rounded border px-2 py-1 text-xs',
              meta.contentType === t ? 'border-emerald-500 bg-emerald-600' : 'border-neutral-700 bg-neutral-800',
            )}
          >
            {t}
          </Button>
        ))}
      </div>
      {meta.contentType === 'text' && (
        <textarea
          value={meta.text || ''}
          onChange={(e) => onPatch({ ...meta, text: e.target.value })}
          placeholder="Message..."
          rows={4}
          className="w-full rounded border border-neutral-800 bg-neutral-950 px-3 py-2"
        />
      )}
      {meta.contentType === 'image' && (
        <input
          value={meta.mediaUrl || ''}
          onChange={(e) => onPatch({ ...meta, mediaUrl: e.target.value })}
          placeholder="Image URL"
          className="w-full rounded border border-neutral-800 bg-neutral-950 px-3 py-2"
        />
      )}
      {meta.contentType === 'document' && (
        <div className="space-y-2">
          <input
            value={meta.mediaUrl || ''}
            onChange={(e) => onPatch({ ...meta, mediaUrl: e.target.value })}
            placeholder="Document URL"
            className="w-full rounded border border-neutral-800 bg-neutral-950 px-3 py-2"
          />
          <input
            value={meta.fileName || ''}
            onChange={(e) => onPatch({ ...meta, fileName: e.target.value })}
            placeholder="File name"
            className="w-full rounded border border-neutral-800 bg-neutral-950 px-3 py-2"
          />
        </div>
      )}
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
        className="w-full rounded border border-neutral-800 bg-neutral-950 px-3 py-2"
      />
      <div className="grid grid-cols-2 gap-2">
        <select
          value={meta.variable || ''}
          onChange={(e) => onPatch({ ...meta, variable: e.target.value })}
          className="rounded border border-neutral-800 bg-neutral-950 px-3 py-2"
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
          className="rounded border border-neutral-800 bg-neutral-950 px-3 py-2"
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
  const update = (i, patch) => onPatch({ ...meta, logic: logic.map((x, idx) => (idx === i ? { ...x, ...patch } : x)) });
  return (
    <div className="space-y-2">
      {logic.map((l, i) => (
        <div key={i} className="grid grid-cols-12 gap-2">
          <select
            value={l.var || ''}
            onChange={(e) => update(i, { var: e.target.value })}
            className="col-span-5 rounded border border-neutral-800 bg-neutral-950 px-2 py-1"
          >
            <option value="">variable</option>
            {variables.map((v) => (
              <option key={v} value={v}>
                {v}
              </option>
            ))}
          </select>
          <select
            value={l.op || 'eq'}
            onChange={(e) => update(i, { op: e.target.value })}
            className="col-span-3 rounded border border-neutral-800 bg-neutral-950 px-2 py-1"
          >
            <option value="exists">exists</option>
            <option value="eq">=</option>
            <option value="ne">≠</option>
            <option value="gt">&gt;</option>
            <option value="lt">&lt;</option>
            <option value="contains">contains</option>
          </select>
          <input
            value={l.value ?? ''}
            onChange={(e) => update(i, { value: e.target.value })}
            placeholder="value"
            className="col-span-3 rounded border border-neutral-800 bg-neutral-950 px-2 py-1"
          />
          <Button className="col-span-1 rounded bg-red-600 px-2 py-1" onClick={() => onPatch({ ...meta, logic: logic.filter((_, j) => j !== i) })}>
            ✕
          </Button>
        </div>
      ))}
      <Button
        className="rounded border border-neutral-700 bg-neutral-800 px-3 py-1 text-xs hover:bg-neutral-700"
        onClick={() => onPatch({ ...meta, logic: [...logic, { var: variables[0] || '', op: 'exists', value: '' }] })}
      >
        + Add condition
      </Button>
      <div className="text-xs text-neutral-400">Use handles: right = TRUE, bottom = FALSE.</div>
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
        className="w-full rounded border border-neutral-800 bg-neutral-950 px-3 py-2"
      />
      <div className="space-y-1 text-xs">
        {entries.map(([k, v]) => (
          <div key={k}>
            • {k} → {v || '(connect edge)'}
          </div>
        ))}
      </div>
      <Button
        className="rounded border border-neutral-700 bg-neutral-800 px-3 py-1 text-xs hover:bg-neutral-700"
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
          className="flex-1 rounded border border-neutral-800 bg-neutral-950 px-3 py-2"
        />
        <Button
          className="rounded border border-neutral-700 bg-neutral-800 px-3 py-2"
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
          <span key={k} className="rounded-full border border-neutral-700 bg-neutral-800 px-2 py-1 text-xs">
            {k}
          </span>
        ))}
      </div>
      <div className="text-xs text-neutral-400">Connect bottom handle to first node.</div>
    </div>
  );
}

// --------------- Graph Helpers ---------------
function makeNode({ id, type, position, variables, patch, addKw, setKw, addLogic, removeLogic, updateLogic }) {
  const base = {
    id,
    type,
    position,
    data: {
      name: labelFor(type),
      icon: iconFor(type),
      meta: defaultMeta(type),
      variables,
      onPatch: patch,
      addLogic: () => addLogic(id),
      removeLogic: (i) => removeLogic(id, i),
      updateLogic: (i, p) => updateLogic(id, i, p),
      _kw: '',
      _setKw: (v) => setKw(id, v),
      addKeyword: () => addKw(id, 'start'),
    },
  };
  return base;
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
    <div>
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
            className="w-full rounded border border-neutral-800 bg-neutral-950 px-3 py-2"
          />
          <input
            value={m.footerText || ''}
            onChange={(e) => data.onPatch({ meta: { ...m, footerText: e.target.value } })}
            placeholder="Footer (optional)"
            className="w-full rounded border border-neutral-800 bg-neutral-950 px-3 py-2"
          />

          {/* Options */}
          <div className="border-t border-neutral-800 pt-2">
            <div className="mb-2 flex items-center justify-between">
              <div className="text-xs text-neutral-400">Interactive Options</div>
              <Button className="rounded border border-neutral-700 bg-neutral-800 px-2 py-1 text-xs hover:bg-neutral-700" onClick={addOption}>
                + Add
              </Button>
            </div>

            {(m.options || []).map((opt, i) => (
              <div key={opt.id} className="space-y-1 rounded-lg border border-neutral-800 bg-neutral-900 p-2">
                <input
                  value={opt.title}
                  onChange={(e) => updateOption(i, { title: e.target.value })}
                  placeholder="Option title"
                  className="w-full rounded border border-neutral-800 bg-neutral-950 px-2 py-1 text-xs"
                />
                <input
                  value={opt.description}
                  onChange={(e) => updateOption(i, { description: e.target.value })}
                  placeholder="Description (optional)"
                  className="w-full rounded border border-neutral-800 bg-neutral-950 px-2 py-1 text-xs"
                />
                <Button onClick={() => removeOption(i)} className="mt-1 rounded bg-red-600 px-2 py-1 text-xs hover:bg-red-500">
                  ✕ Remove
                </Button>
              </div>
            ))}
          </div>
        </div>
      </BaseNode>
      {/* Dynamic option connectors */}
      <div className="relative h-0">
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
