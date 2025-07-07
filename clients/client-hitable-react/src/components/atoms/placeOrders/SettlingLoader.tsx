
import { useEffect, useState } from "react"
import { CheckCircle, Clock, CreditCard } from "lucide-react"
import * as React from "react"

interface SettlingLoaderProps {
  isVisible: boolean
  message?: string
}

export function SettlingLoader({ isVisible, message = "Settling table, please wait..." }: SettlingLoaderProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [showSuccess, setShowSuccess] = useState(false)

  const steps = [
    { icon: CreditCard, text: "Processing payment..." },
    { icon: Clock, text: "Updating records..." },
    { icon: CheckCircle, text: "Almost done..." },
  ]

  useEffect(() => {
    if (!isVisible) {
      setCurrentStep(0)
      setShowSuccess(false)
      return
    }

    const interval = setInterval(() => {
      setCurrentStep((prev) => {
        if (prev < steps.length - 1) {
          return prev + 1
        }
        return prev
      })
    }, 1500)

    return () => clearInterval(interval)
  }, [isVisible, steps.length])

  if (!isVisible) return null

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="bg-white rounded-2xl p-8 max-w-sm w-full mx-4 shadow-2xl">
        {/* Main Animation Container */}
        <div className="flex flex-col items-center space-y-6">
          {/* Animated Circle with Icon */}
          <div className="relative">
            {/* Outer rotating ring */}
            <div className="w-20 h-20 border-4 border-blue-100 rounded-full animate-spin">
              <div className="w-full h-full border-4 border-transparent border-t-blue-500 rounded-full animate-pulse"></div>
            </div>

            {/* Inner pulsing circle */}
            <div className="absolute inset-2 bg-blue-50 rounded-full flex items-center justify-center animate-pulse">
              <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center animate-bounce">
                {React.createElement(steps[currentStep]?.icon || Clock, {
                  className: "w-4 h-4 text-white",
                })}
              </div>
            </div>

            {/* Floating dots */}
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full animate-ping"></div>
            <div className="absolute -bottom-1 -left-1 w-2 h-2 bg-yellow-400 rounded-full animate-ping delay-300"></div>
            <div className="absolute top-1/2 -left-2 w-2 h-2 bg-purple-400 rounded-full animate-ping delay-700"></div>
          </div>

          {/* Progress Steps */}
          <div className="flex space-x-2">
            {steps.map((_, index) => (
              <div
                key={index}
                className={`h-2 w-8 rounded-full transition-all duration-500 ${
                  index <= currentStep ? "bg-blue-500 scale-110" : "bg-gray-200"
                }`}
              />
            ))}
          </div>

          {/* Dynamic Text */}
          <div className="text-center space-y-2">
            <h3 className="text-xl font-semibold text-gray-800 animate-pulse">{message}</h3>
            <p className="text-sm text-gray-600 transition-all duration-500">{steps[currentStep]?.text}</p>
          </div>

          {/* Animated Progress Bar */}
          <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-blue-500 to-green-500 rounded-full transition-all duration-1000 ease-out"
              style={{
                width: `${((currentStep + 1) / steps.length) * 100}%`,
                animation: "shimmer 2s infinite",
              }}
            />
          </div>

          {/* Floating Elements */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-2xl">
            <div className="absolute top-4 left-4 w-1 h-1 bg-blue-400 rounded-full animate-ping delay-1000"></div>
            <div className="absolute top-8 right-6 w-1 h-1 bg-green-400 rounded-full animate-ping delay-1500"></div>
            <div className="absolute bottom-6 left-8 w-1 h-1 bg-purple-400 rounded-full animate-ping delay-2000"></div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
        
        .animate-shimmer {
          background: linear-gradient(90deg, #3b82f6 0%, #10b981 50%, #3b82f6 100%);
          background-size: 200% 100%;
          animation: shimmer 2s infinite;
        }
      `}</style>
    </div>
  )
}
