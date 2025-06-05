import { memo, useCallback, useState } from "react";
import { Eye, EyeOff, Lock } from "lucide-react";
import { usePasswordStore } from "@/components/store/usePasswordStore.ts";

interface PasswordModalProps {
  onVerify: (isCorrect: boolean) => void;
  onClose: () => void;
  isOpen: boolean;
}

const PasswordModal = memo(
  ({ onVerify, onClose, isOpen }: PasswordModalProps) => {
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const verifyPassword = usePasswordStore((state) => state.verifyPassword);

    const handlePasswordChange = useCallback(
      (e: React.ChangeEvent<HTMLInputElement>) => {
        setPassword(e.target.value);
        if (error) setError("");
      },
      [error],
    );

    const handleTogglePassword = useCallback(() => {
      setShowPassword((prev) => !prev);
    }, []);

    const handleVerify = useCallback(async () => {
      if (!password.trim()) {
        setError("Please enter password");
        return;
      }

      setIsLoading(true);

      setTimeout(() => {
        const isCorrect = verifyPassword(password);

        if (isCorrect) {
          onVerify(true);
          onClose();
          setPassword("");
          setError("");
        } else {
          setError("Password is wrong. Please try again.");
          setPassword("");
        }

        setIsLoading(false);
      }, 300);
    }, [password, verifyPassword, onVerify, onClose]);

    const handleKeyPress = useCallback(
      (e: React.KeyboardEvent) => {
        if (e.key === "Enter") {
          handleVerify();
        }
      },
      [handleVerify],
    );

    const handleClose = useCallback(() => {
      setPassword("");
      setError("");
      onClose();
    }, [onClose]);

    if (!isOpen) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg p-6 w-full max-w-md">
          <div className="flex items-center gap-3 mb-4">
            <Lock className="w-6 h-6 text-blue-600" />
            <h2 className="text-xl font-semibold text-gray-800">
              Enter Password
            </h2>
          </div>

          <p className="text-gray-600 mb-6">
            Please enter the password to view phone number
          </p>

          <div className="relative mb-4">
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={handlePasswordChange}
              onKeyPress={handleKeyPress}
              placeholder="Enter password"
              className={`w-full px-4 py-3 pr-12 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                error ? "border-red-500" : "border-gray-300"
              }`}
              disabled={isLoading}
              autoFocus
            />
            <button
              type="button"
              onClick={handleTogglePassword}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
              disabled={isLoading}
            >
              {showPassword ? (
                <EyeOff className="w-5 h-5" />
              ) : (
                <Eye className="w-5 h-5" />
              )}
            </button>
          </div>

          {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

          <div className="flex gap-3">
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              disabled={isLoading}
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleVerify}
              disabled={isLoading}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {isLoading ? "Verifying..." : "Verify"}
            </button>
          </div>
        </div>
      </div>
    );
  },
);

PasswordModal.displayName = "PasswordModal";

export default PasswordModal;
