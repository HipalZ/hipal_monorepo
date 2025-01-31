import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { motion } from "framer-motion"

interface InfoCardProps {
    title: string
    value: number
    icon: React.ReactNode
    gradient: string
}

export const InfoCard: React.FC<InfoCardProps> = ({ title, value, icon, gradient }) => {
    return (
        <motion.div whileHover={{ scale: 1.05 }} transition={{ type: "spring", stiffness: 300 }}>
            <Card className={`bg-gradient-to-br ${gradient} relative`}>
                <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                    <CardTitle className="text-sm font-semibold tracking-wider text-white">{title}</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold text-white">₹{value.toLocaleString()}</div>
                </CardContent>
                <article className="absolute top-0 right-0 p-2 text-white">
                    {icon}
                </article>
            </Card>
        </motion.div>
    )
}

