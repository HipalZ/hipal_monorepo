import { memo } from 'react'
import { motion } from "framer-motion"

interface IMotionButton {
    onClick: () => void
    buttonName: string
}

const MemoMotionButton = ({ onClick, buttonName }: IMotionButton) => {
    return (
        <motion.div
            className="fixed bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-white via-white"
            initial={{ y: 100 }}
            animate={{ y: 0 }}
            transition={{ duration: 0.5 }}
        >
            <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="button"
                onClick={onClick}
                className="w-full max-w-md mx-auto h-14 bg-black text-white rounded-2xl shadow-lg hover:shadow-xl transition-all font-medium flex items-center justify-center gap-2"
            >
                {buttonName}
            </motion.button>
        </motion.div>
    )
}

const MotionButton = memo(MemoMotionButton)
export default MotionButton