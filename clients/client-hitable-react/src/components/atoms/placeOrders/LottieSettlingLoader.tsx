
import { useEffect, useState } from "react"
import { CheckCircle2, CreditCard, Clock, Utensils } from "lucide-react"
import * as React from "react"

interface LottieSettlingLoaderProps {
  isVisible: boolean
  message?: string
  onComplete?: () => void
}

export function LottieSettlingLoader({
  isVisible,
  message = "Settling your table...",
  onComplete,
}: LottieSettlingLoaderProps) {
  const [progress, setProgress] = useState(0)
  const [currentPhase, setCurrentPhase] = useState(0)

  const phases = [
    { icon: CreditCard, text: "Processing payment", color: "text-blue-500" },
    { icon: Clock, text: "Updating records", color: "text-orange-500" },
    { icon: Utensils, text: "Clearing table", color: "text-green-500" },
    { icon: CheckCircle2, text: "Settlement complete", color: "text-emerald-500" },
  ]

  useEffect(() => {
    if (!isVisible) {
      setProgress(0)
      setCurrentPhase(0)
      return
    }

    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          onComplete?.()
          return 100
        }
        return prev + 2
      })
    }, 100)

    const phaseInterval = setInterval(() => {
      setCurrentPhase((prev) => {
        if (prev < phases.length - 1) {
          return prev + 1
        }
        return prev
      })
    }, 3000)

    return () => {
      clearInterval(progressInterval)
      clearInterval(phaseInterval)
    }
  }, [isVisible, onComplete, phases.length])

  if (!isVisible) return null

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-black/60 to-black/40 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <div className="bg-white/95 backdrop-blur-sm rounded-3xl p-8 max-w-md w-full shadow-2xl border border-white/20">
        {/* Header */}
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">{message}</h2>
          <p className="text-gray-600">Please don't close this window</p>
        </div>

        {/* Main Animation */}
        <div className="flex flex-col items-center space-y-8">
          {/* Circular Progress with Icon */}
          <div className="relative w-32 h-32">
            {/* Background Circle */}
            <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 120 120">
              <circle cx="60" cy="60" r="50" stroke="#e5e7eb" strokeWidth="8" fill="none" />
              <circle
                cx="60"
                cy="60"
                r="50"
                stroke="url(#gradient)"
                strokeWidth="8"
                fill="none"
                strokeLinecap="round"
                strokeDasharray={`${2 * Math.PI * 50}`}
                strokeDashoffset={`${2 * Math.PI * 50 * (1 - progress / 100)}`}
                className="transition-all duration-300 ease-out"
              />
              <defs>
                <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#3b82f6" />
                  <stop offset="50%" stopColor="#8b5cf6" />
                  <stop offset="100%" stopColor="#10b981" />
                </linearGradient>
              </defs>
            </svg>

            {/* Center Icon */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="bg-white rounded-full p-4 shadow-lg animate-pulse">
                {React.createElement(phases[currentPhase].icon, {
                  className: `w-8 h-8 ${phases[currentPhase].color} transition-colors duration-500`,
                })}
              </div>
            </div>

            {/* Progress Percentage */}
            <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2">
              <span className="text-sm font-semibold text-gray-700 bg-white px-2 py-1 rounded-full shadow">
                {Math.round(progress)}%
              </span>
            </div>
          </div>

          {/* Phase Indicator */}
          <div className="text-center space-y-2">
            <p className={`text-lg font-medium transition-colors duration-500 ${phases[currentPhase].color}`}>
              {phases[currentPhase].text}
            </p>
            <div className="flex justify-center space-x-2">
              {phases.map((_, index) => (
                <div
                  key={index}
                  className={`w-2 h-2 rounded-full transition-all duration-500 ${
                    index <= currentPhase ? "bg-blue-500 scale-125" : "bg-gray-300"
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Animated Elements */}
          <div className="flex justify-center space-x-4">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className="w-3 h-3 bg-blue-400 rounded-full animate-bounce"
                style={{ animationDelay: `${i * 0.2}s` }}
              />
            ))}
          </div>
        </div>

        {/* Bottom Message */}
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-500">🔒 Secure transaction in progress</p>
        </div>
      </div>
    </div>
  )
}
