import {
    LineChart as RechartsLineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from "recharts"
import { Card, CardContent } from "@/components/ui/card"
import { useCallback } from "react";

interface LineChartProps {
    data: Array<{ name: string; value: number }>
}

export const LineChart: React.FC<LineChartProps> = ({ data }) => {

    const rectifyNames = useCallback((name: string) => {
        return name.replace(/([a-z])([A-Z])/g, '$1 $2')
    }, [])

    return (
        <div className="flex flex-col gap-4">
            <div className="flex-grow">
                <ResponsiveContainer width="100%" height={300}>
                    <RechartsLineChart data={data}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Line type="monotone" dataKey="value" stroke="#8884d8" />
                    </RechartsLineChart>
                </ResponsiveContainer>
            </div>
            <div className="grid grid-cols-2 gap-2 md:grid-cols-3">
                {data.map((item, index) => (
                    <Card key={index} className="w-full bg-white sm:w-auto">
                        <CardContent className="p-4">
                            <div className="text-sm font-semibold capitalize opacity-70">{rectifyNames(item.name)}</div>
                            <div className="text-2xl font-bold">₹ {item.value}</div>
                        </CardContent>
                    </Card>
                ))}
            </div>

        </div>
    )
}

