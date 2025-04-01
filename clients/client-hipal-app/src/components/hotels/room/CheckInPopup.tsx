import { KeyRound, MessageSquare, AlertCircle, Utensils, Bell, Wifi, Coffee } from "lucide-react";
import Image from "next/image"
import { Card, CardContent } from "@/components/ui/card"
import { motion } from "framer-motion"

interface CheckInPopupProps {
    hotelName: string
    logo: string
    verificationCode: string
    handleCodeChange: (e: React.ChangeEvent<HTMLInputElement>) => void
    codeError: string

}

const CheckInPopup = ({codeError,handleCodeChange,hotelName,logo,verificationCode}:CheckInPopupProps) => {
  return (
    <Card className="mx-auto">
    <CardContent className="p-0">
        {/* Logo and Welcome Section */}
        <div className="px-6 pt-6 pb-4 rounded-t-lg bg-gradient-to-b from-blue-50 to-white">
            <div className="flex justify-center mb-4">
                <Image src={logo || ""} alt={`${hotelName} Logo`} width={120} height={120} className="object-contain" />
            </div>

            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                <h2 className="mb-2 text-2xl font-bold text-center text-blue-800">Welcome to {hotelName}</h2>
                <p className="mb-4 text-center text-blue-600">We're delighted to have you as our guest</p>
            </motion.div>
        </div>
        <div className="px-6">
            <div className="flex items-center justify-center gap-2 p-3 mb-6 text-sm text-gray-500 rounded-lg bg-gray-50">
                <MessageSquare className="flex-shrink-0 w-4 h-4" />
                <p className="font-semibold opacity-80">The code was sent to you via WhatsApp. If you haven't received it, please contact the reception.</p>
            </div>

            <div className="mb-6">
                <div className="relative">
                    <KeyRound className="absolute text-gray-400 transform -translate-y-1/2 left-4 top-1/2" />
                    <input
                        type="text"
                        value={verificationCode}
                        onChange={handleCodeChange}
                        placeholder="Enter 4-digit code"
                        className="w-full p-3 pl-12 text-xl font-bold tracking-widest text-center text-black border-2 border-gray-300 rounded-md focus:border-blue-500 focus:outline-none"
                        maxLength={4}
                    />
                </div>
                {codeError && (
                    <p className="flex items-center justify-center gap-1 mt-2 text-sm text-red-500">
                        <AlertCircle className="w-4 h-4" />
                        {codeError}
                    </p>
                )}
            </div>
        </div>
        {/* Services Preview */}
        <div className="px-6 pb-4 bg-base-100">
            <h3 className="mb-3 text-lg font-semibold text-gray-800">Your stay includes:</h3>

            <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="flex items-center gap-2 text-gray-700">
                    <Wifi className="w-4 h-4 text-blue-500" />
                    <span className="text-sm">High-Speed WiFi</span>
                </div>
                <div className="flex items-center gap-2 text-gray-700">
                    <Utensils className="w-4 h-4 text-blue-500" />
                    <span className="text-sm">Room Service</span>
                </div>
                <div className="flex items-center gap-2 text-gray-700">
                    <Bell className="w-4 h-4 text-blue-500" />
                    <span className="text-sm">24/7 Assistance</span>
                </div>
                <div className="flex items-center gap-2 text-gray-700">
                    <Coffee className="w-4 h-4 text-blue-500" />
                    <span className="text-sm">Breakfast</span>
                </div>
            </div>

            <p className="text-sm italic text-center">
                Verify your room to unlock all services and amenities
            </p>
        </div>

        {/* Verification Section */}
       
    </CardContent>
</Card>
  )
}

export default CheckInPopup
