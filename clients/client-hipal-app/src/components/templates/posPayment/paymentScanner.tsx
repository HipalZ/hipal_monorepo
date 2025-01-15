'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { type IDetectedBarcode, Scanner } from '@yudiel/react-qr-scanner'
import { motion, AnimatePresence } from 'framer-motion'
import { Camera, X, ArrowLeft, Loader2, QrCode, Table } from 'lucide-react'

type ScanType = 'order' | 'payment'

export default function ScanPage() {
    const router = useRouter()
    const [scanning, setScanning] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [scannedData, setScannedData] = useState<string | null>(null)

    // This would come from your route/props in real implementation
    const scanType: ScanType = 'order' // or 'payment'

    const handleDecode = useCallback(
        (detectedCodes: IDetectedBarcode[]) => {
            if (!detectedCodes || detectedCodes.length === 0) {
                return;
            }
            let result = detectedCodes[0].rawValue;
            console.log("QR Scanner Result:", result);

            // Ensure the URL is absolute
            if (!result.startsWith("http://") && !result.startsWith("https://")) {
                result = `https://${result}`;
            }

            window.location.href = result;
            setScannedData(result[0].rawValue)
            setScanning(false)
        },
        [router]
    )

    const handleError = useCallback((error: any) => {
        setError('Unable to access camera. Please check permissions.')
        console.error('Scanner Error:', error)
    }, [])

    const restartScan = () => {
        setScanning(true)
        setError(null)
        setScannedData(null)
    }

    const getScanInfo = (type: ScanType) => ({
        order: {
            title: 'Scan Table',
            description: 'Point camera at table QR code',
            steps: [
                { icon: Table, text: 'Locate table QR' },
                { icon: Camera, text: 'Scan code' },
                { icon: Loader2, text: 'Loading menu' }
            ]
        },
        payment: {
            title: 'Scan to Pay',
            description: 'Scan the QR code from your captain',
            steps: [
                { icon: QrCode, text: 'Get QR from captain' },
                { icon: Camera, text: 'Scan code' },
                { icon: Loader2, text: 'Processing' }
            ]
        }
    })[type]

    const scanInfo = getScanInfo(scanType)

    return (
        <div className="min-h-screen bg-slate-950 text-white">
            {/* Header */}
            {/* <header className="px-4 py-2 flex items-center justify-between">
                <motion.button
                    onClick={() => router.back()}
                    className="p-2 rounded-full hover:bg-white/10 transition-colors"
                    whileTap={{ scale: 0.95 }}
                >
                    <ArrowLeft className="w-6 h-6" />
                </motion.button>
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-lg font-medium"
                >
                    {scanInfo.title}
                </motion.div>
                <div className="w-10" />
            </header> */}
            {/* Main Content */}
            <main className="max-w-md mx-auto p-4">
                <AnimatePresence mode="wait">
                    {scanning ? (
                        <motion.div
                            key="scanner"
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            className="space-y-6"
                        >
                            {/* Scanner */}
                            <div className="relative aspect-square rounded-3xl overflow-hidden bg-black/20 backdrop-blur-xl border border-white/10">
                                {error ? (
                                    <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center gap-4">
                                        <X className="w-12 h-12 text-red-500" />
                                        <p className="text-red-400">{error}</p>
                                        <button
                                            onClick={restartScan}
                                            onKeyDown={restartScan}
                                            type="button"
                                            className="px-4 py-2 bg-white/10 rounded-full hover:bg-white/20 transition-colors"
                                        >
                                            Try Again
                                        </button>
                                    </div>
                                ) : (
                                    <Scanner
                                        onScan={handleDecode}
                                        onError={handleError}
                                        constraints={{ facingMode: 'environment' }}
                                        components={{ zoom: true, torch: true }}
                                        styles={{
                                            container: { width: '100%', height: '100%' },
                                            video: { borderRadius: '24px' },
                                            finderBorder: 4,
                                        }}
                                    />
                                )}
                            </div>

                            {/* Instructions */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="space-y-6 text-center"
                            >
                                <div className="space-y-2">
                                    <h2 className="text-xl font-semibold">{scanInfo.title}</h2>
                                    <p className="text-gray-400">{scanInfo.description}</p>
                                </div>

                                <div className="grid grid-cols-3 gap-4 px-4 py-2 rounded-2xl bg-white/5">
                                    {scanInfo.steps.map((step, i) => (
                                        <div key={i} className="flex flex-col items-center gap-2">
                                            <step.icon className="w-6 h-6 text-gray-400" />
                                            <p className="text-xs text-gray-400">{step.text}</p>
                                        </div>
                                    ))}
                                </div>
                            </motion.div>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="success"
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            className="text-center space-y-4"
                        >
                            <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                className="w-20 h-20 mx-auto bg-green-500 rounded-full flex items-center justify-center"
                            >
                                <motion.div
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    transition={{ delay: 0.2 }}
                                    className="text-3xl"
                                >
                                    ✓
                                </motion.div>
                            </motion.div>
                            <h2 className="text-xl font-semibold">QR Code Scanned!</h2>
                            <p className="text-gray-400">
                                {scanType === 'order' ? 'Loading menu...' : 'Processing payment...'}
                            </p>
                            <motion.div
                                animate={{ rotate: 360 }}
                                transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY, ease: 'linear' }}
                            >
                                <Loader2 className="w-6 h-6 mx-auto text-gray-400" />
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </main>

            {/* Footer */}
            <footer className="fixed space-grotesk-700 bottom-0 left-0 right-0 p-4 text-center text-sm font-medium text-black bg-white/90 backdrop-blur-sm">
                <p>Powered by Hipalz</p>
            </footer>
        </div>
    )
}

