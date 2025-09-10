import { useScreenSize } from "@/hooks/useScreenSize";

export function ScreenDisclaimer() {
  const screenSize = useScreenSize();
  const isSmallScreen = screenSize === "xs" || screenSize === "sm";
  if (!isSmallScreen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-sm m-4 text-center animate-fade-in-scale-up">
        {/* SVG Icon */}
        <div className="mx-auto mb-4 w-20 h-20 text-indigo-500">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M9 17.25v1.007a3 3 0 01-.879 2.122L7.5 21h9l-.621-.621A3 3 0 0115 18.257V17.25m6-12V15a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 15V5.25A2.25 2.25 0 015.25 3h9.75a2.25 2.25 0 012.25 2.25z"
            />
          </svg>
        </div>

        {/* Heading */}
        <h2 className="text-xl font-bold text-slate-800 mb-2">
          Best on a Larger Screen
        </h2>

        {/* Text */}
        <p className="text-sm text-slate-600">
          This feature uses drag & drop, which is designed for tablets and
          desktops. Please switch to a larger device to continue.
        </p>
      </div>
    </div>
  );
}
