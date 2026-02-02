import whatzAppDoodle from '@/assets/whatzapp/whatsappdoodle.jpg';
import useBusinessData from '@/components/store/useBusinessData';
import { useOwnerLogin } from '@/components/store/useOwnerLogin';
import { useWhatsappTempStore } from '@/components/store/useWhatsappTempStore';
import { useMediaUpload, useSendWhatsappMessage } from '@/hooks/useTemplates';
import { lazy, memo, useCallback, useMemo, useRef, useState } from 'react';
import toast from 'react-hot-toast';
import { BiLoaderAlt, BiPlus, BiSend, BiX } from 'react-icons/bi';
import { MdAttachFile, MdImage, MdVideocam } from 'react-icons/md';

const ChatsList = lazy(() => import('./chatsList'));
const ChatHistory = lazy(() => import('./chatHistory'));

const MemoWhatsappChats = () => {
  const ownerId = useOwnerLogin((s) => s.user?._id);
  const businessId = useBusinessData((s) => s.businessData?._id);
  const message = useWhatsappTempStore((s) => s.message);
  const setMessage = useWhatsappTempStore((s) => s.setMessage);
  const selectedUser = useWhatsappTempStore((s) => s.selectedUser);
  const isMobileListView = useWhatsappTempStore((s) => s.isMobileListView);

  const { mutate: sendMessageToWhatsApp, isPending } = useSendWhatsappMessage();
  const { uploadMediaPassFile, isUploading } = useMediaUpload();

  const [showAttachMenu, setShowAttachMenu] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [mediaType, setMediaType] = useState<'image' | 'video' | 'document' | 'text'>('text');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isSessionExpired = useMemo(() => {
    if (!selectedUser?.lastUserMessageAt) return true;
    const twentyFourHours = 24 * 60 * 60 * 1000;
    return Date.now() - selectedUser.lastUserMessageAt > twentyFourHours;
  }, [selectedUser?.lastUserMessageAt]);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.size > 4 * 1024 * 1024) {
      toast.error('File size cannot exceed 4MB');
      return;
    }

    if (file) {
      setSelectedFile(file);
      setShowAttachMenu(false);
    }
  }, []);

  const triggerFileSelect = useCallback((type: 'image' | 'video' | 'document') => {
    setMediaType(type);
    if (fileInputRef.current) {
      if (type === 'image') fileInputRef.current.accept = 'image/*';
      else if (type === 'video') fileInputRef.current.accept = 'video/*';
      else fileInputRef.current.accept = '.pdf,.doc,.docx,.txt';
      fileInputRef.current.click();
    }
  }, []);

  const clearSelection = useCallback(() => {
    setSelectedFile(null);
    setMediaType('text');
    if (fileInputRef.current) fileInputRef.current.value = '';
  }, []);

  const sendMessage = useCallback(async () => {
    if (!selectedUser) {
      toast.error('Select a user to send a message');
      return;
    }

    if (!message.trim() && !selectedFile) {
      return;
    }

    let mediaUrl = '';

    if (selectedFile) {
      try {
        const uploadRes = await uploadMediaPassFile(selectedFile);
        mediaUrl = uploadRes.url;
      } catch (error) {
        toast.error('Failed to upload file');
        return;
      }
    }

    const payload = {
      ownerId,
      businessId,
      text: message,
      userId: selectedUser._id,
      isOwner: true,
      phoneNumber: selectedUser.phone,
      type: mediaType,
      mediaUrl: mediaUrl || undefined,
      caption: message,
      filename: selectedFile?.name,
    };
    sendMessageToWhatsApp(payload);
    setMessage('');
    clearSelection();
  }, [businessId, clearSelection, mediaType, message, ownerId, selectedFile, selectedUser, sendMessageToWhatsApp, setMessage, uploadMediaPassFile]);

  const handleMessageChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setMessage(e.target.value);
    },
    [setMessage],
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key !== 'Enter' || (message.trim()?.length === 0 && !selectedFile)) return null;
      sendMessage();
    },
    [message, sendMessage, selectedFile],
  );

  return (
    <section className="relative flex h-[85dvh] rounded-lg bg-gray-100 shadow-lg">
      {/* Sidebar */}
      <div className={`md:flex ${isMobileListView ? 'flex w-full' : 'hidden'}`}>
        <ChatsList />
      </div>

      {/* Main Chat Area */}
      <div className={`flex flex-1 flex-col ${!isMobileListView ? 'flex' : 'hidden md:flex'}`}>
        {selectedUser === null ? (
          <center
            style={{
              backgroundImage: `url(${whatzAppDoodle})`,
            }}
            className="flex h-full w-full items-center justify-center text-2xl"
          >
            Select a user to start chatting
          </center>
        ) : (
          <>
            <ChatHistory isPending={isPending} />
            <footer key={selectedUser.lastUserMessageAt} className="flex flex-col gap-2 rounded-lg bg-gray-50 p-4">
              {isSessionExpired ? (
                <div className="flex flex-col items-center justify-center gap-2 rounded-lg border border-yellow-200 bg-yellow-50 p-4 text-center">
                  <p className="text-sm font-medium text-yellow-800">The 24-hour service window has expired.</p>
                  <p className="text-xs text-yellow-700">Please send a template message to initiate a new conversation.</p>
                </div>
              ) : (
                <>
                  {selectedFile && (
                    <div className="flex items-center gap-2 rounded border border-gray-200 bg-white p-2 shadow-sm">
                      <div className="flex-1">
                        <p className="truncate text-sm font-medium text-gray-700">{selectedFile.name}</p>
                      </div>
                      <button type="button" onClick={clearSelection} className="p-1 text-gray-400 hover:text-red-500">
                        <BiX size={20} />
                      </button>
                    </div>
                  )}
                  <div className="relative flex items-center gap-2">
                    <div className="relative">
                      <button
                        type="button"
                        onClick={() => setShowAttachMenu(!showAttachMenu)}
                        className="rounded-full bg-gray-200 p-2 hover:bg-gray-300"
                      >
                        <BiPlus className="text-gray-600" size={24} />
                      </button>
                      {showAttachMenu && (
                        <div className="absolute bottom-full left-0 z-20 mb-2 flex flex-col gap-2 rounded-lg bg-white p-2 shadow-xl">
                          <button
                            type="button"
                            onClick={() => triggerFileSelect('image')}
                            className="flex items-center gap-2 rounded p-2 hover:bg-gray-100"
                          >
                            <MdImage className="text-purple-500" size={20} />
                            <span>Image</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => triggerFileSelect('video')}
                            className="flex items-center gap-2 rounded p-2 hover:bg-gray-100"
                          >
                            <MdVideocam className="text-red-500" size={20} />
                            <span>Video</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => triggerFileSelect('document')}
                            className="flex items-center gap-2 rounded p-2 hover:bg-gray-100"
                          >
                            <MdAttachFile className="text-blue-500" size={20} />
                            <span>Document</span>
                          </button>
                        </div>
                      )}
                      <input type="file" ref={fileInputRef} className="hidden" onChange={handleFileSelect} />
                    </div>

                    <input
                      type="text"
                      value={message}
                      onChange={handleMessageChange}
                      onKeyDown={handleKeyDown}
                      placeholder={selectedFile ? 'Add a caption...' : `Message ${selectedUser ? selectedUser.name : 'Select a User'}`}
                      className="flex-1 rounded-lg border bg-white px-2 py-1 focus:ring-2 focus:ring-green-500"
                    />
                    <button
                      type="button"
                      onClick={sendMessage}
                      disabled={(!message.trim() && !selectedFile) || isPending || isUploading}
                      className="rounded-full bg-green-100 p-2 hover:bg-green-200 disabled:opacity-50"
                    >
                      {isPending || isUploading ? (
                        <BiLoaderAlt className="animate-spin text-green-700" size={24} />
                      ) : (
                        <BiSend className="text-green-700" size={24} />
                      )}
                    </button>
                  </div>
                </>
              )}
            </footer>
          </>
        )}
      </div>
    </section>
  );
};

const WhatsappChats = memo(MemoWhatsappChats);
export default WhatsappChats;
