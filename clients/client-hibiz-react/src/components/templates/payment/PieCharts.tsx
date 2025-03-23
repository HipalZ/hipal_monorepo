import { PieChart as RechartsPieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { Card, CardContent } from "@/components/ui/card"
import { useCallback } from "react";
interface PieChartProps {
    data: Array<{ name: string; value: number }>;
}

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8", "#82CA9D"];

export const PieChart: React.FC<PieChartProps> = ({ data }) => {
    const total = data.reduce((sum, entry) => sum + entry.value, 0);

    const dataWithPercentage = data.map(entry => ({
        ...entry,
        percentage: ((entry.value / total) * 100).toFixed(2)
    }));

    const customTooltip = ({ active, payload }: any) => {
        if (active && payload && payload.length) {
            const data = payload[0].payload;
            return (
                <div className="p-2 bg-white border rounded shadow">
                    <p className="font-semibold">{data.name}</p>
                    <p>{`Amount: ${new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(data.value)}`}</p>
                    <p>{`Percentage: ${data.percentage}%`}</p>
                </div>
            );
        }
        return null;
    };

      const rectifyNames = useCallback((name: string) => {
            return name.replace(/([a-z])([A-Z])/g, '$1 $2')
        }, [])

    return (
        <div className="flex flex-col items-center justify-between w-full md:flex-row">
            {/* Pie Chart on the left */}
            <ResponsiveContainer width="100%" height={280}>
                <RechartsPieChart>
                    <Pie
                        data={dataWithPercentage}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={125}
                        fill="#8884d8"
                        dataKey="value"
                    >
                        {dataWithPercentage.map((_, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                    </Pie>
                    <Tooltip content={customTooltip} />
                </RechartsPieChart>
            </ResponsiveContainer>

            <div className="md:w-[100%] w-full">
                <h3 className="mb-2 font-semibold">Offline Payment Breakdown</h3>
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
        </div>
    );
};
