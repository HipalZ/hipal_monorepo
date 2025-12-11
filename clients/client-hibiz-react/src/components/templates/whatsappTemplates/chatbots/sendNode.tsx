import StoreVariable from '@/components/templates/whatsappTemplates/chatbots/storeVariable';
import type { SendNodeMeta, SendNodeProps } from '@/components/templates/whatsappTemplates/chatbots/types';
import { VariableDropdown } from '@/components/templates/whatsappTemplates/chatbots/variableDropDown';
import DeleteButton from '@/components/templates/whatsappTemplates/deleteButton';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/components/utils/helper';
import { useMediaUpload } from '@/hooks/useTemplates';
import { Handle, Position } from '@xyflow/react';
import { FileText, FileUp, ImageIcon, MessageCircle, Trash2, Upload } from 'lucide-react';
import { useRef, useState } from 'react';
import toast from 'react-hot-toast';

export function SendNode({ data, selected }: SendNodeProps) {
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
  const textRef = useRef<HTMLTextAreaElement>(null);
  const [uploading, setUploading] = useState<boolean>(false);
  const [uploadProgress, setUploadProgress] = useState<number>(0);

  const { uploadMediaPassFile } = useMediaUpload();

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

  const handleContentTypeChange = (value: SendNodeMeta['contentType']) => {
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
              {data?.variables?.length > 0 && (
                <VariableDropdown
                  value={null}
                  onChange={insertVariable}
                  variables={data?.variables || []} // Non-prefixed (e.g., userName)
                  flowParams={data?.variables.map((v) => `@${v}`)} // Prefixed (e.g., @userName)
                  placeholder="Insert variable..."
                />
              )}
              <div className="space-y-1.5">
                <label className="flex items-center gap-2 text-xs font-medium text-gray-700">
                  <FileText className="h-3 w-3 text-emerald-600" />
                  Message Text
                </label>
                <div className="relative">
                  <Textarea
                    ref={textRef}
                    value={m.text || ''}
                    onChange={(e) => updateMetaField('text', e.target.value)}
                    placeholder="Type your message"
                    className="min-h-[80px] resize-none border-gray-300 text-sm transition-colors placeholder:text-gray-400 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/50"
                    rows={3}
                    aria-describedby="text-help"
                    maxLength={1024}
                  />
                  <div aria-hidden className="absolute bottom-2 right-3 select-none text-xs text-gray-500">
                    {(m.text || '').length} / 1024
                  </div>
                </div>
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
                    aria-label="Upload image file"
                    className="group relative flex h-12 cursor-pointer items-center justify-center gap-2 rounded-lg border-2 border-dashed border-gray-300 bg-gradient-to-r from-gray-100 to-gray-200 text-xs text-gray-700 transition-all hover:from-emerald-50 hover:to-emerald-100 hover:text-emerald-600"
                  >
                    <Upload className="h-4 w-4" />
                    <input
                      type="file"
                      accept="image/jpeg, image/png"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        handleUpload(file, 'image');
                      }}
                      disabled={uploading}
                    />
                    {uploading ? 'Uploading...' : 'Click to upload image'}
                  </label>
                  <span className="text-xs">*Max Upload size is 5MB (jpeg/png)</span>
                  {uploading && (
                    <div className="h-1.5 w-full rounded-full bg-gray-200">
                      <div className="h-1.5 rounded-full bg-emerald-600 transition-all duration-300" style={{ width: `${uploadProgress}%` }} />
                    </div>
                  )}
                  {m.mediaUrl && !uploading && (
                    <div className="relative">
                      <img src={m.mediaUrl} alt="Uploaded" className="h-full w-full rounded-lg border object-cover shadow-sm" />
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
                <div className="relative">
                  <Textarea
                    value={m.caption || ''}
                    onChange={(e) => updateMetaField('caption', e.target.value)}
                    placeholder="Describe the image for better context..."
                    className="text-sm transition-colors focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/50"
                    maxLength={1024}
                  />
                  <div aria-hidden className="absolute bottom-2 right-3 select-none text-xs text-gray-500">
                    {(m.caption || '').length} / 1024
                  </div>
                </div>
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
                    <span>{uploading ? `Uploading... ${uploadProgress}%` : 'Click to select document'}</span>
                    <input
                      type="file"
                      accept=".pdf,.doc,.docx,.txt,.xls,.xlsx,.ppt,.pptx"
                      className="hidden"
                      onChange={(e) => handleUpload(e.target.files?.[0], 'document')}
                      disabled={uploading}
                    />
                  </label>
                  <span className="text-[0.65rem]">*Max Upload size is 5MB ( pdf, doc, docx, txt, xls, xlsx, ppt, pptx)</span>
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
                  File Name (Optional)
                </label>
                <Input
                  value={m.fileName || ''}
                  onChange={(e) => updateMetaField('fileName', e.target.value)}
                  placeholder="document.pdf"
                  maxLength={24}
                  className="text-sm transition-colors focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/50"
                />
              </div>

              <div className="space-y-1">
                <label className="flex items-center gap-2 text-xs font-medium text-gray-700">
                  <FileUp className="h-3 w-3 text-emerald-600" />
                  Caption (Optional)
                </label>
                <div className="relative">
                  <Textarea
                    value={m.caption || ''}
                    placeholder="Enter caption about file"
                    onChange={(e) => updateMetaField('caption', e.target.value)}
                    className="text-sm transition-colors focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/50"
                    maxLength={1024}
                  />
                  <div aria-hidden className="absolute bottom-2 right-3 select-none text-xs text-gray-500">
                    {(m.caption || '').length} / 1024
                  </div>
                </div>
              </div>
            </div>
          )}
          {/* Response Variable */}
          <StoreVariable data={data} />
        </CardContent>
      </Card>

      <Handle type="source" position={Position.Right} className="z-50 !h-[0.75rem] !w-[0.75rem] bg-gray-400" />
    </div>
  );
}
