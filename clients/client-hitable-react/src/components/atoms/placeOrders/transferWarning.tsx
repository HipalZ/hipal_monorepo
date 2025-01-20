import { memo, useState } from 'react'
import { motion, useMotionValue, useTransform } from 'framer-motion'
import { ArrowRight } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card"

/**
 * This component is very similar to BillWarning,
 * but the text is about transferring items to the desktop POS.
 */
type TransferWarningProps = {
    onConfirm: () => void
}

const MemoTransferWarning = ({ onConfirm }: TransferWarningProps) => {
    const [isDragging, setIsDragging] = useState(false)
    const x = useMotionValue(0)
    const xInput = [0, 300]
    const background = useTransform(x, xInput, [
        "linear-gradient(90deg, #FF0000 0%, #FF0000 0%, #e5e7eb 0%, #e5e7eb 100%)",
        "linear-gradient(90deg, #FF000010 0%, #22c55e 100%, #e5e7eb 100%, #e5e7eb 100%)"
    ])

    const guideX = useMotionValue(0)
    const guideOpacity = useTransform(x, [0, 10], [0.5, 0])

    const handleDragEnd = () => {
        setIsDragging(false)
        // If user drags beyond x = 200, confirm transfer
        if (x.get() > 200) {
            onConfirm()
            x.set(0)
        } else {
            x.set(0)
        }
    }

    return (
        <section className='py-[5rem] min-h-[90dvh] flex items-center justify-center md:py-[8rem] px-4 max-w-md mx-auto'>
            <Card className="w-full border-none shadow-none">
                <CardHeader className="pb-2">
                    <CardTitle className="text-2xl font-semibold text-gray-800">
                        Transfer Confirmation
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="grid grid-cols-[auto_1fr] gap-2 p-4 border border-yellow-200 rounded-lg bg-yellow-50">
                        <div>
                            <h4 className="flex items-center gap-2 text-lg font-semibold text-yellow-900">
                                Did you transfer all items into the desktop POS?
                            </h4>
                            <ul className="pl-5 mt-1 text-base font-semibold text-yellow-700 list-disc opacity-70">
                                <li>Ensure all items are correctly transferred.</li>
                                <li>Once confirmed, you cannot undo this step.</li>
                            </ul>
                        </div>
                    </div>

                    <div className="relative w-full overflow-hidden bg-gray-100 rounded-full h-14">
                        {/* Guide Animation */}
                        <motion.div
                            className="absolute top-0 flex items-center h-full pointer-events-none left-14"
                            style={{ x: guideX, opacity: guideOpacity }}
                        >
                            <div className="flex space-x-1">
                                {[0, 1, 2].map((i) => (
                                    <motion.div
                                        key={i}
                                        className="w-2 h-2 bg-green-500 rounded-full"
                                        initial={{ opacity: 0.3 }}
                                        animate={{ opacity: [0.3, 1, 0.3] }}
                                        transition={{
                                            duration: 1,
                                            repeat: Infinity,
                                            delay: i * 0.2,
                                        }}
                                    />
                                ))}
                            </div>
                        </motion.div>

                        <motion.div
                            className="absolute top-0 left-0 w-full h-full"
                            style={{ background }}
                        />
                        <motion.div
                            drag="x"
                            dragConstraints={{ left: 0, right: 300 }}
                            dragElastic={0}
                            dragMomentum={false}
                            onDrag={() => setIsDragging(true)}
                            onDragEnd={handleDragEnd}
                            className="absolute top-0 left-0 flex items-center justify-center w-14 h-14 cursor-grab active:cursor-grabbing"
                            style={{ x }}
                        >
                            <div className="flex items-center justify-center w-12 h-12 bg-green-500 rounded-full shadow-md">
                                <ArrowRight className="w-6 h-6 text-white" />
                            </div>
                        </motion.div>
                        <div className="absolute top-0 left-0 flex items-center justify-center w-full h-full pointer-events-none">
                            <span
                                className={`text-sm font-medium text-gray-600 transition-opacity ${isDragging ? 'opacity-0' : 'opacity-100'
                                    }`}
                            >
                                Slide to confirm transfer
                            </span>
                        </div>
                    </div>
                </CardContent>
                <CardFooter className="justify-center">
                    <p className="text-xs text-gray-500">
                        Drag the button all the way to confirm
                    </p>
                </CardFooter>
            </Card>
        </section>
    )
}

const TransferWarning = memo(MemoTransferWarning)
export default TransferWarning
