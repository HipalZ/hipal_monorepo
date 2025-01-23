import { PieChart as RechartsPieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

interface PieChartProps {
    data: Array<{ name: string; value: number }>;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#89CFF0', '#CCCCFF', '#008080'];

export const PieChart: React.FC<PieChartProps> = ({ data }) => {
    // Calculate the total value of the pie chart
    const totalValue = data.reduce((sum, entry) => sum + entry.value, 0);

    // Custom legend formatter to include percentage
    const renderLegendText = (value: string, entry: any) => {
        const percentage = ((entry.payload.value / totalValue) * 100).toFixed(1); // Calculate percentage
        return `${value} (${percentage}%)`;
    };

    return (
        <ResponsiveContainer width="100%" height="100%">
            <RechartsPieChart>
                <Pie
                    data={data}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                >
                    {data.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                </Pie>
                <Tooltip />
                <Legend formatter={renderLegendText} />
            </RechartsPieChart>
        </ResponsiveContainer>
    );
};
