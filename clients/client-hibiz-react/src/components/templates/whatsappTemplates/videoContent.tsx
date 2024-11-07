import useWhatsapp, { HeaderInterface } from "@/components/store/useWhatsapp";
import { memo, useCallback, useState } from "react";
import { BiPlus, BiX } from "react-icons/bi";

const MemoVideoContent = () => {
  const { setHeaderType, videoPreview, setVideoPreview } = useWhatsapp((s) => ({
    setHeaderType: s.setHeaderType,
    videoPreview: s.videoPreview,
    setVideoPreview: s.setVideoPreview,
  }));

  const [videoName, setVideoName] = useState<string>("");

  const handleVideoUpload = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        setHeaderType(HeaderInterface.Video);
        setVideoPreview(URL.createObjectURL(file));
        setVideoName(file.name);
      }
    },
    [setHeaderType, setVideoPreview],
  );

  const handleRemoveVideo = useCallback(() => {
    setVideoPreview("");
    setVideoName("");
    setHeaderType(HeaderInterface.Video);
  }, [setHeaderType, setVideoPreview]);

  return (
    <>
      <h2 className="mb-1 text-xl font-semibold">Content</h2>
      <label
        htmlFor="headerVideo"
        className="block mb-2 text-xs font-medium text-gray-600"
      >
        Choose Video (optional)
      </label>
      <div className="p-4 mb-4 bg-white rounded-lg w-72">
        <div className="relative w-64 h-48 border-2 border-gray-300 border-dashed rounded-lg">
          <input
            type="file"
            id="headerVideo"
            className="absolute inset-0 z-10 w-full h-full opacity-0 cursor-pointer"
            accept="video/*"
            onChange={handleVideoUpload}
          />
          {videoPreview ? (
            <div className="relative w-full h-full">
              <video
                src={videoPreview}
                className="object-cover w-full h-full rounded-lg"
                controls
              />
              <button
                type="button"
                className="absolute p-1 m-2 text-white bg-black rounded-full -top-4 -right-4 hover:bg-gray-700"
                onClick={handleRemoveVideo}
              >
                <BiX className="w-4 h-4" />
              </button>
              <p className="mt-2 text-sm text-gray-600 truncate">{videoName}</p>
            </div>
          ) : (
            <div className="flex items-center justify-center w-full h-full">
              <div className="text-center">
                <BiPlus className="w-12 h-12 mx-auto text-gray-400" />
                <p className="mt-2 text-sm text-gray-600">
                  Click to upload video
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

const VideoContent = memo(MemoVideoContent);
export default VideoContent;
