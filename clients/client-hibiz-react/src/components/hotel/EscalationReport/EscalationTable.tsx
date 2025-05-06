import { format } from "date-fns"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { AlertTriangle, ChevronLeft, ChevronRight, Download } from "lucide-react"
import type { EscalationItem } from "@/components/types/hotelTypes"

// Format timestamp to readable date
const formatDate = (timestamp: number) => format(new Date(timestamp), "MMM dd, yyyy HH:mm")

interface EscalationTableProps {
    isLoading: boolean
    data: EscalationItem[]
    pageNumber: number
    setPageNumber: (page: number) => void
    onExport: () => void
}

export default function EscalationTable({
    isLoading,
    data,
    pageNumber,
    setPageNumber,
    onExport,
}: EscalationTableProps) {
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
    return (
        <Card>
            <CardHeader>
                <div className="flex justify-between items-start">
                    <div>
                        <CardTitle>Escalation Details</CardTitle>
                        <CardDescription>Complete list of all escalation records</CardDescription>
                    </div>
                    <Button
                        variant="outline"
                        size="sm"
                        className="flex items-center gap-1"
                        onClick={onExport}
                        disabled={data.length === 0}
                    >
                        <Download className="h-3 w-3" />
                        <span className="hidden sm:inline">Export</span>
                    </Button>
                </div>
            </CardHeader>
            <CardContent>
                <div className="rounded-md border overflow-x-auto">
                    {isLoading ? (
                        <div className="p-4">
                            <Skeleton className="h-6 w-full mb-4" />
                            {[1, 2, 3].map((i) => (
                                <Skeleton key={i} className="h-12 w-full mb-2" />
                            ))}
                        </div>
                    ) : data.length > 0 ? (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    {["#", "Date", "Service", "User", "Room", "Delivery Time"].map((head) => (
                                        <TableHead key={head}>{head}</TableHead>
                                    ))}
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {data.map((item, index) => (
                                    <TableRow key={item._id} className="hover:bg-muted/50 transition-colors">
                                        <TableCell className="font-medium">{index + 1}</TableCell>
                                        <TableCell>{formatDate(item?.createdAt)}</TableCell>
                                        <TableCell className="flex flex-wrap gap-1 max-w-[200px]">
                                            {item.serviceIds.map((service) => (
                                                <Badge key={service._id} variant="outline" className="whitespace-nowrap text-xs">
                                                    {service.name}
                                                </Badge>
                                            ))}
                                        </TableCell>
                                        <TableCell>{item.userId?.name || "-"}</TableCell>
                                        <TableCell>{item.roomId?.name || "-"}</TableCell>
                                        {item?.deliveredAt && <TableCell>{formatDate(item?.deliveredAt) || "-"}</TableCell>}
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    ) : (
                        renderEmpty("No escalation data available for the selected period")
                    )}
                </div>
            </CardContent>
            <CardFooter className="flex items-center justify-between pt-2">
                <div className="text-sm text-muted-foreground">Showing {data.length} records</div>
                <div className="flex items-center space-x-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPageNumber(Math.max(1, pageNumber - 1))}
                        disabled={pageNumber <= 1 || isLoading}
                    >
                        <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <span className="text-sm">Page {pageNumber}</span>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPageNumber(pageNumber + 1)}
                        disabled={data.length === 0 || isLoading}
                    >
                        <ChevronRight className="h-4 w-4" />
                    </Button>
                </div>
            </CardFooter>
        </Card>
    )
}
