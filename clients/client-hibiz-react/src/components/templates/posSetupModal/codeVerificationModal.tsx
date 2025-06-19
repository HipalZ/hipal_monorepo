import { memo, useState } from "react"
import toast from "react-hot-toast"

interface CodeVerificationModalProps {
  onVerified: () => void
  onClose: () => void
}

const MemoCodeVerificationModal = ({ onVerified, onClose }: CodeVerificationModalProps) => {
  const [code, setCode] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    // Simulate verification delay
    setTimeout(() => {
      if (code === "2701") {
        toast.success("Code verified successfully!")
        onVerified()
      } else {
        toast.error("Invalid code. Please try again.")
      }
      setIsLoading(false)
    }, 500)
  }

  return (
    <div className="bg-white p-6 rounded-xl shadow-lg max-w-md mx-auto">
      <div className="text-center mb-6">
        <div className="w-16 h-16 mx-auto mb-4 bg-yellow-100 rounded-full flex items-center justify-center">
          <svg className="w-8 h-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
            />
          </svg>
        </div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">Verification Required</h2>
        <p className="text-gray-600">Please enter the verification code to edit POS configuration</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="code" className="block text-sm font-medium text-gray-700 mb-2">
            Verification Code
          </label>
          <input
            type="text"
            id="code"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="Enter 4-digit code"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-center text-lg font-mono"
            maxLength={4}
            required
          />
        </div>

        <div className="flex gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isLoading || code.length !== 4}
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isLoading ? "Verifying..." : "Verify"}
          </button>
        </div>
      </form>
    </div>
  )
}

const CodeVerificationModal = memo(MemoCodeVerificationModal)
export default CodeVerificationModal
