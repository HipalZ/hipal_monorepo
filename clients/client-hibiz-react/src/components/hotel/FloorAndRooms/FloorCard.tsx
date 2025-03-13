import {  useMemo, memo } from "react"
import { Building2, Bed, ToggleLeft, ToggleRight, PenSquare, Trash2 } from "lucide-react"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

interface Floor {
    _id: string
    businessId: string
    amenities: string[]
    availability: boolean
    name: string
    roomIds: string[]
    tax: number
    __v: number
}

interface FloorCardProps {
    floor: Floor
    index: number
    hoveredCard: string | null
    setHoveredCard: (id: string | null) => void
    onManageRooms: (floorId: string) => void
    onEditFloor: (floorId: string) => void
    onDeleteFloor: (floorId: string) => void
    onToggleAvailability: (floorId: string, currentStatus: boolean) => void
}

// Separate FloorCard component for better performance
const FloorCard: React.FC<FloorCardProps> = ({
    floor,
    index,
    hoveredCard,
    setHoveredCard,
    onManageRooms,
    onEditFloor,
    onDeleteFloor,
    onToggleAvailability,
}) => {
    // Memoize the color to prevent recalculation
    const floorColor = useMemo(() => {
        const colors = [
            "from-purple-400 to-purple-600",
            "from-blue-400 to-blue-600",
            "from-amber-400 to-amber-600",
            "from-emerald-400 to-emerald-600",
            "from-rose-400 to-rose-600",
            "from-cyan-400 to-cyan-600",
        ]
        return colors[index % colors.length]
    }, [index])

    return (
        <Card
            className="relative overflow-hidden transition-all duration-300 border-2 hover:shadow-lg"
            style={{
                borderColor: hoveredCard === floor._id ? "var(--primary)" : "transparent",
                transform: hoveredCard === floor._id ? "translateY(-5px)" : "none",
            }}
            onMouseEnter={() => setHoveredCard(floor._id)}
            onMouseLeave={() => setHoveredCard(null)}
        >
            <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                    <CardTitle className="text-xl ml-[4rem]">{floor.name}</CardTitle>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="w-8 h-8">
                                <PenSquare className="w-4 h-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => onEditFloor(floor._id)}>
                                <PenSquare className="w-4 h-4 mr-2" />
                                Edit Floor
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                onClick={() => onDeleteFloor(floor._id)}
                                className="text-destructive focus:text-destructive"
                            >
                                <Trash2 className="w-4 h-4 mr-2" />
                                Delete Floor
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </CardHeader>
            <CardContent>
                <div className="flex flex-col items-center justify-center space-y-4 text-center h-[5rem]">
                    <div
                        className={`p-4 absolute left-3 top-3 rounded-full bg-gradient-to-br ${floorColor} shadow-lg transform hover:scale-105 transition-transform`}
                    >
                        <Building2 className="w-6 h-6 text-white drop-shadow-md" />
                    </div>

                    <div className="flex items-center justify-center gap-3 mt-2">
                        <Badge variant="outline" className="flex items-center gap-1 px-3 py-1">
                            <Bed className="h-3.5 w-3.5" />
                            {floor.roomIds.length} Rooms
                        </Badge>

                        <Badge
                            variant={floor.availability ? "default" : "secondary"}
                            className={`px-3 py-1 ${floor.availability ? "bg-green-100 text-green-800 hover:bg-green-100" : "bg-gray-100 text-gray-800 hover:bg-gray-100"}`}
                        >
                            {floor.availability ? "Available" : "Unavailable"}
                        </Badge>
                    </div>

                    {floor.tax > 0 && <div className="text-sm text-muted-foreground">Tax: {floor.tax}%</div>}
                </div>
            </CardContent>

            <Separator />

            <CardFooter className="flex justify-between pt-4">
                <Button
                    variant="outline"
                    size="sm"
                    className="flex items-center gap-1"
                    onClick={() => onToggleAvailability(floor._id, floor.availability)}
                >
                    {floor.availability ? (
                        <>
                            <ToggleRight className="w-4 h-4" />
                            <span>Disable</span>
                        </>
                    ) : (
                        <>
                            <ToggleLeft className="w-4 h-4" />
                            <span>Enable</span>
                        </>
                    )}
                </Button>

                <Button
                    variant="default"
                    size="sm"
                    className="flex items-center gap-1"
                    onClick={() => onManageRooms(floor._id)}
                >
                    <Bed className="w-4 h-4" />
                    <span>Manage Rooms</span>
                </Button>
            </CardFooter>
        </Card>
    )
}

const MemoizedFloorCard = memo(FloorCard)
export default MemoizedFloorCard