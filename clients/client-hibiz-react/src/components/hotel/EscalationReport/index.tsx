import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PieChart, Pie, Legend, ResponsiveContainer, Cell, Tooltip } from "recharts";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { PieChartIcon, TableIcon } from "lucide-react";
import useBusinessData from "@/components/store/useBusinessData";
import { useFetchEscalatedReports } from "@/components/store/hotel/useHotelServices";
import DateRangePicker from "@/components/molecules/dateRangePicker";
import useTimings from "@/components/store/useTimings";
import usePaginationStore from "@/components/store/usePaginationStore";
import { useMemo } from "react";

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8", "#82ca9d"];

const formatDate = (timestamp: number) => format(new Date(timestamp), "MMM dd, yyyy HH:mm");

export default function EscalationReport() {
    const { timeStampStart, timeStampEnd } = useTimings();
    const pageNumber = usePaginationStore((s) => s.pageNumber);
    const businessId = useBusinessData((s) => s.businessData?._id) || "";

    const { escalationData = [] } = useFetchEscalatedReports({
        businessId,
        pageNumber,
        timeStampStart,
        timeStampEnd,
    });

    const { serviceData } = useMemo(() => {
        const serviceCount: Record<string, number> = {};
        const roomsSet = new Set<string>();
        const usersSet = new Set<string>();

        escalationData.forEach(({ serviceIds, roomId, userId }) => {
            serviceIds.forEach(({ name }) => {
                serviceCount[name] = (serviceCount[name] || 0) + 1;
            });
            if (roomId?._id) roomsSet.add(roomId._id);
            if (userId?._id) usersSet.add(userId._id);
        });

        return {
            serviceData: Object.entries(serviceCount).map(([name, count]) => ({ name, count })),
            rooms: roomsSet,
            users: usersSet,
        };
    }, [escalationData]);

    const renderEmpty = (message: string) => (
        <span className="flex items-center justify-center h-full py-10 text-muted-foreground">{message}</span>
    );

    return (
        <div className="container mx-auto py-8 px-4">
            <div className="flex flex-col gap-6">
                <DateRangePicker />
                <Tabs defaultValue="pie-chart">
                    <TabsList className="grid grid-cols-2 mb-4">
                        {[
                            { value: "pie-chart", icon: PieChartIcon, label: "Pie Chart" },
                            { value: "table", icon: TableIcon, label: "Detailed Data" },
                        ].map(({ value, icon: Icon, label }) => (
                            <TabsTrigger key={value} value={value} className="flex items-center gap-2">
                                <Icon className="h-4 w-4" />
                                <span>{label}</span>
                            </TabsTrigger>
                        ))}
                    </TabsList>

                    {/* Pie Chart Tab */}
                    <TabsContent value="pie-chart">
                        <Card>
                            <CardHeader>
                                <CardTitle>Service Request Distribution</CardTitle>
                                <CardDescription>Percentage breakdown of escalations by service type</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="h-[400px]">
                                    {serviceData.length > 0 ? (
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
                                                >
                                                    {serviceData.map((_, index) => (
                                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                                    ))}
                                                </Pie>
                                                <Tooltip />
                                                <Legend />
                                            </PieChart>
                                        </ResponsiveContainer>
                                    ) : (
                                        renderEmpty("No data found")
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Table Tab */}
                    <TabsContent value="table">
                        <Card>
                            <CardHeader>
                                <CardTitle>Escalation Details</CardTitle>
                                <CardDescription>Complete list of all escalation records</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="rounded-md border overflow-x-auto">
                                    {escalationData.length > 0 ? (
                                        <Table>
                                            <TableHeader>
                                                <TableRow>
                                                    {["#", "Date", "Service", "User", "Room", "Status"].map((head) => (
                                                        <TableHead key={head}>{head}</TableHead>
                                                    ))}
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {escalationData.map((item, index) => (
                                                    <TableRow key={item._id}>
                                                        <TableCell>{index + 1}</TableCell>
                                                        <TableCell>{formatDate(item.createdAt)}</TableCell>
                                                        <TableCell className="flex flex-wrap gap-1">
                                                            {item.serviceIds.map((service) => (
                                                                <Badge key={service._id} variant="outline">{service.name}</Badge>
                                                            ))}
                                                        </TableCell>
                                                        <TableCell>{item.userId?.name || "-"}</TableCell>
                                                        <TableCell>{item.roomId?.name || "-"}</TableCell>
                                                        <TableCell>
                                                            <Badge variant="destructive">{item.alertProgress}</Badge>
                                                        </TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    ) : (
                                        renderEmpty("No data found")
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    );
}
