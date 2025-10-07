import { memo, useMemo } from "react";

export interface BottomActionBarProps {
  onReject: () => void;
  onConfirm: () => void;
  rejectText?: string;
  confirmText?: string;
  maxWidth?: string;
  className?: string;
}

const BottomActionBarComponent = ({
  onReject,
  onConfirm,
  rejectText = "Reject",
  confirmText = "Confirm",
  maxWidth = "30rem",
  className = "",
}: BottomActionBarProps) => {
  const buttons = useMemo(
    () => [
      {
        key: "reject",
        text: rejectText,
        onClick: onReject,
        className:
          "flex-1 bg-red-600 hover:bg-red-700 text-white py-3 rounded-lg font-medium",
      },
      {
        key: "confirm",
        text: confirmText,
        onClick: onConfirm,
        className:
          "flex-1 bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg font-medium",
      },
    ],
    [rejectText, confirmText, onReject, onConfirm],
  );

  return (
    <div
      className={`fixed bottom-0 z-20 w-full bg-white border-t border-gray-200 p-4 ${className}`}
      style={{ maxWidth }}
    >
      <div className="flex gap-4">
        {buttons.map((btn) => (
          <button
            key={btn.key}
            type="button"
            onClick={btn.onClick}
            className={btn.className}
          >
            {btn.text}
          </button>
        ))}
      </div>
    </div>
  );
};

export const BottomActionBar = memo(BottomActionBarComponent);
export default BottomActionBar;
