import { Button } from "@/components/ui/button"
import { Download, Filter, Home } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import DateRangePicker from "@/components/molecules/dateRangePicker"
import type { DashboardFilters } from "@/components/types/hotelTypes"

interface DashboardHeaderProps {
    isLoading: boolean
    onExport: () => void
    serviceNames: string[]
    roomNames: string[]
    filters: DashboardFilters
    hasData: boolean
}

export default function DashboardHeader({
    isLoading,
    onExport,
    serviceNames,
    roomNames,
    filters,
    hasData,
}: DashboardHeaderProps) {
    const { activeServiceFilter, setActiveServiceFilter, activeRoomFilter, setActiveRoomFilter } = filters
    return (
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <DateRangePicker />
            <div className="flex flex-col sm:flex-row gap-3">

                <div className="flex gap-2">
                    {/* Filter by Service dropdown */}
                    <DropdownMenu>
                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <DropdownMenuTrigger asChild>
                                        <Button
                                            variant="outline"
                                            size="icon"
                                            className={activeServiceFilter ? "bg-blue-50 text-blue-600 border-blue-200" : ""}
                                        >
                                            <Filter className="h-4 w-4" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                </TooltipTrigger>
                                <TooltipContent className="bg-blue-600 text-white border-none">
                                    <p>Filter by service</p>
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                        <DropdownMenuContent align="end" className="w-56">
                            <DropdownMenuLabel>Filter by Service</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                                onClick={() => setActiveServiceFilter(null)}
                                className={!activeServiceFilter ? "bg-blue-50 text-blue-600" : ""}
                            >
                                All Services
                            </DropdownMenuItem>
                            {serviceNames.map((name) => (
                                <DropdownMenuItem
                                    key={name}
                                    onClick={() => setActiveServiceFilter(name)}
                                    className={activeServiceFilter === name ? "bg-blue-50 text-blue-600" : ""}
                                >
                                    {name}
                                </DropdownMenuItem>
                            ))}
                        </DropdownMenuContent>
                    </DropdownMenu>

                    {/* Filter by Room dropdown */}
                    <DropdownMenu>
                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <DropdownMenuTrigger asChild>
                                        <Button
                                            variant="outline"
                                            size="icon"
                                            className={activeRoomFilter ? "bg-green-50 text-green-600 border-green-200" : ""}
                                        >
                                            <Home className="h-4 w-4" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                </TooltipTrigger>
                                <TooltipContent className="bg-green-600 text-white border-none">
                                    <p>Filter by room</p>
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                        <DropdownMenuContent align="end" className="w-56">
                            <DropdownMenuLabel>Filter by Room</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                                onClick={() => setActiveRoomFilter(null)}
                                className={!activeRoomFilter ? "bg-green-50 text-green-600" : ""}
                            >
                                All Rooms
                            </DropdownMenuItem>
                            {roomNames.map((name) => (
                                <DropdownMenuItem
                                    key={name}
                                    onClick={() => setActiveRoomFilter(name)}
                                    className={activeRoomFilter === name ? "bg-green-50 text-green-600" : ""}
                                >
                                    {name}
                                </DropdownMenuItem>
                            ))}
                        </DropdownMenuContent>
                    </DropdownMenu>
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button variant="outline" size="icon" onClick={onExport} disabled={!hasData || isLoading}>
                                    <Download className="h-4 w-4" />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent className="bg-blue-600 text-white border-none">
                                <p>Export as CSV</p>
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                </div>
            </div>
        </div>
    )
}
