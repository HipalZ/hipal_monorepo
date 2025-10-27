import { useWhatsapp } from '@/components/store/useWhatsapp';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/components/utils/helper';
import {
  AlertCircle,
  ArrowRight,
  CheckCircle,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Code,
  Diamond,
  Download,
  FileInputIcon,
  FileText,
  GripVertical,
  Hash,
  HelpCircle,
  Image,
  Info,
  List,
  MessageCircle,
  MessageSquare,
  PanelLeftOpen,
  PanelRightOpen,
  Play,
  Plus,
  Share,
  Upload,
  Variable,
  X,
  XCircle,
  Zap,
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
import { Checkbox } from '../../ui/checkbox';
import { ScrollArea } from '../../ui/scroll-area';

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
    { value: 'image', label: 'Image', icon: <Image className="h-3 w-3" /> },
    { value: 'document', label: 'Document', icon: <FileText className="h-3 w-3" /> },
  ];

  return (
    <div className="relative">
      <Handle type="target" position={Position.Left} />
      <Card
        className={cn(
          'relative w-80 overflow-hidden border-2 shadow-lg transition-all',
          selected ? 'border-emerald-500 ring-2 ring-emerald-500 ring-opacity-20' : 'border-gray-300',
        )}
      >
        {/* Animated Header */}
        <div className="bg-gradient-to-r from-emerald-500 to-teal-600 p-4 text-white">
          <div className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5" />
            <h3 className="text-lg font-bold">Send Message</h3>
          </div>
        </div>

        <CardContent className="space-y-4 bg-gray-100 p-4">
          {/* Content Type Tabs */}
          <div className="flex gap-1 rounded-lg bg-white p-1 shadow-sm">
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
                    : 'text-gray-400 hover:bg-gray-100 hover:text-gray-700',
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
              {/* Variables Section */}
              <Card className="border-0 bg-white shadow-sm">
                <CardHeader className="pb-2">
                  <div className="flex items-center gap-2">
                    <Variable className="h-4 w-4 text-gray-600" />
                    <CardTitle className="text-sm font-medium text-gray-700">Variables</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="space-y-2">
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
                </CardContent>
              </Card>

              {/* Message Textarea */}
              <div>
                <label className="mb-2 flex items-center gap-2 text-xs font-medium text-gray-700">
                  <FileText className="h-3 w-3" />
                  Message Text
                </label>
                <Textarea
                  ref={textRef}
                  value={m.text || ''}
                  onChange={(e) => data.onPatch({ meta: { ...m, text: e.target.value } })}
                  placeholder="Type your message... use {{variable}} for dynamic content"
                  className="min-h-24 resize-none border-gray-300 text-sm placeholder:text-gray-500 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                />
              </div>
            </div>
          )}

          {/* IMAGE CONTENT */}
          {m.contentType === 'image' && (
            <div className="space-y-3">
              {/* Upload Area */}
              <Card className="border-0 bg-white shadow-sm">
                <CardHeader className="pb-2">
                  <div className="flex items-center gap-2">
                    <Image className="h-4 w-4 text-gray-600" />
                    <CardTitle className="text-sm font-medium text-gray-700">Image Upload</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div
                    className={cn(
                      'rounded-lg border-2 border-dashed p-4 text-center transition-all',
                      isDragging ? 'border-emerald-500 bg-emerald-50' : 'border-gray-300',
                      m.mediaUrl && 'border-solid border-gray-300',
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
                        <div className="flex animate-pulse items-center gap-2 text-xs text-blue-500">
                          <div className="h-3 w-3 animate-spin rounded-full bg-blue-500" />
                          Uploading...
                        </div>
                      </div>
                    ) : m.mediaUrl ? (
                      <div className="space-y-2">
                        <img src={m.mediaUrl} alt="Preview" className="mx-auto h-32 w-32 rounded-lg border border-gray-200 object-cover" />
                        <p className="truncate text-xs text-gray-600">{m.fileName}</p>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => data.onPatch({ meta: { ...m, mediaUrl: '', fileName: '', uploading: false } })}
                          className="bg-red-500 hover:bg-red-600"
                        >
                          Remove
                        </Button>
                      </div>
                    ) : (
                      <label className="block cursor-pointer">
                        <input type="file" accept="image/*" className="hidden" onChange={(e) => handleFileChange(e.target.files?.[0])} />
                        <Upload className="mx-auto mb-2 h-8 w-8 text-gray-500 transition-colors hover:text-emerald-500" />
                        <p className="text-xs text-gray-500">Drop image or click to upload</p>
                      </label>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Caption */}
              <div>
                <label className="mb-2 flex items-center gap-2 text-xs font-medium text-gray-700">Caption (Optional)</label>
                <Input
                  value={m.caption || ''}
                  onChange={(e) => data.onPatch({ meta: { ...m, caption: e.target.value } })}
                  placeholder="Add a caption for your image..."
                  className="border-gray-300 text-sm focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                />
              </div>
            </div>
          )}

          {/* DOCUMENT CONTENT */}
          {m.contentType === 'document' && (
            <Card className="border-0 bg-white shadow-sm">
              <CardHeader className="pb-2">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-gray-600" />
                  <CardTitle className="text-sm font-medium text-gray-700">Document Details</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <label className="mb-2 flex items-center gap-2 text-xs font-medium text-gray-700">Document URL</label>
                  <Input
                    value={m.mediaUrl || ''}
                    onChange={(e) => data.onPatch({ meta: { ...m, mediaUrl: e.target.value } })}
                    placeholder="https://example.com/document.pdf"
                    className="border-gray-300 text-sm focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="mb-2 flex items-center gap-2 text-xs font-medium text-gray-700">Display File Name</label>
                  <Input
                    value={m.fileName || ''}
                    onChange={(e) => data.onPatch({ meta: { ...m, fileName: e.target.value } })}
                    placeholder="document.pdf"
                    className="border-gray-300 text-sm focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>

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

  // Generate unique IDs
  const nid = () => Math.random().toString(36).substr(2, 9);

  // Add / Update / Remove Buttons
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

  // Add / Update / Remove List Sections
  const addListSection = () => {
    const newSection = { id: `sec_${nid()}`, title: '', rows: [] };
    data.onPatch({ meta: { ...m, list: { ...(m.list || {}), sections: [...(m.list?.sections || []), newSection] } } });
  };
  const addListRow = (sectionIndex) => {
    const sections = (m.list?.sections || []).map((s, idx) =>
      idx === sectionIndex ? { ...s, rows: [...(s.rows || []), { id: `row_${nid()}`, title: '', description: '' }] } : s,
    );
    data.onPatch({ meta: { ...m, list: { ...(m.list || {}), sections } } });
  };
  const updateListRow = (sectionIndex, rowIndex, patch) => {
    const sections = (m.list?.sections || []).map((s, idx) => {
      if (idx !== sectionIndex) return s;
      const rows = (s.rows || []).map((r, i) => (i === rowIndex ? { ...r, ...patch } : r));
      return { ...s, rows };
    });
    data.onPatch({ meta: { ...m, list: { ...(m.list || {}), sections } } });
  };

  const removeListSection = (sectionIndex) => {
    const sections = (m.list?.sections || []).filter((_, idx) => idx !== sectionIndex);
    data.onPatch({ meta: { ...m, list: { ...(m.list || {}), sections } } });
  };

  return (
    <div>
      <Handle type="target" position={Position.Left} />
      <Card
        className={cn(
          'relative w-96 overflow-hidden border-2 shadow-lg transition-all',
          selected ? 'border-blue-500 ring-2 ring-blue-500 ring-opacity-20' : 'border-gray-300',
        )}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-500 to-indigo-600 p-4 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MessageCircle className="h-5 w-5" />
              <h3 className="text-lg font-bold">Interactive Message</h3>
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
          </div>
        </div>

        {/* BODY */}
        <CardContent className="space-y-4 bg-gray-100 p-4">
          {/* Header Upload Section */}
          <Card className="border-0 bg-white shadow-sm">
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2">
                <Image className="h-4 w-4 text-gray-600" />
                <CardTitle className="text-sm font-medium text-gray-700">Header (Optional)</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <Select value={m.header?.type || ''} onValueChange={(type) => data.onPatch({ meta: { ...m, header: { type, mediaUrl: '' } } })}>
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
                  <label className="cursor-pointer text-xs text-gray-600 hover:text-blue-500">
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
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
                              header: { type: 'image', mediaUrl: url, handle, fileName: file.name },
                              uploadingHeader: false,
                            },
                          });
                        } catch (err) {
                          console.error('Header upload failed', err);
                          data.onPatch({ meta: { ...m, uploadingHeader: false } });
                        }
                      }}
                    />
                    Upload Image
                  </label>
                  {m.uploadingHeader && <div className="animate-pulse text-xs text-blue-500">Uploading...</div>}
                  {m.header?.mediaUrl && <img src={m.header.mediaUrl} className="h-24 w-full rounded-lg border object-cover" />}
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
              className="min-h-20 border-gray-300 focus:border-blue-500"
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

          {/* Conditional Rendering */}
          {m.layout === 'button' && (
            <Card className="border-0 bg-white shadow-sm">
              <CardHeader className="pb-2">
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
                          data.onPatch({ meta: { ...m, list: { ...(m.list || {}), sections } } });
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
      <Handle type="source" position={Position.Right} />
    </div>
  );
}

function AskNode({ data, selected }) {
  const m = data.meta || {};

  return (
    <div className="relative">
      <Handle type="target" position={Position.Left} />
      <Card
        className={cn(
          'relative w-80 overflow-hidden border-2 shadow-lg transition-all',
          selected ? 'border-indigo-500 ring-2 ring-indigo-500 ring-opacity-20' : 'border-gray-300',
        )}
      >
        {/* Animated Header */}
        <div className="bg-gradient-to-r from-indigo-500 to-purple-600 p-4 text-white">
          <div className="flex items-center gap-2">
            <FileInputIcon className="h-5 w-5" />
            <h3 className="text-lg font-bold">Ask User</h3>
          </div>
        </div>

        <CardContent className="space-y-4 bg-gray-100 p-4">
          {/* Prompt Input */}
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

          {/* Controls Grid */}
          <div className="grid grid-cols-2 gap-3">
            {/* Store Variable */}
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

            {/* Input Type */}
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

          {/* Required Checkbox */}
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

          {/* Preview Badge */}
          {m.prompt && (
            <Badge variant="outline" className="text-xs">
              Preview: {m.prompt.substring(0, 30)}...
            </Badge>
          )}
        </CardContent>
      </Card>
      <Handle type="source" position={Position.Right} />
    </div>
  );
}

function CondNode({ data, selected }) {
  const logic = data.meta?.logic || [];
  const hasLogic = logic.length > 0;
  const [expanded, setExpanded] = useState(false);

  const conditionPreview = hasLogic
    ? logic.map((l, i) => `${i === 0 ? 'IF' : 'AND'} ${l.var} ${l.op} "${l.value || '...'}"`).join(' ')
    : 'No conditions set';

  return (
    <div className="relative">
      <Handle type="target" position={Position.Left} className="opacity-0" />

      <Card
        className={cn(
          'group relative w-64 overflow-hidden transition-all duration-300',
          selected
            ? 'scale-105 transform border-2 border-amber-500 shadow-2xl ring-2 ring-amber-500/30'
            : 'border-amber-300 hover:border-amber-400 hover:shadow-lg',
        )}
      >
        {/* Gradient Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-amber-50 via-amber-100 to-amber-200 opacity-80" />

        {/* Diamond Icon Header */}
        <div className="relative z-10 p-4 text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 transform items-center justify-center rounded-full bg-gradient-to-r from-amber-400 to-amber-600 shadow-lg transition-transform group-hover:rotate-12">
            <Diamond className="h-6 w-6 text-white" />
          </div>
          <h3 className="mb-1 text-sm font-bold text-amber-800">Condition</h3>
          <p className="text-xs text-amber-600">Branch your flow</p>
        </div>

        {/* Expandable Content */}
        <div className="relative z-10 space-y-3 px-4 pb-4">
          {hasLogic ? (
            <div className="space-y-2">
              {/* Preview Toggle */}
              <Button
                variant="ghost"
                size="sm"
                className="w-full justify-between text-amber-700 hover:bg-amber-100"
                onClick={() => setExpanded(!expanded)}
              >
                <span className="text-xs">Preview Logic</span>
                <ChevronDown className={`h-3 w-3 transition-transform ${expanded ? 'rotate-180' : ''}`} />
              </Button>

              {expanded && (
                <div className="max-h-24 overflow-y-auto rounded-lg border border-amber-200 bg-white/80 p-3">
                  <code className="block whitespace-pre-wrap font-mono text-xs text-amber-800">{conditionPreview}</code>
                </div>
              )}

              {/* Status Badges */}
              <div className="flex gap-2">
                <Badge variant="default" className="border-green-200 bg-green-100 text-green-800">
                  <CheckCircle className="mr-1 h-3 w-3" />
                  True Path
                </Badge>
                <Badge variant="secondary" className="border-red-200 bg-red-100 text-red-800">
                  <XCircle className="mr-1 h-3 w-3" />
                  False Path
                </Badge>
              </div>
            </div>
          ) : (
            <div className="py-4 text-center">
              <p className="text-xs italic text-amber-500">Add conditions in the inspector</p>
            </div>
          )}
        </div>
      </Card>

      {/* Colored Output Handles with Labels */}
      <div className="absolute -top-2 right-2 flex flex-col gap-1">
        <Handle
          id="true"
          type="source"
          position={Position.Right}
          className="h-3 w-3 transform rounded-full bg-green-500 shadow-md transition-all hover:scale-110 hover:bg-green-600"
          style={{ top: '20%' }}
        >
          <div className="pointer-events-none absolute -right-8 top-1/2 -translate-y-1/2 whitespace-nowrap rounded bg-green-500 px-2 py-1 text-xs text-white shadow-lg">
            True
            <ArrowRight className="ml-1 inline h-3 w-3" />
          </div>
        </Handle>
      </div>
      <div className="absolute -bottom-2 right-2 flex flex-col gap-1">
        <Handle
          id="false"
          type="source"
          position={Position.Bottom}
          className="h-3 w-3 transform rounded-full bg-red-500 shadow-md transition-all hover:scale-110 hover:bg-red-600"
          style={{ bottom: '20%' }}
        >
          <div className="pointer-events-none absolute -right-8 top-1/2 -translate-y-1/2 whitespace-nowrap rounded bg-red-500 px-2 py-1 text-xs text-white shadow-lg">
            False
            <ArrowRight className="ml-1 inline h-3 w-3" />
          </div>
        </Handle>
      </div>
    </div>
  );
}

function TriggerNode({ data, selected }) {
  const m = data.meta || {};

  return (
    <div className="relative">
      <Handle id="start" type="source" position={Position.Right} />
      <Card
        className={cn(
          'relative w-80 overflow-hidden border-2 shadow-lg transition-all',
          selected ? 'border-orange-500 ring-2 ring-orange-500 ring-opacity-20' : 'border-gray-300',
        )}
      >
        {/* Animated Header */}
        <div className="bg-gradient-to-r from-orange-500 to-red-600 p-4 text-white">
          <div className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            <h3 className="text-lg font-bold">Trigger</h3>
          </div>
        </div>

        <CardContent className="space-y-4 bg-gray-100 p-4">
          {/* Keywords Badges */}
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

          {/* Hint */}
          <div className="rounded-lg bg-gray-50 p-3">
            <p className="flex items-center gap-1 text-xs text-gray-600">
              <CheckCircle className="h-3 w-3 text-green-500" />
              Connect handle to first node to start the flow.
            </p>
          </div>

          {/* Preview */}
          {(m.keywords || []).length > 0 && (
            <Badge variant="outline" className="text-xs">
              Triggers on: {m.keywords.join(', ')}
            </Badge>
          )}
        </CardContent>
      </Card>
      <Handle type="target" position={Position.Left} className="opacity-0" />
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
  const [leftOpen, setLeftOpen] = useState(true);
  const [rightOpen, setRightOpen] = useState(true);

  const reactFlowWrapper = useRef(null);
  const { screenToFlowPosition } = useReactFlow();

  const updateGlobalVariables = useCallback((newVars) => {
    setVariables((prev) => {
      const merged = Array.from(new Set([...prev, ...newVars]));
      return merged;
    });

    // Also patch all nodes to refresh their local variable list
    setRfNodes((nds) =>
      nds.map((n) => ({
        ...n,
        data: { ...n.data, variables: Array.from(new Set([...(n.data.variables || []), ...newVars])) },
      })),
    );
  }, []);

  const onNodesChange = useCallback((changes) => setRfNodes((nds) => applyNodeChanges(changes, nds)), []);
  const onEdgesChange = useCallback((changes) => setRfEdges((eds) => applyEdgeChanges(changes, eds)), []);

  const onConnect = useCallback((params) => {
    const edge = { ...params, id: `e-${nid()}`, data: {} };

    if (params.sourceHandle?.startsWith('btn:')) {
      edge.data.kind = `btn:${params.sourceHandle.slice(4)}`;
    } else if (params.sourceHandle?.startsWith('opt:')) {
      edge.data.kind = `opt:${params.sourceHandle.slice(4)}`;
    } else if (params.sourceHandle === 'true') edge.data.kind = 'cond:true';
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
        addKw: (kw) => addKeyword(id, kw),
        setKw: (v) => setKwDraft(id, v),
        addLogic: () => addLogic(id),
        removeLogic: (i) => removeLogic(id, i),
        updateLogic: (i, p) => updateLogic(id, i, p),
        updateGlobalVariables,
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
    [screenToFlowPosition, addNode],
  );

  const onDragOver = useCallback((event) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  // Node patchers
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
              },
            }
          : n,
      ),
    );
  }, []);

  const addKeyword = useCallback((id, kw) => {
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
  }, []);

  const setKwDraft = useCallback((id, v) => patchNode(id, { _kw: v }), [patchNode]);

  const addLogic = useCallback(
    (id) => {
      setRfNodes((nds) =>
        nds.map((n) => {
          if (n.id !== id) return n;
          const m = n.data.meta || { logic: [] };
          const logic = [...(m.logic || []), { var: variables[0] || '', op: 'exists', value: '' }];
          return { ...n, data: { ...n.data, meta: { ...m, logic } } };
        }),
      );
    },
    [variables],
  );

  const removeLogic = useCallback((id, idx) => {
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
  }, []);

  const updateLogic = useCallback((id, idx, patch) => {
    setRfNodes((nds) =>
      nds.map((n) => {
        if (n.id !== id) return n;
        const m = n.data.meta || { logic: [] };
        const logic = (m.logic || []).map((l, i) => (i === idx ? { ...l, ...patch } : l));
        return { ...n, data: { ...n.data, meta: { ...m, logic } } };
      }),
    );
  }, []);

  const selected = useMemo(() => rfNodes.find((n) => n.id === selId) || null, [rfNodes, selId]);
  const finalObject = useMemo(() => buildFinalFromGraph(rfNodes, rfEdges), [rfNodes, rfEdges]);

  return (
    <div className="flex h-[calc(100vh-8rem)] w-full overflow-hidden bg-gray-100">
      {/* LEFT SIDEBAR */}
      <div className={cn('relative border-r border-gray-200 bg-white shadow-lg transition-all duration-300', leftOpen ? 'w-[320px]' : 'w-11')}>
        {/* Toggle Button */}
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
          <ScrollArea className="h-full">
            <div>
              {/* Header */}
              <Card className="border-0 bg-gradient-to-r from-gray-50 to-gray-100">
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-2">
                    <Zap className="h-5 w-5 text-indigo-600" />
                    <CardTitle className="text-lg font-semibold text-gray-800">Chat Bot Builder</CardTitle>
                  </div>
                </CardHeader>
              </Card>

              {/* Palette */}
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
                  <PaletteItem label="Interactive Form" type={NodeTypes.FORM} icon="🧩" />
                </CardContent>
              </Card>

              {/* Variables */}
              <Card className="border-0 shadow-sm">
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-2 text-sm font-medium text-gray-700">
                    <Variable className="h-4 w-4" />
                    Global Variables
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <VariableEditor
                    variables={variables}
                    setVariables={setVariables}
                    onNext={() => {
                      setLeftOpen(false);
                      // Optional: Add toast or notification
                    }}
                  />
                </CardContent>
              </Card>

              {/* Actions */}
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
                  <Button variant="outline" className="w-full border-gray-300 hover:bg-gray-50" onClick={() => loadSample(setRfNodes, setRfEdges)}>
                    <Upload className="mr-2 h-4 w-4" />
                    Load Sample
                  </Button>
                </CardContent>
              </Card>
            </div>
          </ScrollArea>
        )}
      </div>

      {/* CANVAS */}
      <div className="relative flex-1" ref={reactFlowWrapper}>
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
          {/* <MiniMap
            maskColor="rgb(240, 249, 255)"
            nodeColor={(n) => {
              switch (n.type) {
                case NodeTypes.SEND:
                  return 'rgb(34 197 94)';
                case NodeTypes.ASK:
                  return 'rgb(99 102 241)';
                case NodeTypes.COND:
                  return 'rgb(245 158 11)';
                case NodeTypes.TRIGGER:
                  return 'rgb(251 146 60)';
                case NodeTypes.FORM:
                  return 'rgb(59 130 246)';
                default:
                  return 'rgb(0 0 0)';
              }
            }}
          /> */}
          <Controls className="rounded-lg border border-gray-200 bg-white shadow-md" />
        </ReactFlow>
      </div>

      {/* RIGHT SIDEBAR */}
      <div className={cn('relative border-l border-gray-200 bg-white shadow-lg transition-all duration-300', rightOpen ? 'w-[400px]' : 'w-11')}>
        {/* Toggle Button */}
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
              {/* Header */}
              <Card className="border-0 bg-gradient-to-r from-gray-50 to-gray-100">
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-2">
                    <Play className="h-5 w-5 text-indigo-600" />
                    <CardTitle className="text-lg font-semibold text-gray-800">Inspector</CardTitle>
                  </div>
                </CardHeader>
              </Card>

              {/* Node Inspector */}
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

              {/* Live JSON */}
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

  function removeNode(id) {
    setRfNodes((nds) => nds.filter((n) => n.id !== id));
    setRfEdges((eds) => eds.filter((e) => e.source !== id && e.target !== id));
    setSelId((s) => (s === id ? null : s));
  }
}

function PaletteItem({ label, type, icon }) {
  const onDragStart = (event, nodeType) => {
    event.dataTransfer.setData('application/reactflow', nodeType);
    event.dataTransfer.effectAllowed = 'move';
  };

  const getIcon = (type) => {
    switch (type) {
      case 'send':
        return <MessageCircle className="h-5 w-5" />;
      case 'ask':
        return <HelpCircle className="h-5 w-5" />;
      case 'cond':
        return <Share className="h-5 w-5" />;
      case 'trigger':
        return <Zap className="h-5 w-5" />;
      case 'form':
        return <List className="h-5 w-5" />;
      default:
        return icon || <MessageCircle className="h-5 w-5" />;
    }
  };

  return (
    <Card
      className={cn(
        'relative cursor-grab border-gray-200 bg-white shadow-sm transition-all hover:scale-[1.02] hover:shadow-md active:cursor-grabbing active:opacity-80',
        'group',
      )}
      onDragStart={(e) => onDragStart(e, type)}
      draggable
    >
      <CardContent className="flex items-center gap-3 p-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-gray-100 to-gray-200 transition-colors group-hover:from-emerald-50 group-hover:to-blue-50">
          <span className="text-lg">{icon || getIcon(type)}</span>
        </div>
        <div className="min-w-0 flex-1">
          <h4 className="truncate text-sm font-medium text-gray-900">{label}</h4>
          <p className="text-xs text-gray-500">Drag to canvas</p>
        </div>
        <div className="opacity-0 transition-opacity group-hover:opacity-100">
          <div className="h-2 w-2 rounded-full bg-emerald-500" />
        </div>
      </CardContent>
    </Card>
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
    setVariables((prev) => [...prev, name]);
    setV('');
    setError('');
    setStep('list');
  };

  const handleDelete = (varToDelete) => {
    setVariables((prev) => prev.filter((x) => x !== varToDelete));
  };

  return (
    <Card className="overflow-hidden border-0 bg-white shadow-lg transition-all hover:shadow-xl">
      <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 pb-3">
        <div className="flex items-center gap-2">
          <Variable className="h-5 w-5 text-blue-600" />
          <CardTitle className="text-sm font-semibold text-gray-800">Global Variables</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-4 p-4">
        {step === 'list' && (
          <>
            {/* Variables List */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-medium uppercase tracking-wide text-gray-600">Your Variables</h3>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setStep('add')}
                  className="h-8 border-gray-300 px-3 text-blue-600 hover:bg-blue-50"
                >
                  <Plus className="mr-1 h-3 w-3" />
                  Add
                </Button>
              </div>

              {variables.length === 0 ? (
                <div className="rounded-lg bg-gray-50 py-8 text-center">
                  <Variable className="mx-auto mb-2 h-8 w-8 text-gray-400" />
                  <p className="text-sm text-gray-500">No variables added yet.</p>
                  <p className="mt-1 text-xs text-gray-400">Add your first variable to get started!</p>
                </div>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {variables.map((vv) => (
                    <Badge
                      key={vv}
                      variant="secondary"
                      className="group relative flex items-center gap-1 border-blue-200 bg-blue-100 px-3 py-1 text-xs font-medium text-blue-800 transition-all hover:bg-blue-200"
                    >
                      {vv}
                      <Button
                        variant="ghost"
                        size="sm"
                        className="absolute -right-1 -top-1 h-4 w-4 rounded-full bg-red-500 p-0 text-white opacity-0 transition-opacity hover:bg-red-600 group-hover:opacity-100"
                        onClick={() => handleDelete(vv)}
                      >
                        <X className="h-2 w-2" />
                      </Button>
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            {/* Next Button */}
            {variables.length > 0 && (
              <Button
                className="flex h-10 w-full transform items-center gap-2 bg-blue-500 font-semibold text-white shadow-md transition-all hover:scale-[1.02] hover:bg-blue-600"
                onClick={onNext}
              >
                <CheckCircle className="h-4 w-4" />
                Next →
              </Button>
            )}
          </>
        )}

        {step === 'add' && (
          <div className="animate-in fade-in space-y-4 duration-200">
            <div className="flex items-center gap-2">
              <Variable className="h-4 w-4 text-gray-600" />
              <h3 className="text-sm font-semibold text-gray-800">Add New Variable</h3>
            </div>

            <Input
              value={v}
              onChange={(e) => {
                setV(e.target.value);
                setError(''); // Clear error on type
              }}
              placeholder="e.g. user_name, phone_number"
              className={cn(
                'h-10 w-full border-gray-300 text-sm transition-all focus:border-blue-500 focus:ring-1 focus:ring-blue-500',
                error && 'border-red-300 focus:border-red-500 focus:ring-red-500',
              )}
            />

            {error && (
              <div className="flex items-center gap-2 rounded-md bg-red-50 p-2 text-xs text-red-600">
                <AlertCircle className="h-3 w-3" />
                {error}
              </div>
            )}

            <div className="flex gap-2">
              <Button className="h-10 flex-1 bg-blue-500 font-semibold text-white shadow-md transition-all hover:bg-blue-600" onClick={handleAdd}>
                Add Variable
              </Button>
              <Button
                variant="outline"
                className="h-10 border-gray-300 px-4 text-gray-700 hover:bg-gray-50"
                onClick={() => {
                  setStep('list');
                  setV('');
                  setError('');
                }}
              >
                Cancel
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
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
        type="button"
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
      {node.type === NodeTypes.FORM && (
        <div className="w-72 space-y-4">
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
              type="button"
              key={type.id}
              onClick={() => onPatch({ ...currentMeta, contentType: type.id })}
              className={cn(
                'flex-1 rounded-md px-3 py-1.5 text-sm font-medium transition-all',
                'flex items-center justify-center gap-2',
                contentType === type.id ? 'bg-white text-emerald-600 shadow-sm' : 'text-gray-500 hover:bg-white hover:shadow-sm',
              )}
            >
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
  const [previewVisible, setPreviewVisible] = useState(false);
  const activeFieldRef = useRef(null);

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

  const insertVariable = (varName) => {
    if (!activeFieldRef.current) return;

    const field = activeFieldRef.current;
    const start = field.selectionStart || 0;
    const end = field.selectionEnd || 0;
    const currentValue = field.value || '';
    const newValue = currentValue.substring(0, start) + varName + currentValue.substring(end);

    const conditionIndex = Number.parseInt(field.dataset.conditionIndex);
    const fieldType = field.dataset.fieldType;

    if (fieldType === 'var') {
      update(conditionIndex, { var: varName });
    } else if (fieldType === 'value') {
      update(conditionIndex, { value: newValue });
    }

    setOpenDropdown(false);
  };

  const generatePreview = () => {
    if (logic.length === 0) return 'No conditions';
    return logic
      .map((l, i) => {
        const connector = i === 0 ? 'IF' : 'AND';
        const opLabel = {
          exists: 'exists',
          eq: 'equals',
          ne: 'not equals',
          gt: 'greater than',
          lt: 'less than',
          contains: 'contains',
        }[l.op];
        return `${connector} ${l.var} ${opLabel} "${l.value || 'any'}"`;
      })
      .join(' ');
  };

  const hasInvalidConditions = logic.some((l) => !l.var || !l.value?.trim());

  return (
    <div className="relative">
      <Card className="border-0 bg-gradient-to-br from-emerald-50 to-emerald-100 p-6 shadow-md">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="border-emerald-300 text-emerald-700">
              <Info className="mr-1 h-3 w-3" />
              Conditional Logic
            </Badge>
          </div>
          <Button size="sm" variant="ghost" onClick={() => setPreviewVisible(!previewVisible)} className="text-emerald-600 hover:text-emerald-700">
            <span className="sr-only">Toggle preview</span>
            {previewVisible ? 'Hide' : 'Preview'} Logic
          </Button>
        </div>

        {previewVisible && (
          <div className="mb-4 rounded-lg border border-emerald-200 bg-white p-3">
            <div className="mb-1 flex items-center gap-2 font-mono text-sm text-emerald-800">
              <AlertCircle className="h-4 w-4 text-emerald-500" />
              <span>Preview:</span>
            </div>
            <code className="block whitespace-pre-wrap rounded bg-emerald-50 p-2 text-xs">
              {generatePreview()}
              {hasInvalidConditions && <span className="ml-2 text-xs text-red-500">⚠️ Incomplete fields</span>}
            </code>
          </div>
        )}

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
                <div
                  key={i}
                  className={cn(
                    'relative rounded-xl border border-emerald-200 bg-white p-4 shadow-sm transition-all hover:shadow-md',
                    hasInvalidConditions && 'border-red-300 ring-2 ring-red-200',
                  )}
                >
                  <div className="grid grid-cols-1 gap-4">
                    {/* Condition Header */}
                    <div className="flex items-center gap-3">
                      <Badge
                        variant="secondary"
                        className={cn('px-3 py-1 text-xs font-semibold', i === 0 ? 'bg-emerald-600 text-white' : 'bg-emerald-100 text-emerald-700')}
                      >
                        {i === 0 ? 'IF' : 'AND'}
                      </Badge>
                      {hasInvalidConditions && <AlertCircle className="h-4 w-4 text-red-500" title="Incomplete condition" />}
                    </div>

                    {/* Variable Select */}
                    <div className="space-y-1">
                      <label className="text-xs font-medium text-emerald-700">Variable</label>
                      <Select value={l.var || ''} onValueChange={(v) => update(i, { var: v })}>
                        <SelectTrigger
                          className="h-10 border-emerald-300 bg-white text-sm focus:border-emerald-500"
                          onFocus={(e) => {
                            const input = e.target.querySelector('input') || e.target;
                            activeFieldRef.current = input;
                            input.dataset.conditionIndex = i;
                            input.dataset.fieldType = 'var';
                          }}
                        >
                          <SelectValue placeholder="Select or type a variable" />
                        </SelectTrigger>
                        <SelectContent className="border-emerald-300">
                          {variables.map((v) => (
                            <SelectItem key={v} value={v} className="text-sm">
                              {v}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Operator Select */}
                    <div className="space-y-1">
                      <label className="text-xs font-medium text-emerald-700">Operator</label>
                      <Select value={l.op || 'eq'} onValueChange={(op) => update(i, { op })}>
                        <SelectTrigger className="h-10 border-emerald-300 bg-white text-sm focus:border-emerald-500">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="border-emerald-300">
                          <SelectItem value="exists">Exists</SelectItem>
                          <SelectItem value="eq">Equal to</SelectItem>
                          <SelectItem value="ne">Not equal to</SelectItem>
                          <SelectItem value="gt">Greater than</SelectItem>
                          <SelectItem value="lt">Less than</SelectItem>
                          <SelectItem value="contains">Contains</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Value Input */}
                    <div className="space-y-1">
                      <label className="text-xs font-medium text-emerald-700">Value</label>
                      <Input
                        value={l.value ?? ''}
                        onChange={(e) => update(i, { value: e.target.value })}
                        onFocus={(e) => {
                          activeFieldRef.current = e.target;
                          e.target.dataset.conditionIndex = i;
                          e.target.dataset.fieldType = 'value';
                        }}
                        placeholder="Enter value (e.g., 'hello', 42)"
                        className="h-10 border-emerald-300 bg-white text-sm placeholder:text-emerald-400 focus:border-emerald-500"
                      />
                    </div>
                  </div>

                  {/* Remove Button */}
                  {logic.length > 1 && (
                    <Button
                      size="sm"
                      variant="ghost"
                      className="absolute -right-2 -top-2 h-6 w-6 rounded-full bg-red-100 text-red-600 hover:bg-red-200"
                      onClick={() => removeCondition(i)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Variables Dropdown */}
        <div className="relative mt-4">
          <Button
            variant="outline"
            size="sm"
            className="w-full justify-between border-emerald-300 text-emerald-700 hover:bg-emerald-50"
            onClick={() => setOpenDropdown(!openDropdown)}
          >
            <span className="flex items-center gap-1">
              <span>VARIABLES ({variables.length})</span>
            </span>
            <ChevronDown className={`h-4 w-4 transition-transform ${openDropdown ? 'rotate-180' : ''}`} />
          </Button>

          {openDropdown && (
            <div className="absolute left-0 right-0 z-50 mt-1 max-h-48 overflow-auto rounded-lg border border-emerald-300 bg-white shadow-lg">
              <div className="p-2">
                {variables.length === 0 ? (
                  <p className="px-3 py-2 text-xs italic text-neutral-500">No variables available</p>
                ) : (
                  variables.map((v) => (
                    <Button
                      key={v}
                      variant="ghost"
                      className="w-full justify-start px-3 py-2 text-left text-sm hover:bg-emerald-50"
                      onClick={() => insertVariable(v)}
                    >
                      <code className="mr-2 font-mono">{`{{${v}}}`}</code>
                      <span>{v}</span>
                    </Button>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </Card>

      {/* Floating Add Button */}
      <Button
        size="icon"
        className="absolute bottom-4 right-4 h-14 w-14 transform rounded-full bg-emerald-600 text-white shadow-xl transition-all hover:scale-105 hover:bg-emerald-700"
        onClick={addCondition}
        disabled={variables.length === 0}
        title={variables.length === 0 ? 'No variables available' : 'Add condition'}
      >
        <Plus className="h-6 w-6" />
      </Button>

      {/* Footer Legend */}
      <div className="mt-6 flex justify-center gap-6 rounded-lg bg-white/50 p-3 text-xs text-neutral-600">
        <div className="flex items-center gap-1">
          <div className="h-2 w-2 animate-pulse rounded-full bg-emerald-500" />
          <span>Right = TRUE</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="h-2 w-2 rounded-full bg-red-500" />
          <span>Bottom = FALSE</span>
        </div>
      </div>
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

  const nid = () => Math.random().toString(36).substr(2, 9);

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
      <Card
        className={cn(
          'relative w-96 overflow-hidden border-2 shadow-lg transition-all',
          selected ? 'border-blue-500 ring-2 ring-blue-500 ring-opacity-20' : 'border-gray-300',
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between bg-gradient-to-r from-blue-500 to-indigo-600 p-4 text-white">
          <div className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5" />
            <h3 className="text-lg font-bold">{m.layout === 'list' ? 'List Message' : 'Button Message'}</h3>
          </div>

          {/* Layout selector */}
          <Select value={m.layout || 'button'} onValueChange={(layout) => data.onPatch({ meta: { ...m, layout } })}>
            <SelectTrigger className="h-8 w-28 bg-white/10 text-xs text-white">
              <SelectValue placeholder="Layout" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="button">Buttons</SelectItem>
              <SelectItem value="list">List</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <CardContent className="space-y-4 bg-gray-100 p-4">
          {/* Header Image Upload */}
          <Card className="border-0 bg-white shadow-sm">
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2">
                <CardTitle className="text-sm font-medium text-gray-700">Header Image (Optional)</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div
                className={cn(
                  'group relative mx-auto flex h-32 w-32 cursor-pointer items-center justify-center rounded-lg border-2 border-dashed border-gray-300 text-gray-500 transition-all hover:border-blue-400 hover:bg-blue-50',
                  m.uploadingHeader && 'animate-pulse',
                )}
              >
                <label className="flex h-full w-full cursor-pointer flex-col items-center justify-center">
                  <Upload className="mb-2 h-6 w-6 transition-colors group-hover:text-blue-500" />
                  <span className="text-center text-xs">Drop image here or click to upload</span>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
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
                  />
                </label>
              </div>
              {m.header?.mediaUrl && (
                <div className="relative">
                  <img src={m.header.mediaUrl} alt="Header preview" className="mx-auto h-32 w-32 rounded-lg border border-gray-200 object-cover" />
                  <Badge className="absolute right-2 top-2 bg-gray-800 text-xs text-white">{m.header.fileName}</Badge>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Body */}
          <div>
            <label className="mb-2 flex items-center gap-2 text-xs font-medium text-gray-700">
              <FileText className="h-3 w-3" />
              Body Text
            </label>
            <Textarea
              value={m.bodyText || ''}
              onChange={(e) => data.onPatch({ meta: { ...m, bodyText: e.target.value } })}
              placeholder="Enter your message..."
              className="min-h-20 resize-none border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            />
          </div>

          {/* Footer */}
          <div>
            <label className="mb-2 flex items-center gap-2 text-xs font-medium text-gray-700">Footer (Optional)</label>
            <Input
              value={m.footerText || ''}
              onChange={(e) => data.onPatch({ meta: { ...m, footerText: e.target.value } })}
              placeholder="Footer note..."
              className="border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            />
          </div>

          {/* Options (common for both layouts) */}
          <Card className="border-0 bg-white shadow-sm">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-blue-500" />
                  <CardTitle className="text-sm font-medium text-gray-700">{m.layout === 'list' ? 'List Items' : 'Interactive Buttons'}</CardTitle>
                  <Badge variant="secondary" className="text-xs">
                    {m.layout === 'list' ? 'Up to 10' : 'Up to 3'}
                  </Badge>
                </div>
                <Button
                  onClick={addOption}
                  className="bg-blue-500 px-3 py-1 text-xs text-white shadow-md hover:bg-blue-600"
                  disabled={m.layout === 'list' ? (m.options || []).length >= 10 : (m.options || []).length >= 3}
                >
                  <Plus className="mr-1 h-3 w-3" /> Add
                </Button>
              </div>
            </CardHeader>

            <CardContent className="space-y-3">
              {(m.options || []).map((opt, i) => (
                <div
                  key={opt.id}
                  className="group relative rounded-lg border border-gray-200 bg-gradient-to-r to-gray-50 p-3 transition-all hover:border-blue-300 hover:from-blue-50 hover:shadow-md"
                >
                  <div className="mb-2 flex items-center justify-between">
                    <GripVertical className="h-4 w-4 cursor-grab text-gray-400 group-hover:text-blue-500" />
                    <Button
                      variant="destructive"
                      size="sm"
                      className="h-6 w-6 bg-red-500 opacity-0 transition-opacity hover:bg-red-600 group-hover:opacity-100"
                      onClick={() => removeOption(i)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>

                  <Input
                    value={opt.title}
                    onChange={(e) => updateOption(i, { title: e.target.value })}
                    placeholder={m.layout === 'list' ? 'Item title' : 'Button label'}
                    className="mb-2 border-gray-300 focus:border-blue-500"
                  />

                  <Input
                    value={opt.description || ''}
                    onChange={(e) => updateOption(i, { description: e.target.value })}
                    placeholder={m.layout === 'list' ? 'Item description (optional)' : 'Description (optional)'}
                    className="border-gray-300 focus:border-blue-500"
                  />
                </div>
              ))}
            </CardContent>
          </Card>
        </CardContent>
      </Card>

      <Handle type="source" position={Position.Right} />

      {/* Dynamic connectors */}
      <div className="absolute right-0 top-3/4 h-0">
        {(m.options || []).map((opt, i) => (
          <Handle key={opt.id} id={`opt:${opt.id}`} type="source" position={Position.Right} style={{ top: `${40 + i * 18}px`, right: '-6px' }} />
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
      caption: '',
      uploading: false,
    };

  // 🟣 INTERACTIVE MESSAGE
  if (t === NodeTypes.INTERACTIVE)
    return {
      layout: 'button', // or list
      bodyText: '',
      footerText: '',
      header: { type: '', mediaUrl: '', fileName: '' },
      buttons: [],
      list: { buttonText: '', sections: [] },
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
    } else if (data?.kind?.startsWith('btn:')) {
      const btnKey = data.kind.split(':')[1];
      if (!m.routes) m.routes = {};
      m.routes[btnKey] = target;
    } else if (sNode.type === NodeTypes.TRIGGER && data?.kind === 'trigger:start') {
      m.startNext = target;
    } else {
      m.next = target;
    }
    metaById[source] = m;
  }

  // generate final structure
  for (const n of nodes) {
    const m = metaById[n.id] || {};

    // 🟡 Trigger
    if (n.type === NodeTypes.TRIGGER) {
      triggers.push({ keywords: m.keywords || [], start: m.startNext || null });
      continue;
    }

    // 🟢 Send message
    if (n.type === NodeTypes.SEND) {
      runtimeNodes.push({
        id: n.id,
        type: 'send_message',
        next: m.next || null,
        contentType: m.contentType || 'text',
        text: m.text || '',
        mediaUrl: m.mediaUrl || '',
        fileName: m.fileName || '',
      });
      continue;
    }

    // 🔵 Ask question
    if (n.type === NodeTypes.ASK) {
      runtimeNodes.push({
        id: n.id,
        type: 'ask_question',
        next: m.next || null,
        prompt: m.prompt || '',
        variable: m.variable || '',
        inputType: m.inputType || 'text',
        required: !!(m.required ?? true),
      });
      continue;
    }

    // 🟣 Interactive message (button or list)
    if (n.type === NodeTypes.INTERACTIVE) {
      const base = {
        id: n.id,
        type: 'interactive_message',
        layout: m.layout || 'button',
        bodyText: m.bodyText || '',
        footerText: m.footerText || '',
        header: m.header || { type: '', mediaUrl: '', fileName: '' },
        routes: m.routes || {},
        next: m.next || null,
      };

      if (m.layout === 'list') {
        base.list = m.list || { buttonText: '', sections: [] };
      } else {
        base.buttons = m.buttons || [];
      }

      runtimeNodes.push(base);
      continue;
    }

    // 🧩 Form node maps to interactive_message
    if (n.type === NodeTypes.FORM) {
      const routes = {};
      (m.options || []).forEach((o) => {
        if (m.routes?.[o.id]) routes[o.id] = m.routes[o.id];
      });
      runtimeNodes.push({
        id: n.id,
        type: 'interactive_message',
        layout: 'button',
        header: m.header,
        bodyText: m.bodyText,
        footerText: m.footerText,
        buttons: (m.options || []).map((o) => ({
          id: o.id,
          title: o.title,
          description: o.description,
        })),
        routes,
        next: m.next || null,
      });
      continue;
    }

    // 🟠 Condition node
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
