import { useState, useMemo, lazy } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { PieChartIcon, TableIcon } from "lucide-react"
import useTimings from "@/components/store/useTimings"
import usePaginationStore from "@/components/store/usePaginationStore"
import useBusinessData from "@/components/store/useBusinessData"
import { useFetchEscalatedReports } from "@/components/store/hotel/useHotelServices"
import { exportToCSV, extractRoomNames, extractServiceNames, processEscalationData } from "@/components/utils/escalation"

const DashboardHeader = lazy(() => import("./DashboardHeader"))
const FilterIndicator = lazy(() => import("./FilterIndicator"))
const SummaryCards = lazy(() => import("./SummaryCards"))
const EscalationPieChart = lazy(() => import("./EscalationPieChart"))
const EscalationTable = lazy(() => import("./EscalationTable"))

export default function EscalationReport() {
    const { timeStampStart, timeStampEnd } = useTimings()
    const pageNumber = usePaginationStore((s) => s.pageNumber)
    const setPageNumber = usePaginationStore((s) => s.setPageNumber)
    const businessId = useBusinessData((s) => s.businessData?._id) || ""

    // Separate state for service and room filters
    const [activeServiceFilter, setActiveServiceFilter] = useState<string | null>(null)
    const [activeRoomFilter, setActiveRoomFilter] = useState<string | null>(null)

    const { escalationData = [], escalatedReportsLoading } = useFetchEscalatedReports({
        businessId,
        pageNumber,
        timeStampStart,
        timeStampEnd,
    })
    // Extract service and room names for filtering
    const serviceNames = useMemo(() => extractServiceNames(escalationData), [escalationData])
    const roomNames = useMemo(() => extractRoomNames(escalationData), [escalationData])

    // Process data with useMemo for performance, now with both filters
    const { serviceData, rooms, users, totalEscalations, filteredData } = useMemo(
        () => processEscalationData(escalationData, activeServiceFilter, activeRoomFilter),
        [escalationData, activeServiceFilter, activeRoomFilter],
    )

    // Handle export
    const handleExport = () => exportToCSV(filteredData)

    return (
        <div className="container mx-auto py-6 px-4 space-y-8">
            {/* Header with title and actions */}
            <DashboardHeader
                isLoading={escalatedReportsLoading}
                onExport={handleExport}
                serviceNames={serviceNames}
                roomNames={roomNames}
                filters={{
                    activeServiceFilter,
                    setActiveServiceFilter,
                    activeRoomFilter,
                    setActiveRoomFilter,
                }}
                hasData={filteredData.length > 0}
            />

            {/* Active filter indicators */}
            <FilterIndicator
                filters={{
                    activeServiceFilter,
                    setActiveServiceFilter,
                    activeRoomFilter,
                    setActiveRoomFilter,
                }}
            />

            {/* Summary Cards */}
            <SummaryCards
                isLoading={escalatedReportsLoading}
                totalEscalations={totalEscalations}
                uniqueRooms={rooms.size}
                uniqueUsers={users.size}
            />

            {/* Charts and Table */}
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
                    <EscalationPieChart isLoading={escalatedReportsLoading} serviceData={serviceData} />
                </TabsContent>

                {/* Table Tab */}
                <TabsContent value="table">
                    <EscalationTable
                        isLoading={escalatedReportsLoading}
                        data={filteredData}
                        pageNumber={pageNumber}
                        setPageNumber={setPageNumber}
                        onExport={handleExport}
                    />
                </TabsContent>
            </Tabs>
        </div>
    )
}
