import useBusinessData from '@/components/store/useBusinessData';
import useWhatsapp from '@/components/store/useWhatsapp';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useChatBot } from '@/components/utils/chatbotHelper';
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
import { AnimatePresence, motion } from 'framer-motion';
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  Diamond,
  FileInputIcon,
  FileSpreadsheet,
  FileText,
  FileUp,
  GitBranch,
  GripVertical,
  HelpCircle,
  ImageIcon,
  Keyboard,
  ListOrdered,
  MessageCircle,
  MessageSquare,
  PanelLeftOpen,
  Plus,
  Save,
  Share2,
  SquareCheck,
  Trash2,
  Upload,
  X,
  Zap,
} from 'lucide-react';
import { type DragEvent, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import toast from 'react-hot-toast';
import { useLocation } from 'react-router-dom';
import { useMediaUpload } from '../../../hooks/useTemplates';
import DeleteButton from './deleteButton';
import GoogleSheets from './googleSheet';

const NodeTypes = {
  SEND: 'send_message',
  ASK: 'ask_question',
  COND: 'set_condition',
  TRIGGER: 'trigger',
  INTERACTIVE: 'interactive',
  INTERACTIVE_BUTTON: 'interactive_button_message',
  INTERACTIVE_LIST: 'interactive_list_message',
  SHEET: 'google_sheet',
};
const nid = () => Math.random().toString(36).slice(2, 10);

function ButtonEdge({ id, sourceX, sourceY, targetX, targetY, markerEnd }) {
  const [path] = getBezierPath({ sourceX, sourceY, targetX, targetY });
  return <BaseEdge id={id} path={path} markerEnd={markerEnd} />;
}

const edgeTypes = {
  button: ButtonEdge,
};

function SendNode({ data, selected }) {
  const m = data.meta?.contentType
    ? data.meta
    : {
        contentType: 'text',
        text: '',
        mediaUrl: '',
        fileName: '',
        caption: '',
        useUpload: false,
        storeVariable: '',
      };
  const textRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const { uploadMediaPassFile } = useMediaUpload();
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
  const insertVariable = (variable) => {
    if (!variable) return;
    const el = textRef.current;
    const placeholder = variable.startsWith('@') ? variable : `{{${variable}}}`;
    if (!el) return;

    const start = el.selectionStart || 0;
    const end = el.selectionEnd || 0;
    const currentText = m.text || '';
    const newText = currentText.substring(0, start) + placeholder + currentText.substring(end);

    data.onPatch({ meta: { ...m, text: newText } });

    // Use requestAnimationFrame for smoother focus
    requestAnimationFrame(() => {
      el?.focus();
      el?.setSelectionRange(start + placeholder.length, start + placeholder.length);
    });
  };

  const handleUpload = async (file, type) => {
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) return toast.error('File size exceeds 5MB limit');
    try {
      setUploading(true);
      setUploadProgress(0);
      const interval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 90) return prev;
          return prev + Math.random() * 10;
        });
      }, 200);

      const { url } = await uploadMediaPassFile(file);
      clearInterval(interval);
      setUploadProgress(100);

      data.onPatch({
        meta: {
          ...m,
          mediaUrl: url,
          fileName: file.name,
          contentType: type,
        },
      });

      setTimeout(() => setUploadProgress(0), 1000);
    } catch (err) {
      console.error(`${type} upload failed`, err);
    } finally {
      setUploading(false);
    }
  };

  const contentTypes = [
    { value: 'text', label: 'Text', icon: <FileText className="h-3 w-3" /> },
    { value: 'image', label: 'Image', icon: <ImageIcon className="h-3 w-3" /> },
    { value: 'document', label: 'Doc', icon: <FileUp className="h-3 w-3" /> },
  ];

  const handleContentTypeChange = (value) => {
    data.onPatch({
      meta: {
        ...m,
        contentType: value,
        mediaUrl: '',
        caption: '',
        fileName: '',
        useUpload: false,
      },
    });
  };

  const toggleUploadMode = () => {
    data.onPatch({
      meta: {
        ...m,
        useUpload: !m.useUpload,
        mediaUrl: '',
      },
    });
  };

  const updateMetaField = (field, value) => {
    data.onPatch({
      meta: { ...m, [field]: value },
    });
  };

  return (
    <div className="relative">
      <Handle type="target" position={Position.Left} className="z-50 !h-[0.75rem] !w-[0.75rem] bg-gray-400" />

      <Card
        className={cn(
          'relative w-80 overflow-hidden border-2 shadow-xl transition-all duration-200',
          selected ? 'border-emerald-500 ring-2 ring-emerald-500/20' : 'border-gray-200 hover:border-gray-300',
        )}
      >
        <DeleteButton data={data} />
        <section className="relative flex items-center justify-between bg-gradient-to-r from-emerald-500 via-emerald-600 to-teal-600 p-4 text-white shadow-sm">
          <h3 className="flex items-center gap-2 text-base font-semibold tracking-tight">
            <span className="rounded-lg bg-white/20 p-1.5">
              <MessageCircle className="h-4 w-4" />
            </span>
            Send Message
          </h3>
        </section>
        <CardContent className="space-y-4 bg-gradient-to-b from-gray-50 to-white p-4">
          <div className="flex gap-1 rounded-xl border border-gray-200 bg-white p-1 shadow-sm">
            {contentTypes.map((type) => (
              <Button
                key={type.value}
                variant={m.contentType === type.value ? 'default' : 'ghost'}
                size="sm"
                onClick={() => handleContentTypeChange(type.value)}
                className={cn(
                  'flex-1 gap-1.5 px-3 py-1.5 text-xs font-medium transition-all duration-150',
                  m.contentType === type.value
                    ? 'bg-emerald-600 text-white shadow-md hover:bg-emerald-700'
                    : 'border-transparent text-gray-500 hover:bg-gray-50 hover:text-gray-700',
                )}
                aria-label={`Switch to ${type.label} mode`}
              >
                <span className="flex items-center gap-1.5">
                  {type.icon}
                  <span>{type.label}</span>
                </span>
              </Button>
            ))}
          </div>

          {m.contentType === 'text' && (
            <div className="space-y-3">
              {data.variables?.length > 0 && (
                <VariableDropdown
                  value={null}
                  onChange={insertVariable}
                  variables={data.variables || []} // Non-prefixed (e.g., userName)
                  flowParams={data.variables.map((v) => `@${v}`)} // Prefixed (e.g., @userName)
                  placeholder="Insert variable..."
                />
              )}
              <div className="space-y-1.5">
                <label className="flex items-center gap-2 text-xs font-medium text-gray-700">
                  <FileText className="h-3 w-3 text-emerald-600" />
                  Message Text
                </label>
                <Textarea
                  ref={textRef}
                  value={m.text || ''}
                  onChange={(e) => updateMetaField('text', e.target.value)}
                  placeholder="Type your msg @var_name or {{variable_name}} here "
                  className="min-h-[80px] resize-none border-gray-300 text-sm transition-colors placeholder:text-gray-400 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/50"
                  rows={3}
                  aria-describedby="text-help"
                />
              </div>
            </div>
          )}

          {/* IMAGE MODE - Enhanced preview and upload UX */}
          {m.contentType === 'image' && (
            <div className="space-y-3">
              <div className="flex flex-col gap-2">
                <label className="text-xs font-medium text-gray-700">Image Source</label>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={toggleUploadMode}
                  className="h-[3rem] border-gray-300 text-sm text-gray-600 hover:border-emerald-400"
                >
                  {m.useUpload ? <FileText className="mr-2 h-4 w-4" /> : <Upload className="mr-2 h-4 w-4" />}
                  {m.useUpload ? 'Switch to URL' : 'Upload Image'}
                </Button>
              </div>

              {m.useUpload ? (
                <div className="space-y-2">
                  <label
                    className="group flex h-12 cursor-pointer items-center justify-center gap-2 rounded-lg border-2 border-dashed border-gray-300 bg-gradient-to-r from-gray-100 to-gray-200 text-xs text-gray-700 transition-all hover:from-emerald-50 hover:to-emerald-100 hover:text-emerald-600"
                    aria-label="Upload image file"
                  >
                    <Upload className="h-4 w-4 transition-transform group-hover:rotate-12" />
                    <span>{uploading ? `Uploading... ${uploadProgress}%` : 'Click to select image'}</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => handleUpload(e.target.files?.[0], 'image')}
                      disabled={uploading}
                    />
                  </label>
                  {uploading && (
                    <div className="h-1.5 w-full rounded-full bg-gray-200">
                      <div className="h-1.5 rounded-full bg-emerald-600 transition-all duration-300" style={{ width: `${uploadProgress}%` }} />
                    </div>
                  )}
                  {m.mediaUrl && !uploading && (
                    <div className="relative">
                      <img src={m.mediaUrl} alt="Uploaded" className="h-24 w-full rounded-lg border object-cover shadow-sm" />
                      <button
                        onClick={() => updateMetaField('mediaUrl', '')}
                        className="absolute right-1 top-1 rounded-full bg-white/80 p-1 hover:bg-red-50"
                        type="button"
                        aria-label="Remove image"
                      >
                        <Trash2 className="h-3 w-3 text-red-500" />
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-2">
                  <Input
                    value={m.mediaUrl || ''}
                    onChange={(e) => updateMetaField('mediaUrl', e.target.value)}
                    placeholder="https://example.com/image.jpg"
                    className="text-sm transition-colors focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/50"
                  />
                  {m.mediaUrl && (
                    <img
                      src={m.mediaUrl}
                      alt="preview"
                      className="h-24 w-full rounded-lg border object-cover shadow-sm"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                        e.currentTarget.nextSibling.style.display = 'block';
                      }}
                    />
                  )}
                  <p className="hidden text-xs text-gray-500">Invalid URL? Preview not available.</p>
                </div>
              )}

              <div className="space-y-1">
                <label className="flex items-center gap-2 text-xs font-medium text-gray-700">
                  <FileText className="h-3 w-3 text-emerald-600" />
                  Caption (Optional)
                </label>
                <Input
                  value={m.caption || ''}
                  onChange={(e) => updateMetaField('caption', e.target.value)}
                  placeholder="Describe the image for better context..."
                  className="text-sm transition-colors focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/50"
                />
              </div>
            </div>
          )}

          {/* DOCUMENT MODE - Consistent with image, improved feedback */}
          {m.contentType === 'document' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-medium text-gray-700">Document Source</label>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={toggleUploadMode}
                  className="border-gray-300 text-xs text-gray-600 hover:border-emerald-400"
                >
                  {m.useUpload ? 'Switch to URL' : 'Upload Instead'}
                </Button>
              </div>

              {m.useUpload ? (
                <div className="space-y-2">
                  <label
                    className="group flex h-12 cursor-pointer items-center justify-center gap-2 rounded-lg border-2 border-dashed border-gray-300 bg-gradient-to-r from-gray-100 to-gray-200 text-xs text-gray-700 transition-all hover:from-emerald-50 hover:to-emerald-100 hover:text-emerald-600"
                    aria-label="Upload document file"
                  >
                    <Upload className="h-4 w-4 transition-transform group-hover:rotate-12" />
                    <span>{uploading ? `Uploading... ${uploadProgress}%` : 'Click to select PDF/Doc'}</span>
                    <input
                      type="file"
                      accept=".pdf,.doc,.docx"
                      className="hidden"
                      onChange={(e) => handleUpload(e.target.files?.[0], 'document')}
                      disabled={uploading}
                    />
                  </label>
                  {uploading && (
                    <div className="h-1.5 w-full rounded-full bg-gray-200">
                      <div className="h-1.5 rounded-full bg-emerald-600 transition-all duration-300" style={{ width: `${uploadProgress}%` }} />
                    </div>
                  )}
                  {m.mediaUrl && !uploading && (
                    <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-3">
                      <p className="truncate text-xs font-medium text-emerald-700">✅ Uploaded: {m.fileName}</p>
                      <button
                        onClick={() => updateMetaField('mediaUrl', '')}
                        className="ml-2 text-xs text-emerald-600 hover:text-red-600"
                        type="button"
                      >
                        Remove
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <Input
                  value={m.mediaUrl || ''}
                  onChange={(e) => updateMetaField('mediaUrl', e.target.value)}
                  placeholder="Paste document URL (e.g., https://example.com/doc.pdf)"
                  className="text-sm transition-colors focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/50"
                />
              )}

              <div className="space-y-1">
                <label className="flex items-center gap-2 text-xs font-medium text-gray-700">
                  <FileUp className="h-3 w-3 text-emerald-600" />
                  File Name
                </label>
                <Input
                  value={m.fileName || ''}
                  onChange={(e) => updateMetaField('fileName', e.target.value)}
                  placeholder="document.pdf"
                  className="text-sm transition-colors focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/50"
                />
              </div>
            </div>
          )}
          {/* Response Variable */}
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
        </CardContent>
      </Card>

      <Handle type="source" position={Position.Right} className="z-50 !h-[0.75rem] !w-[0.75rem] bg-gray-400" />
    </div>
  );
}

function AskNode({ data, selected }) {
  const m = data.meta || {};
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
          {/* PROMPT */}
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

          {/* STORE VARIABLE */}
          <div className="space-y-1.5">
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
        </CardContent>
      </Card>

      <Handle type="source" position={Position.Right} className="z-50 !h-[0.75rem] !w-[0.75rem]" />
    </div>
  );
}

export function VariableDropdown({ value, onChange, variables = [], flowParams = [], placeholder = 'Select variable' }) {
  const formatDisplay = (item) => {
    if (flowParams.includes(item)) return item;
    if (variables.includes(item)) return `{{${item}}}`;
    return item;
  };

  return (
    <Select value={value || undefined} onValueChange={onChange}>
      <SelectTrigger className="h-8 text-xs">
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>

      <SelectContent className="w-[180px]">
        {flowParams.length > 0 && (
          <div className="px-2 py-1">
            <div className="px-2 py-1 text-xs font-medium uppercase tracking-wide text-gray-500">Stored variables</div>

            {flowParams.map((param) => (
              <SelectItem key={param} value={param} className="text-xs">
                {formatDisplay(param)}
              </SelectItem>
            ))}
          </div>
        )}
      </SelectContent>
    </Select>
  );
}

function CondNode({ data, selected }) {
  const logic = data.meta?.logic || [];
  const variables = data.variables || [];
  const flowParams = variables.map((v) => `@${v}`);
  const hasLogic = logic.length > 0;
  const [expanded, setExpanded] = useState(false);

  const updateLogic = (i, patch) => {
    const updated = logic.map((l, idx) => (idx === i ? { ...l, ...patch } : l));
    data.onPatch({ meta: { ...data.meta, logic: updated } });
  };

  const addCondition = () => {
    if (variables.length === 0 && flowParams.length === 0) return toast.error('Please add variables in previous nodes to set conditions.');
    const defaultVar = variables[0] || flowParams[0];
    data.onPatch({
      meta: {
        ...data.meta,
        logic: [...logic, { var: defaultVar, op: 'eq', value: '' }],
      },
    });
  };

  const removeCondition = (i) => {
    const updated = logic.filter((_, j) => j !== i);
    data.onPatch({ meta: { ...data.meta, logic: updated } });
  };

  // Fixed preview to display flow params as-is and custom vars as {{var}}
  const formatVarForPreview = (varName) => {
    if (flowParams.includes(varName)) return varName;
    if (variables.includes(varName)) return `{{${varName}}}`;
    return varName;
  };

  const conditionPreview = hasLogic
    ? logic.map((l, i) => `${i === 0 ? 'IF' : 'AND'} ${formatVarForPreview(l.var)} ${l.op} "${l.value || '...'}"`).join('\n')
    : 'No conditions set';

  return (
    <div className="relative">
      <Handle type="target" position={Position.Left} className="z-50 !h-[0.9rem] !w-[0.9rem] rounded-full border-2 border-amber-400 bg-amber-500" />
      <Card
        className={cn(
          'group relative w-96 overflow-hidden rounded-xl border bg-white shadow-md transition-all',
          selected ? 'border-2 border-amber-500 shadow-2xl ring-2 ring-amber-500/30' : 'border-amber-300 hover:border-amber-400 hover:shadow-lg',
        )}
      >
        <div className="relative bg-amber-500 p-4 text-white shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="rounded-lg bg-white/20 p-1.5">
                <MessageCircle className="h-4 w-4" />
              </div>
              <h3 className="text-base font-semibold tracking-tight">Condition</h3>
            </div>
          </div>
        </div>
        <div className="relative z-10 p-4 text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 transform items-center justify-center rounded-full bg-gradient-to-r from-amber-400 to-amber-600 shadow-lg transition-transform group-hover:rotate-12">
            <Diamond className="h-6 w-6 text-white" />
          </div>
          <h3 className="mb-1 text-sm font-bold text-amber-800">Condition</h3>
          <p className="text-xs text-amber-600">Branch your flow</p>
        </div>

        <CardContent className="relative z-10 space-y-3 px-4 pb-4">
          {hasLogic ? (
            <div className="space-y-3">
              <Button variant="ghost" size="sm" className="w-full justify-between text-amber-700" onClick={() => setExpanded(!expanded)}>
                <span className="text-xs">Preview Logic</span>
                <ChevronDown className={`h-3 w-3 transition-transform ${expanded ? 'rotate-180' : ''}`} />
              </Button>
              <div className="max-h-24 overflow-y-auto rounded-lg border border-amber-200 bg-white/80 p-3">
                <code className="block whitespace-pre-wrap font-mono text-xs text-amber-800">{conditionPreview}</code>
              </div>
              <div className="space-y-2">
                {logic.map((l, i) => (
                  <div key={i} className="rounded-lg border border-amber-200 bg-white/70 p-2 shadow-sm">
                    <div className="flex items-center justify-between">
                      <Badge variant="secondary" className="bg-blue-500 text-[10px] text-white">
                        {i === 0 ? 'IF' : 'AND'}
                      </Badge>
                      <Button variant="ghost" size="sm" onClick={() => removeCondition(i)} className="h-6 w-6 p-0 text-red-500 hover:bg-red-50">
                        <X className="h-3 w-3" />
                      </Button>
                    </div>

                    <div className="mt-2 grid grid-cols-3 gap-2">
                      <VariableDropdown
                        value={l.var}
                        onChange={(val) => updateLogic(i, { var: val })}
                        variables={variables} // Non-prefixed for custom
                        flowParams={flowParams} // @ prefixed for stored
                        placeholder="Select var"
                      />

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
              <Button variant="outline" onClick={addCondition} className="w-full border-amber-300 bg-blue-500 text-white">
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
      <DeleteButton data={data} />
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
        style={{ top: '70%' }}
      />
    </div>
  );
}

function TriggerNode({ data, selected }) {
  const meta = data.meta || {};
  const existingKeywords: string[] = meta.keywords || [];

  const [keywordInput, setKeywordInput] = useState('');

  const handleAddKeyword = () => {
    const keyword = keywordInput.trim().toLowerCase();
    if (!keyword) return;

    if (existingKeywords.includes(keyword)) {
      setKeywordInput('');
      return;
    }

    const updatedKeywords = [...existingKeywords, keyword];

    data.onPatch({
      meta: {
        ...meta,
        keywords: updatedKeywords,
      },
    });

    setKeywordInput('');
  };

  const handleRemoveKeyword = (keywordToRemove: string) => {
    const updatedKeywords = existingKeywords.filter((k: string) => k !== keywordToRemove);

    data.onPatch({
      meta: {
        ...meta,
        keywords: updatedKeywords,
      },
    });
  };

  return (
    <div className="relative">
      <Handle id="start" type="source" position={Position.Right} className="z-50 !h-3 !w-3 !border-2 !border-white !bg-orange-500" />

      <Card
        className={cn(
          'relative w-96 overflow-hidden border-2 shadow-xl transition-all duration-200',
          selected ? 'border-orange-500 ring-4 ring-orange-500/20' : 'border-gray-300',
        )}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-orange-500 to-red-600 p-4 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Zap className="h-5 w-5" />
              <h3 className="text-lg font-bold">Trigger Keyword</h3>
            </div>
            <DeleteButton data={data} />
          </div>
        </div>

        <CardContent className="space-y-4 bg-gray-50 p-5">
          {/* Input Field */}
          <div className="space-y-3">
            <label className="text-xs font-semibold uppercase tracking-wider text-gray-700">Trigger Keywords</label>

            <div className="flex items-center gap-2">
              <input
                type="text"
                value={keywordInput}
                onChange={(e) => setKeywordInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddKeyword())}
                placeholder="e.g. hi, hello, start"
                className="flex-1 rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm placeholder-gray-400 transition-all focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-200"
              />
              <Button
                onClick={handleAddKeyword}
                disabled={!keywordInput.trim()}
                size="sm"
                className="bg-orange-500 px-5 font-medium text-white hover:bg-orange-600"
              >
                Add
              </Button>
            </div>
          </div>

          {/* Keyword Chips */}
          {existingKeywords.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {existingKeywords.map((keyword) => (
                <motion.div
                  key={keyword}
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.8, opacity: 0 }}
                  transition={{ duration: 0.15 }}
                >
                  <Badge
                    variant="secondary"
                    className="group flex items-center gap-1.5 border border-orange-300 bg-orange-100 py-1.5 pl-3 pr-2 text-sm font-medium text-orange-800 hover:bg-orange-200"
                  >
                    <span>{keyword}</span>
                    <button
                      onClick={() => handleRemoveKeyword(keyword)}
                      className="ml-1 rounded-full p-0.5 transition-colors hover:bg-orange-300"
                      title={`Remove "${keyword}"`}
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </Badge>
                </motion.div>
              ))}
            </div>
          )}

          {/* Empty State */}
          {existingKeywords.length === 0 && (
            <p className="py-4 text-center text-xs italic text-gray-500">No trigger keywords yet. Add one to activate this flow!</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function InteractiveReply({ data, selected }) {
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

function InteractiveButtonNode({ data, selected }) {
  const m = data.meta ?? {
    layout: 'button',
    header: { type: 'none', mediaUrl: '', useUpload: false },
    bodyText: '',
    footerText: '',
    buttons: [{ id: 'btn_1', type: 'reply', title: '' }],
    list: { sections: [] },
    routes: {},
  };

  const nid = () => `btn_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;

  const addButton = () => {
    const newBtn = { id: nid(), type: 'reply', title: '', url: '' };
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
          <Textarea
            placeholder="Enter your message..."
            value={m.bodyText}
            onChange={(e) => data.onPatch({ meta: { ...m, bodyText: e.target.value } })}
            className="min-h-24 resize-none border-gray-300 focus:border-indigo-500"
          />
          <div className="space-y-3">
            {(m.buttons || []).map((btn, i) => (
              <div
                key={btn.id}
                className="group relative gap-3 space-y-2 rounded-xl border border-gray-200 bg-white p-3 transition-all hover:border-indigo-400"
              >
                <Handle
                  type="source"
                  id={btn.id}
                  position={Position.Right}
                  className="z-50 -mr-2 !h-5 !w-5 !border-4 !border-white !bg-gray-600 shadow-xl"
                />
                <div className="flex items-center">
                  <span className="rounded-md bg-indigo-600/10 px-2 py-1 text-xs font-medium text-indigo-700">Reply Button</span>
                </div>

                {/* Title Input */}
                <Input
                  placeholder="Button Text"
                  value={btn.title}
                  onChange={(e) => updateButton(i, { title: e.target.value })}
                  className="h-10 flex-1 text-sm font-medium focus:ring-0"
                />
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

function InteractiveListNode({ data, selected }) {
  let m = data.meta ?? {};

  useEffect(() => {
    const hasList = !!m.list;
    if (!hasList || m.layout !== 'list' || m.type !== 'interactive_list_message') {
      data.onPatch({
        meta: {
          ...m,
          type: 'interactive_list_message',
          layout: 'list',
          list: m.list ?? { buttonText: 'Choose', sections: [] },
        },
      });
    }
  }, []);

  m = {
    type: 'interactive_list_message',
    layout: 'list',
    headerText: m.headerText || '',
    bodyText: m.bodyText || '',
    footerText: m.footerText || '',
    list: {
      buttonText: m.list?.buttonText || 'Choose',
      sections: m.list?.sections || [],
    },
    routes: m.routes || {},
  };

  const nid = () => `${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;

  // === SECTION LOGIC ===
  const addListSection = () => {
    const newSection = { id: `sec_${nid()}`, title: '', rows: [] };
    const updatedList = {
      ...m.list,
      sections: [...(m.list.sections || []), newSection],
    };
    console.log('Adding section, updated list:', updatedList);
    data.onPatch({ meta: { ...m, list: updatedList } });
  };

  // === ROW LOGIC ===
  const addListRow = (sectionIndex: number) => {
    const newRowId = `row_${nid()}`;
    const updatedSections = m.list.sections.map((s, i) =>
      i === sectionIndex
        ? {
            ...s,
            rows: [...(s.rows || []), { id: newRowId, title: '', description: '' }],
          }
        : s,
    );
    data.onPatch({
      meta: {
        ...m,
        list: { ...m.list, sections: updatedSections },
        routes: { ...(m.routes || {}), [newRowId]: '' },
      },
    });

    console.log('Adding row, updated sections:', updatedSections);
  };

  const updateListRow = (si, ri, patch) => {
    const sections = m.list.sections.map((s, i) => {
      if (i !== si) return s;
      const rows = (s.rows || []).map((r, j) => (j === ri ? { ...r, ...patch } : r));
      return { ...s, rows };
    });
    data.onPatch({ meta: { ...m, list: { ...m.list, sections } } });

    console.log('Updating row, updated sections:', sections);
  };

  const removeListSection = (si) => {
    const sections = m.list.sections.filter((_, i) => i !== si);
    data.onPatch({ meta: { ...m, list: { ...m.list, sections } } });
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
                      const sections = [...m.list.sections];
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
        </CardContent>
      </Card>
    </div>
  );
}

function GoogleSheetNode({ data, selected }) {
  return <GoogleSheets data={data} selected={selected} />;
}

const nodeTypes = {
  [NodeTypes.SEND]: SendNode,
  [NodeTypes.ASK]: AskNode,
  [NodeTypes.COND]: CondNode,
  [NodeTypes.TRIGGER]: TriggerNode,
  [NodeTypes.INTERACTIVE]: InteractiveReply,
  [NodeTypes.INTERACTIVE_BUTTON]: InteractiveButtonNode,
  [NodeTypes.INTERACTIVE_LIST]: InteractiveListNode,
  [NodeTypes.SHEET]: GoogleSheetNode,
};

function makeNode({ id, type, position, patch, updateGlobalVariables, remove, variables }) {
  let defaultMeta = {};
  switch (type) {
    case NodeTypes.INTERACTIVE:
      defaultMeta = {
        layout: 'button',
        header: { type: 'none', mediaUrl: '', useUpload: false },
        bodyText: '',
        footerText: '',
        buttons: [{ id: `btn_${Math.random().toString(36).slice(2, 9)}`, type: 'reply', title: 'Option 1' }],
        list: { sections: [] },
        routes: {},
      };
      break;
    case NodeTypes.SEND:
      defaultMeta = { contentType: 'text', text: '', variable: '', mediaUrl: '', caption: '' };
      break;
    case NodeTypes.ASK:
      defaultMeta = { prompt: '', inputType: 'text', required: true, variable: '' };
      break;
    case NodeTypes.COND:
      defaultMeta = { logic: [] };
      break;
    case NodeTypes.TRIGGER:
      defaultMeta = { keywords: [] };
      break;
    case NodeTypes.SHEET:
      defaultMeta = {
        spreadsheetId: '',
        sheetName: 'Sheet1',
        cells: [{ key: 'name', value: '@userName' }],
      };
      break;
  }

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
      meta: defaultMeta,
    },
  };
}

function buildFinalFromGraph(nodes, edges) {
  const byId = Object.fromEntries(nodes.map((n) => [n.id, n]));
  const metaById = Object.fromEntries(nodes.map((n) => [n.id, JSON.parse(JSON.stringify(n.data.meta || {}))]));

  const globalVars = new Set();
  nodes.forEach((n) => {
    const m = metaById[n.id] || {};
    const varName = (m.variable || '').trim();
    if (varName) globalVars.add(varName);
  });
  const variables = Array.from(globalVars);

  const runtimeNodes = [];
  const triggers = [];

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
    } else if (sNode.type === NodeTypes.INTERACTIVE) {
      m.routes = m.routes || {};
      m.routes[e.sourceHandle] = target;
    } else {
      m.next = target;
    }
  }

  for (const n of nodes) {
    const m = metaById[n.id] || {};

    if (n.type === NodeTypes.TRIGGER) {
      triggers.push({ keywords: m.keywords || [], start: m.startNext || null });
      continue;
    }

    if (n.type === NodeTypes.SEND) {
      runtimeNodes.push({
        id: n.id,
        type: NodeTypes.SEND,
        next: m.next || null,
        contentType: m.contentType || 'text',
        text: m.text || '',
        mediaUrl: m.mediaUrl || '',
        fileName: m.fileName || '',
        caption: m.caption || '',
        selectedVars: m.selectedVars || [],
        variable: (m.variable || '').trim() || null,
      });
      continue;
    }

    if (n.type === NodeTypes.ASK) {
      runtimeNodes.push({
        id: n.id,
        type: NodeTypes.ASK,
        next: m.next || null,
        prompt: m.prompt || '',
        inputType: m.inputType || 'text',
        required: !!(m.required ?? true),
        variable: (m.variable || '').trim() || null,
      });
      continue;
    }

    if (n.type === NodeTypes.INTERACTIVE) {
      runtimeNodes.push({
        id: n.id,
        type: NodeTypes.INTERACTIVE,
        layout: m.layout || 'button',
        header: m.header || null,
        bodyText: m.bodyText || '',
        footerText: m.footerText || '',
        buttons: m.buttons || [],
        list: m.list || null,
        routes: m.routes || {},
        next: m.next || null,
        variable: null,
      });
    }
    if (n.type === NodeTypes.INTERACTIVE_BUTTON) {
      const m = n.data?.meta || {};
      const buttons = Array.isArray(m.buttons) ? m.buttons : [];
      runtimeNodes.push({
        id: n.id,
        type: NodeTypes.INTERACTIVE_BUTTON,
        headerText: m.headerText || '',
        bodyText: m.bodyText || '',
        footerText: m.footerText || '',
        buttons: buttons,
        routes: m.routes || {},
      });
    }

    if (n.type === NodeTypes.INTERACTIVE_LIST) {
      const m = n.data?.meta || {};
      const list = m.list || { buttonText: 'Choose', sections: [] };

      runtimeNodes.push({
        id: n.id,
        type: NodeTypes.INTERACTIVE_LIST,
        headerText: m.headerText || '',
        bodyText: m.bodyText || '',
        footerText: m.footerText || '',
        layout: 'list',
        list: {
          buttonText: list.buttonText || 'Choose',
          sections: Array.isArray(list.sections) ? list.sections : [],
        },
        routes: m.routes || {},
      });
    }

    if (n.type === NodeTypes.COND) {
      runtimeNodes.push({
        id: n.id,
        type: NodeTypes.COND,
        logic: m.logic || [],
        trueNext: m.trueNext || null,
        falseNext: m.falseNext || null,
      });
    }

    if (n.type === NodeTypes.SHEET) {
      const m = n.data?.meta || {};
      const sheet = m.sheet || {};

      runtimeNodes.push({
        id: n.id,
        type: 'google_sheet',
        next: m.next || null,
        variable: null,
        sheet: {
          spreadsheetId: sheet.spreadsheetId || '',
          sheetName: sheet.sheetName || 'Sheet1',
          cells: sheet.cells || [],
        },
      });
    }
  }

  return {
    version: 2,
    variables,
    triggers,
    nodes: runtimeNodes,
  };
}

export const PaletteItem = ({ label, type, icon, gradient }: { label: string; type: string; icon: React.ReactNode; gradient: string }) => {
  const handleDragStart = (e: DragEvent) => {
    e.dataTransfer.setData('application/reactflow', type);
    e.dataTransfer.effectAllowed = 'move';
  };

  return (
    <div
      draggable
      onDragStart={handleDragStart}
      className={cn(
        'group relative flex cursor-grab items-center gap-3 rounded-lg border bg-white px-4 py-3 shadow-sm transition-all',
        'hover:scale-[1.02] hover:shadow-md active:scale-100 active:cursor-grabbing',
        'border-gray-200',
      )}
    >
      <div className={`flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br ${gradient} p-2 text-white shadow-md`}>{icon}</div>
      <span className="select-none text-sm font-medium text-gray-800">{label}</span>
      <GripVertical className="absolute right-3 h-4 w-4 text-gray-400 opacity-0 transition-opacity group-hover:opacity-100" />
      <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-lg">
        <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
      </div>
    </div>
  );
};

const categories = [
  {
    id: 'messages',
    title: 'Messages & Replies',
    icon: <MessageSquare className="h-4 w-4" />,
    color: 'from-emerald-400 to-teal-600',
    bg: 'bg-emerald-50 border-emerald-200',
    items: [
      { label: 'Ask a Question', type: NodeTypes.ASK, icon: <HelpCircle className="h-5 w-5" /> },
      { label: 'Send Message', type: NodeTypes.SEND, icon: <MessageSquare className="h-5 w-5" /> },
      { label: 'Interactive Reply', type: NodeTypes.INTERACTIVE, icon: <Share2 className="h-5 w-5" /> },
      { label: 'Buttons', type: NodeTypes.INTERACTIVE_BUTTON, icon: <SquareCheck className="h-5 w-5" /> },
      { label: 'Lists', type: NodeTypes.INTERACTIVE_LIST, icon: <ListOrdered className="h-5 w-5" /> },
    ],
  },
  {
    id: 'logic',
    title: 'Logic & Data',
    icon: <GitBranch className="h-4 w-4" />,
    color: 'from-violet-400 to-purple-600',
    bg: 'bg-violet-50 border-violet-200',
    items: [
      { label: 'Set a Condition', type: NodeTypes.COND, icon: <GitBranch className="h-5 w-5" /> },
      { label: 'Spreadsheet Action', type: NodeTypes.SHEET, icon: <FileSpreadsheet className="h-5 w-5" /> },
    ],
  },
];

function EditorShell() {
  const [chatbotName, setChatbotName] = useState('My Chatbot');
  const [rfNodes, setRfNodes] = useState([]);
  const [rfEdges, setRfEdges] = useState([]);
  const [variables, setVariables] = useState([]);
  const [leftOpen, setLeftOpen] = useState(true);
  const [openCategories, setOpenCategories] = useState<string[]>(['triggers', 'messages', 'logic']);

  const businessId = useBusinessData((s) => s.outletInfo?.businessId);
  const { createChatbot } = useChatBot();
  const reactFlowWrapper = useRef(null);
  const { screenToFlowPosition } = useReactFlow();
  const setOpenBot = useWhatsapp((s) => s.setOpenBot);
  const { search } = useLocation();
  const searchParams = new URLSearchParams(search);
  const chatbotId = searchParams.get('chatbotId');

  // RIGHT-CLICK CONTEXT MENU STATE
  const [contextMenu, setContextMenu] = useState<{
    nodeId: string;
    handleId: string | null;
    clientX: number;
    clientY: number;
  } | null>(null);

  const handleOpenChatbot = useCallback(() => setOpenBot(false), [setOpenBot]);

  const updateGlobalVariables = useCallback((newVars) => {
    setVariables((prev) => Array.from(new Set([...prev, ...newVars])));
    setRfNodes((nds) => nds.map((n) => ({ ...n, data: { ...n.data, variables: newVars } })));
  }, []);

  const onNodesChange = useCallback((changes) => setRfNodes((nds) => applyNodeChanges(changes, nds)), []);
  const onEdgesChange = useCallback((changes) => setRfEdges((eds) => applyEdgeChanges(changes, eds)), []);

  const onConnect = useCallback((params) => {
    const edge = { ...params, id: `e-${nid()}`, data: {} };
    if (params.sourceHandle === 'true') edge.data.kind = 'cond:true';
    else if (params.sourceHandle === 'false') edge.data.kind = 'cond:false';
    else if (params.sourceHandle === 'start') edge.data.kind = 'trigger:start';

    setRfEdges((eds) => addEdge(edge, eds));

    setRfNodes((nds) =>
      nds.map((n) => {
        if (n.id === params.source) {
          const m = n.data.meta || {};
          const routes = { ...(m.routes || {}) };
          if (params.sourceHandle) routes[params.sourceHandle] = params.target;
          return { ...n, data: { ...n.data, meta: { ...m, routes } } };
        }
        return n;
      }),
    );
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
          onVariableAdd: updateGlobalVariables,
          remove: removeNode,
        }),
      ]);
    },
    [variables, updateGlobalVariables],
  );

  const onDrop = useCallback(
    (event) => {
      event.preventDefault();
      const type = event.dataTransfer.getData('application/reactflow');
      if (!type) return;
      const position = screenToFlowPosition({ x: event.clientX, y: event.clientY });
      addNode(type, position);
    },
    [screenToFlowPosition, addNode],
  );

  const onDragOver = useCallback((event) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const patchNode = useCallback(
    (id, patch) => {
      setRfNodes((nds) =>
        nds.map((n) =>
          n.id === id
            ? {
                ...n,
                data: {
                  ...n.data,
                  ...patch,
                  meta: { ...n.data.meta, ...(patch.meta || {}) },
                  remove: removeNode,
                  onVariableAdd: updateGlobalVariables,
                },
              }
            : n,
        ),
      );
    },
    [updateGlobalVariables],
  );

  const removeNode = useCallback((id) => {
    setRfNodes((nds) => nds.filter((n) => n.id !== id));
    setRfEdges((eds) => eds.filter((e) => e.source !== id && e.target !== id));
  }, []);

  const finalObject = useMemo(() => {
    const core = buildFinalFromGraph(rfNodes, rfEdges);
    return { chatbotName, businessId, ...core };
  }, [rfNodes, rfEdges, chatbotName, businessId]);

  const handleSaveFlow = () => {
    createChatbot(finalObject);
    // if (chatbotId) {
    //   // update logic
    // } else {
    //   createChatbot(finalObject);
    // }
  };

  const toggleCategory = (id: string) => {
    setOpenCategories((prev) => (prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]));
  };

  return (
    <div className="inter flex h-full w-full overflow-hidden bg-gray-50">
      {/* LEFT SIDEBAR */}
      <div
        className={cn('relative flex-shrink-0 border-r border-gray-200 bg-white transition-all duration-300', leftOpen ? 'w-80 shadow-xl' : 'w-12')}
      >
        <div role="button" tabIndex={0} onClick={() => setLeftOpen((v) => !v)} className="absolute right-[-18px] top-6 z-10">
          <Button variant="outline" size="icon" className="h-9 w-9 rounded-full bg-white shadow-lg hover:text-blue-600">
            {leftOpen ? <ChevronLeft className="h-5 w-5" /> : <PanelLeftOpen className="h-5 w-5" />}
          </Button>
        </div>

        {leftOpen && (
          <div className="flex h-[90dvh] flex-col">
            <Card className="rounded-none border-b border-gray-100 bg-slate-50 shadow-none">
              <CardHeader className="p-4 pb-3">
                <div className="mb-3 flex items-center gap-2">
                  <ChevronsLeft className="h-8 w-8 cursor-pointer hover:text-blue-600" onClick={handleOpenChatbot} />
                  <CardTitle className="text-2xl font-semibold">Chat Bot Flow Editor</CardTitle>
                </div>
                <Input value={chatbotName} onChange={(e) => setChatbotName(e.target.value)} placeholder="Flow name..." className="h-9 text-sm" />
              </CardHeader>
            </Card>

            <div className="flex-1 space-y-5 overflow-y-auto p-5">
              <div className="text-sm font-semibold text-slate-600">Node Palette</div>
              <div className="space-y-4">
                <PaletteItem
                  label="Trigger Keyword"
                  type={NodeTypes.TRIGGER}
                  icon={<Keyboard className="h-5 w-5" />}
                  gradient="from-orange-400 to-red-500"
                />
                {categories.map((category) => {
                  const isOpen = openCategories.includes(category.id);
                  return (
                    <motion.div key={category.id} layout className={cn('overflow-hidden rounded-xl border bg-white shadow-sm', category.bg)}>
                      <button
                        onClick={() => toggleCategory(category.id)}
                        className="flex w-full items-center justify-between p-4 text-left transition-colors hover:bg-white/60"
                      >
                        <div className="flex items-center gap-3">
                          <div className={`h-9 w-9 rounded-lg bg-gradient-to-br ${category.color} flex items-center justify-center text-white`}>
                            {category.icon}
                          </div>
                          <span className="font-semibold text-gray-800">{category.title}</span>
                          <span className="ml-2 text-xs text-gray-500">{category.items.length}</span>
                        </div>
                        {isOpen ? <ChevronDown className="h-5 w-5" /> : <ChevronRight className="h-5 w-5" />}
                      </button>

                      <AnimatePresence>
                        {isOpen && (
                          <motion.div
                            initial={{ height: 0 }}
                            animate={{ height: 'auto' }}
                            exit={{ height: 0 }}
                            className="border-t border-gray-200/80"
                          >
                            <div className="space-y-2 p-4 pb-5">
                              {category.items.map((item, idx) => (
                                <motion.div
                                  key={item.type}
                                  initial={{ opacity: 0, y: -8 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  transition={{ delay: idx * 0.05 }}
                                >
                                  <PaletteItem label={item.label} type={item.type} icon={item.icon} gradient={category.color} />
                                </motion.div>
                              ))}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  );
                })}
              </div>
            </div>

            <div className="shadow-up border-t bg-white p-4">
              <Button onClick={handleSaveFlow} className="w-full bg-blue-600 hover:bg-blue-700">
                <Save className="mr-2 h-4 w-4" /> Publish Flow
              </Button>
            </div>
          </div>
        )}
      </div>

      <div className="relative h-[85dvh] flex-1" ref={reactFlowWrapper}>
        <ReactFlow
          nodes={rfNodes}
          edges={rfEdges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onDrop={onDrop}
          onDragOver={onDragOver}
          nodeTypes={nodeTypes}
          edgeTypes={edgeTypes}
          fitView
          className="bg-gray-100"
          proOptions={{ hideAttribution: true }}
          onNodeContextMenu={useCallback((event, node) => {
            event.preventDefault();
            const target = event.target as HTMLElement;
            const handle = target.closest('[data-handleid]') as HTMLElement;
            const handleId = handle?.getAttribute('data-handleid') || null;
            if (handle && handle.getAttribute('data-handlepos') !== 'right') return;
            setContextMenu({
              nodeId: node.id,
              handleId, // ← This is now correct: 'true', 'false', 'start', or null
              clientX: event.clientX,
              clientY: event.clientY,
            });
          }, [])}
          onPaneClick={() => setContextMenu(null)}
          onNodeClick={() => setContextMenu(null)}
        >
          <Background variant="dots" gap={12} size={1} className="bg-gray-50" />
          <Controls className="rounded-lg border border-gray-200 bg-white shadow-lg" />
          {contextMenu && (
            <div
              className="pointer-events-none fixed inset-0 z-[9999]"
              onContextMenu={(e) => e.preventDefault()}
              onClick={() => setContextMenu(null)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                className="pointer-events-auto absolute max-h-[70vh] w-96 overflow-y-auto rounded-2xl border-4 border-white bg-white p-6 shadow-2xl"
                style={{
                  left: contextMenu.clientX + 10,
                  top: contextMenu.clientY + 10,
                }}
                onClick={(e) => e.stopPropagation()}
                onMouseDown={(e) => e.stopPropagation()}
                onMouseUp={(e) => e.stopPropagation()}
                onContextMenu={(e) => e.preventDefault()}
              >
                <div className="mb-5 flex items-center justify-between">
                  <h3 className="text-xl font-bold text-gray-800">
                    Add Node via {contextMenu.handleId ? `"${contextMenu.handleId}"` : 'Default'} Branch
                  </h3>
                  <button onClick={() => setContextMenu(null)} className="rounded-full p-2 hover:bg-gray-100">
                    <X className="h-5 w-5" />
                  </button>
                </div>

                <div className="space-y-6">
                  {categories.map((category) => (
                    <div key={category.id} className="space-y-3">
                      <div className="flex items-center gap-3">
                        <div
                          className={`h-10 w-10 rounded-lg bg-gradient-to-br ${category.color} flex items-center justify-center text-white shadow-md`}
                        >
                          {category.icon}
                        </div>
                        <h4 className="font-semibold text-gray-700">{category.title}</h4>
                      </div>

                      <div className="grid grid-cols-2 gap-3 pl-1">
                        {category.items.map((item) => (
                          <button
                            key={item.type}
                            onClick={() => {
                              const position = screenToFlowPosition({
                                x: contextMenu.clientX + 340,
                                y: contextMenu.clientY + 80,
                              });

                              const newNodeId = nid();
                              const newNode = makeNode({
                                id: newNodeId,
                                type: item.type,
                                position,
                                variables,
                                patch: (p) => patchNode(newNodeId, p),
                                onVariableAdd: updateGlobalVariables,
                                remove: removeNode,
                              });

                              setRfNodes((nds) => [...nds, newNode]);

                              // CORRESPONDING EDGE — Uses the exact handle you right-clicked!
                              const newEdge = {
                                id: `e-${contextMenu.nodeId}-${newNodeId}`,
                                source: contextMenu.nodeId,
                                target: newNodeId,
                                sourceHandle: contextMenu.handleId, // ← THIS IS NOW CORRECT!
                                animated: true,
                                style: { stroke: '#6366f1', strokeWidth: 3 },
                                data: {
                                  kind:
                                    contextMenu.handleId === 'true'
                                      ? 'cond:true'
                                      : contextMenu.handleId === 'false'
                                        ? 'cond:false'
                                        : contextMenu.handleId === 'start'
                                          ? 'trigger:start'
                                          : 'normal',
                                },
                              };

                              setRfEdges((eds) => addEdge(newEdge, eds));

                              // CORRECT ROUTE UPDATE
                              setRfNodes((nds) =>
                                nds.map((n) =>
                                  n.id === contextMenu.nodeId
                                    ? {
                                        ...n,
                                        data: {
                                          ...n.data,
                                          meta: {
                                            ...(n.data.meta || {}),
                                            routes: {
                                              ...(n.data.meta?.routes || {}),
                                              [contextMenu.handleId || 'next']: newNodeId,
                                            },
                                          },
                                        },
                                      }
                                    : n,
                                ),
                              );

                              // Auto-select
                              setRfNodes((nds) => nds.map((n) => ({ ...n, selected: n.id === newNodeId })));

                              setContextMenu(null);
                              toast.success(`${item.label} connected via "${contextMenu.handleId || 'default'}"`);
                            }}
                            className="group flex flex-col items-center gap-3 rounded-xl border-2 border-gray-200 bg-gradient-to-br from-gray-50 to-white p-4 transition-all hover:scale-105 hover:border-gray-400 hover:shadow-xl active:scale-95"
                          >
                            <div
                              className={`h-14 w-14 rounded-2xl bg-gradient-to-br ${category.color} flex items-center justify-center text-white shadow-lg group-hover:shadow-2xl`}
                            >
                              {item.icon}
                            </div>
                            <span className="text-xs font-medium text-gray-800">{item.label}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            </div>
          )}
        </ReactFlow>
      </div>

      {/* OUTPUT JSON PANEL */}
      <Card className="h-full max-w-xs flex-shrink-0 overflow-y-auto rounded-none border-0 shadow-lg">
        <CardHeader className="border-b p-3">
          <CardTitle className="text-sm font-semibold text-slate-700">Output JSON</CardTitle>
        </CardHeader>
        <CardContent className="p-3">
          <pre className="max-h-[85vh] overflow-auto rounded-lg bg-slate-900 p-3 font-mono text-xs text-slate-200">
            {JSON.stringify(finalObject, null, 2)}
          </pre>
        </CardContent>
      </Card>
    </div>
  );
}

export default function WhatsAppChatBot() {
  return (
    <ReactFlowProvider>
      <EditorShell />
    </ReactFlowProvider>
  );
}
