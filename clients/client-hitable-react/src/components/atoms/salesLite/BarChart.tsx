import { Card, CardContent } from "@/components/ui/card"
import { useCallback } from "react";

interface BarChartProps {
    data: Array<{ name: string; value: number }>
}

export const BarChart: React.FC<BarChartProps> = ({ data }) => {

    const rectifyNames = useCallback((name: string) => {
        return name.replace(/([a-z])([A-Z])/g, '$1 $2')
    }, [])
    return (
        <div className="flex flex-col gap-4">
           
            <div className="grid grid-cols-2 gap-2 md:grid-cols-3">
                {data.map((item, index) => (
                    <Card key={index} className="w-full bg-white sm:w-auto">
                        <CardContent className="p-4">
                            <div className="text-sm font-semibold capitalize opacity-70">{rectifyNames(item.name)}</div>
                            <div className="mt-2 text-2xl font-bold">₹ {item.value}</div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    )
}

