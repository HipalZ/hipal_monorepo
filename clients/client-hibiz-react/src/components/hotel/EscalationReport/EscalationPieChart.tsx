import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { AlertTriangle, Info } from "lucide-react"
import { PieChart, Pie, Legend, ResponsiveContainer, Cell, Tooltip } from "recharts"
import { Tooltip as UITooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import type { ServiceDataItem } from "@/components/types/hotelTypes"

// Chart colors - using a more harmonious palette
const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899"]

interface EscalationPieChartProps {
    isLoading: boolean
    serviceData: ServiceDataItem[]
}

export default function EscalationPieChart({ isLoading, serviceData }: EscalationPieChartProps) {
    // Render empty state
    const renderEmpty = (message: string) => (
        <div className="flex flex-col items-center justify-center h-[300px] py-10 text-muted-foreground">
            <AlertTriangle className="h-10 w-10 mb-4 text-muted-foreground/50" />
            <p>{message}</p>
            <Button variant="outline" size="sm" className="mt-4">
                Try Again
            </Button>
        </div>
    )

    // Render loading skeleton
    const renderLoading = () => (
        <div className="space-y-4">
            <div className="flex flex-col space-y-3">
                <Skeleton className="h-[250px] w-full rounded-xl" />
                <div className="flex justify-center space-x-4">
                    <Skeleton className="h-4 w-[100px]" />
                    <Skeleton className="h-4 w-[100px]" />
                    <Skeleton className="h-4 w-[100px]" />
                </div>
            </div>
        </div>
    )

    return (
        <Card>
            <CardHeader>
                <div className="flex justify-between items-start">
                    <div className="space-y-2">
                        <CardTitle>Service Request Distribution</CardTitle>
                        <CardDescription>Percentage breakdown of escalations by service type</CardDescription>
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                <div className="h-[400px]">
                    {isLoading ? (
                        renderLoading()
                    ) : serviceData.length > 0 ? (
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={serviceData}
                                    cx="50%"
                                    cy="50%"
                                    labelLine
                                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                                    outerRadius={150}
                                    fill="#8884d8"
                                    dataKey="count"
                                    nameKey="name"
                                    animationDuration={800}
                                >
                                    {serviceData.map((_, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip formatter={(value) => [`${value} requests`, "Count"]} />
                                <Legend layout="horizontal" verticalAlign="bottom" align="center" />
                            </PieChart>
                        </ResponsiveContainer>
                    ) : (
                        renderEmpty("No service data available for the selected period")
                    )}
                </div>
            </CardContent>
        </Card>
    )
}
