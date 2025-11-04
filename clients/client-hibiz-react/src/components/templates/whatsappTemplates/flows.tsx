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
  ChevronDown,
  ChevronLeft,
  Diamond,
  FileInputIcon,
  FileText,
  FileUp,
  GripVertical,
  ImageIcon,
  MessageCircle,
  PanelLeftOpen,
  Plus,
  Trash2,
  Upload,
  X,
  Zap,
} from 'lucide-react';
import { useCallback, useMemo, useRef, useState } from 'react';
import { useMediaUpload } from '../../../hooks/useTemplates';
import DeleteButton from './deleteButton';

const NodeTypes = {
  SEND: 'send_message',
  ASK: 'ask_question',
  COND: 'set_condition',
  TRIGGER: 'trigger',
  INTERACTIVE: 'interactive',
  FORM: 'form',
};
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

  const insertVariable = (variable) => {
    if (!variable) return;
    const el = textRef.current;
    // Adjust insertion based on type: @vars as-is, custom as {{var}}
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

        <div className="relative bg-gradient-to-r from-emerald-500 via-emerald-600 to-teal-600 p-4 text-white shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="rounded-lg bg-white/20 p-1.5">
                <MessageCircle className="h-4 w-4" />
              </div>
              <h3 className="text-base font-semibold tracking-tight">Send Message</h3>
            </div>
          </div>
        </div>

        <CardContent className="space-y-4 bg-gradient-to-b from-gray-50 to-white p-4">
          {/* Segmented Control for Content Types - More polished */}
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
              {data.variables?.length > 0 ? (
                <VariableDropdown
                  value={null}
                  onChange={insertVariable}
                  variables={data.variables || []} // Non-prefixed (e.g., userName)
                  flowParams={data.variables.map((v) => `@${v}`)} // Prefixed (e.g., @userName)
                  placeholder="Insert variable..."
                />
              ) : (
                <div className="rounded-lg border border-dashed border-gray-300 bg-gray-50 p-3 text-center">
                  <p className="flex items-center justify-center gap-1 text-xs text-gray-500">
                    <FileText className="h-3 w-3" />
                    No variables available yet. Add some in the flow to use dynamic content.
                  </p>
                </div>
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
          <div className="space-y-1.5">
            <label className="flex items-center gap-2 text-xs font-medium text-gray-700">
              <FileText className="h-3 w-3 text-emerald-600" />
              Response Variable (Optional)
            </label>
            <Input
              value={m.variable || ''}
              onChange={(e) => data.onPatch({ meta: { ...m, variable: e.target.value.trim().replace(/^@/, '') } })}
              placeholder="user_feedback"
              className="text-sm transition-colors focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/50"
            />
          </div>
        </CardContent>
      </Card>

      <Handle type="source" position={Position.Right} className="z-50 !h-[0.75rem] !w-[0.75rem] bg-gray-400" />
    </div>
  );
}

// Ask Question Node
function AskNode({ data, selected }) {
  const m = data.meta || {};
  const handleVariableChange = (e) => {
    const inputValue = e.target.value.trim().replace(/^@/, '');
    data.onPatch({ meta: { ...m, variable: inputValue } });

    if (inputValue && !data.variables.includes(inputValue)) {
      data.onVariableAdd([inputValue]);
    }
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
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-gray-700">Input Type</label>
            <Select value={m.inputType || 'text'} onValueChange={(v) => data.onPatch({ meta: { ...m, inputType: v } })}>
              <SelectTrigger className="h-8 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="text">Text</SelectItem>
                <SelectItem value="number">Number</SelectItem>
                <SelectItem value="phone">Phone</SelectItem>
                <SelectItem value="email">Email</SelectItem>
              </SelectContent>
            </Select>
          </div>

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
          <div className="space-y-1.5">
            <label className="flex items-center gap-2 text-xs font-medium text-gray-700">
              <FileText className="h-3 w-3 text-emerald-600" />
              Store Response In (Optional)
            </label>
            <Input
              value={m.variable?.replace(/^@/, '') || ''}
              onChange={handleVariableChange}
              placeholder="userName"
              className="text-sm transition-colors focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/50"
              aria-describedby="store-help"
            />
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

function VariableDropdown({ value, onChange, variables = [], flowParams = [], placeholder = 'Select variable' }) {
  const formatDisplay = (item) => {
    if (flowParams.includes(item)) return item; // e.g., @userName
    if (variables.includes(item)) return `{{${item}}}`; // e.g., {{userName}}
    return item;
  };

  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className="h-8 text-xs">
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent className="w-[180px]">
        {flowParams.length > 0 && (
          <div className="px-2 py-1">
            <div className="px-2 py-1 text-xs font-medium uppercase tracking-wide text-gray-500">Stored variables</div>
            {flowParams.map((param) => (
              <SelectItem key={param} value={param} className="text-xs">
                {formatDisplay(param)} {/* Shows @userName */}
              </SelectItem>
            ))}
          </div>
        )}
        {variables.length > 0 && (
          <div className="px-2 py-1">
            <div className="px-2 py-1 text-xs font-medium uppercase tracking-wide text-gray-500">Custom variables</div>
            {variables.map((varName) => (
              <SelectItem key={varName} value={varName} className="text-xs">
                {formatDisplay(varName)} {/* Shows {{userName}} */}
              </SelectItem>
            ))}
          </div>
        )}
      </SelectContent>
    </Select>
  );
}

// Updated Condition Node (with preview fix for display)
function CondNode({ data, selected }) {
  const logic = data.meta?.logic || [];
  const variables = data.variables || []; // Global custom variables
  const flowParams = variables.map((v) => `@${v}`); // ✅ Dynamic stored vars from global
  const hasLogic = logic.length > 0;
  const [expanded, setExpanded] = useState(false);

  const updateLogic = (i, patch) => {
    const updated = logic.map((l, idx) => (idx === i ? { ...l, ...patch } : l));
    data.onPatch({ meta: { ...data.meta, logic: updated } });
  };

  const addCondition = () => {
    if (variables.length === 0 && flowParams.length === 0) return;
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

              {expanded && (
                <div className="max-h-24 overflow-y-auto rounded-lg border border-amber-200 bg-white/80 p-3">
                  <code className="block whitespace-pre-wrap font-mono text-xs text-amber-800">{conditionPreview}</code>
                </div>
              )}
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

// Trigger Node
function TriggerNode({ data, selected }) {
  const m = data.meta || {};
  const [kw, setKw] = useState('');

  const handleAddKeyword = () => {
    const v = kw.trim();
    if (!v) return;
    const arr = [...(m.keywords || [])];
    if (!arr.includes(v)) arr.push(v);
    data.onPatch({ meta: { ...m, keywords: arr } });
    setKw('');
  };

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
          <DeleteButton data={data} />
        </div>

        <CardContent className="space-y-4 bg-gray-100 p-4">
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-xs font-medium text-gray-700">Trigger Keywords</label>
            <div className="flex gap-2">
              <input
                value={kw}
                onChange={(e) => setKw(e.target.value)}
                placeholder="Add trigger word 'Hai'"
                className="flex-1 rounded border border-gray-300 px-3 py-2 text-xs"
                onKeyPress={(e) => e.key === 'Enter' && handleAddKeyword()}
              />
              <Button size="sm" variant="outline" className="bg-blue-500 px-3 py-2 text-xs text-white" onClick={handleAddKeyword}>
                Add
              </Button>
            </div>
          </div>
          {(m.keywords || []).length > 0 && (
            <Badge variant="outline" className="bg-orange-100 text-xs text-orange-800">
              {m.keywords.join(', ')}
            </Badge>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// Interactive Node
function InteractiveNode({ data, selected }) {
  const m = data.meta ?? {
    layout: 'button',
    header: { type: 'none', mediaUrl: '', useUpload: false },
    bodyText: 'Write message here...',
    footerText: '',
    buttons: [{ id: 'btn_1', type: 'reply', title: 'Option 1' }],
    list: { sections: [] },
    routes: {},
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
          <div className="flex items-center gap-12">
            <div className="flex items-center gap-2">
              <MessageCircle className="h-5 w-5" />
              <h3 className="text-lg font-bold">Interactive</h3>
            </div>
            {/* Layout Switcher */}
            <Select value={m.layout || 'none'} onValueChange={(layout) => data.onPatch({ meta: { ...m, layout } })}>
              <SelectTrigger className="h-8 w-36 bg-white/10 text-xs text-white">
                <SelectValue placeholder="Layout" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Select an option</SelectItem>
                <SelectItem value="button">Buttons</SelectItem>
                <SelectItem value="list">List</SelectItem>
              </SelectContent>
            </Select>
            <DeleteButton data={data} />
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
              className="border-gray-300 bg-white focus:border-blue-500"
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
                    <Handle
                      id={btn.id}
                      type="source"
                      position={Position.Right}
                      className="!h-[0.6rem] !w-[0.6rem] rounded-full bg-blue-500 hover:scale-110"
                      title={`Connect ${btn.title || 'Button ' + (i + 1)}`}
                    />
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
                        <Handle
                          id={row.id}
                          type="source"
                          position={Position.Right}
                          className="!h-[0.6rem] !w-[0.6rem] rounded-full bg-blue-500 hover:scale-110"
                          title={`Connect ${row.title || `Button ${ri + 1}`}`}
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
      className="cursor-grab border-gray-200 bg-white shadow-sm transition-all hover:shadow-md active:cursor-grabbing active:opacity-80"
      draggable
      onDragStart={(e) => onDragStart(e, type)}
    >
      <CardContent className="flex items-center gap-3 p-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-blue-50 to-indigo-50 text-xl">{icon}</div>
        <div className="flex-1">
          <p className="inter text-sm font-medium text-gray-800">{label}</p>
        </div>
        <GripVertical className="h-4 w-4 text-gray-400" />
      </CardContent>
    </Card>
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

function buildFinalFromGraph(nodes, edges) {
  const byId = Object.fromEntries(nodes.map((n) => [n.id, n]));
  const metaById = Object.fromEntries(nodes.map((n) => [n.id, JSON.parse(JSON.stringify(n.data.meta || {}))]));

  // ✅ NEW: Collect unique global input variables from all Ask/Interactive nodes' storeVariable/variable
  const globalVars = new Set();
  nodes.forEach((n) => {
    const m = metaById[n.id] || {};
    if (n.type === NodeTypes.ASK || n.type === NodeTypes.INTERACTIVE) {
      const varName = (m.variable || '').trim();
      if (varName) globalVars.add(varName);
    }
  });
  const variables = Array.from(globalVars);

  const runtimeNodes = [];
  const triggers = [];

  // 🔗 Map connections (unchanged)
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

  // 🧩 Build node objects (unchanged, but now vars are global)
  for (const n of nodes) {
    const m = metaById[n.id] || {};

    if (n.type === NodeTypes.TRIGGER) {
      triggers.push({ keywords: m.keywords || [], start: m.startNext || null });
      continue;
    }

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
        selectedVars: m.selectedVars || [],
        variable: (m.variable || '').trim() || null,
      });
      continue;
    }

    if (n.type === NodeTypes.ASK) {
      runtimeNodes.push({
        id: n.id,
        type: 'ask_question',
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
        type: 'interactive_message',
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

  return {
    version: 2,
    variables,
    triggers,
    nodes: runtimeNodes,
  };
}

// Main Editor Shell
function EditorShell() {
  const [chatbotName, setChatbotName] = useState('My Chatbot');
  const [rfNodes, setRfNodes] = useState([]);
  const [rfEdges, setRfEdges] = useState([]);
  const [variables, setVariables] = useState([]); // ✅ Start empty—no static init
  const [leftOpen, setLeftOpen] = useState(true);

  const reactFlowWrapper = useRef(null);
  const { screenToFlowPosition } = useReactFlow();

  const updateGlobalVariables = useCallback((newVars) => {
    setVariables((prev) => {
      const merged = Array.from(new Set([...prev, ...newVars]));
      return merged;
    });

    // ✅ Force update ALL nodes' data.variables for immediate dropdown refresh
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

  const finalObject = useMemo(() => {
    const core = buildFinalFromGraph(rfNodes, rfEdges);
    return {
      chatbotName,
      ...core,
    };
  }, [rfNodes, rfEdges, chatbotName]);

  function removeNode(id) {
    setRfNodes((nds) => nds.filter((n) => n.id !== id));
    setRfEdges((eds) => eds.filter((e) => e.source !== id && e.target !== id));
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
          <ScrollArea className="w-84">
            <div>
              <Card className="border-0 bg-gradient-to-r from-gray-50 to-gray-100">
                <CardHeader className="flex flex-col gap-2 pb-3">
                  <div className="flex items-center gap-2">
                    <Zap className="h-5 w-5 text-indigo-600" />
                    <CardTitle className="text-lg text-gray-800">Chatbot Builder</CardTitle>
                  </div>
                  <Input
                    value={chatbotName}
                    onChange={(e) => setChatbotName(e.target.value)}
                    required
                    placeholder="Enter chatbot name (e.g., Dental Assistant)"
                    className="h-9 w-full border-gray-300 text-sm focus:border-indigo-500 focus:ring-indigo-500"
                  />
                </CardHeader>
              </Card>

              <Card className="border-0 shadow-sm">
                <CardHeader className="pb-2">
                  <CardTitle className="inter flex items-center gap-2 text-sm font-medium text-gray-700">
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
              <Card className="border-0 shadow-sm">
                <CardContent className="max-h-[40vh] overflow-auto">
                  <pre className="rounded-lg bg-gray-900 p-3 font-mono text-xs text-gray-100">{JSON.stringify(finalObject, null, 2)}</pre>
                </CardContent>
              </Card>
              <Button variant="outline" className="w-full bg-blue-500 text-white">
                Save Flow
              </Button>
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
