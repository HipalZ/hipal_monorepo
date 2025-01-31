import { PieChart as RechartsPieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";

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

            {/* Data values on the right */}
            <div className="md:w-[100%]">
                <h3 className="mb-2 text-lg font-semibold">Data Breakdown</h3>
                <section className="flex flex-wrap gap-4">
                    {dataWithPercentage.map((entry, index) => (
                        <div key={index} className="mb-1">
                            <span className="font-semibold" style={{ color: COLORS[index % COLORS.length] }}>
                                {entry.name}:
                            </span>
                            {` ${new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(entry.value)}`}
                        </div>
                    ))}
                </section>
            </div>
        </div>
    );
};


