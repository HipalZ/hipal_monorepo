import { useState, useCallback } from "react"
import { Plus, Edit, Trash2, Bed, DollarSign, Maximize, Users, Image, MoreVertical } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import LoadingSpinner from "@/components/atom/loadingSpinner"
import AdvancedBottomButton from "@/components/atom/bottomButton/advancedBottomButton"
import useBusinessData from "@/components/store/useBusinessData"
import PopUp from "@/components/atom/popUp"
import AddRoomType from "./AddRoomType"
import useRoomTypeStore from "@/components/store/hotel/useRoomTypeStore"
import { type IRoomType, useGetAllRoomTypes } from "@/hooks/hotel/useRoomTypeHook"

const RoomTypeMain = () => {
    const businessId = useBusinessData((s) => s.businessData?._id)
    const { roomTypesData, roomTypesLoading } = useGetAllRoomTypes(businessId as string)
    const [hoveredCard, setHoveredCard] = useState<string | null>(null)

    const { setOpenRoomTypeModal, setEditMode, setEditRoomTypeId, initializeFormForEdit, openRoomTypeModal } = useRoomTypeStore()

    const handleAddRoomType = useCallback(() => {
        setEditMode(false)
        setEditRoomTypeId(null)
        setOpenRoomTypeModal(true)
    }, [setEditMode, setEditRoomTypeId, setOpenRoomTypeModal])

    const handleEditRoomType = useCallback(
        (roomType: IRoomType) => {
            setEditMode(true)
            setEditRoomTypeId(roomType._id)
            initializeFormForEdit(roomType)
            setOpenRoomTypeModal(true)
        },
        [setEditMode, setEditRoomTypeId, initializeFormForEdit, setOpenRoomTypeModal],
    )

    const handleDeleteRoomType = useCallback((roomTypeId: string) => {
        // Implement delete functionality
        console.log("Delete room type:", roomTypeId)
    }, [])

    // Get room type color based on type
    const getRoomTypeColor = (type: string) => {
        const colors: Record<string, string> = {
            SINGLE: "from-blue-400 to-blue-600",
            DOUBLE: "from-green-400 to-green-600",
            TRIPLE: "from-amber-400 to-amber-600",
            QUAD: "from-purple-400 to-purple-600",
            SUITE: "from-rose-400 to-rose-600",
            DELUXE: "from-cyan-400 to-cyan-600",
        }
        return colors[type] || "from-gray-400 to-gray-600"
    }

    if (roomTypesLoading) {
        return <LoadingSpinner />
    }

    return (
        <div className=" px-4 py-8 mx-auto pb-[10rem]">
            <h2 className="pb-4 text-2xl font-bold">Room Types</h2>

            {roomTypesData && roomTypesData.length > 0 ? (
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {roomTypesData.map((roomType) => (
                        <Card
                            key={roomType._id}
                            className="overflow-hidden transition-all duration-300 hover:shadow-xl"
                            style={{
                                borderColor: hoveredCard === roomType._id ? "var(--primary)" : "transparent",
                                transform: hoveredCard === roomType._id ? "translateY(-5px)" : "none",
                            }}
                            onMouseEnter={() => setHoveredCard(roomType._id)}
                            onMouseLeave={() => setHoveredCard(null)}
                        >
                            <CardHeader className="pb-2">
                                <div className="flex items-center justify-between">
                                    <CardTitle className="text-xl">{roomType.roomType.replace(/_/g, " ")}</CardTitle>
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" size="icon" className="w-8 h-8">
                                                <MoreVertical className="w-4 h-4" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuItem onClick={() => handleEditRoomType(roomType)}>
                                                <Edit className="w-4 h-4 mr-2" />
                                                Edit Room Type
                                            </DropdownMenuItem>
                                            <DropdownMenuItem
                                                onClick={() => handleDeleteRoomType(roomType._id)}
                                                className="text-destructive focus:text-destructive"
                                            >
                                                <Trash2 className="w-4 h-4 mr-2" />
                                                Delete Room Type
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </div>
                            </CardHeader>

                            <CardContent>
                                <div className="flex flex-col items-center justify-center space-y-4 text-center">
                                    <div
                                        className={`p-4 rounded-full bg-gradient-to-br ${getRoomTypeColor(roomType.roomType)} shadow-lg transform hover:scale-105 transition-transform`}
                                    >
                                        <Bed className="w-10 h-10 text-white drop-shadow-md" />
                                    </div>

                                    {roomType.description && (
                                        <p className="text-sm text-muted-foreground line-clamp-2">{roomType.description}</p>
                                    )}

                                    <div className="grid w-full grid-cols-3 gap-2">
                                        <div className="flex flex-col items-center p-2 border rounded-lg bg-muted/20 border-muted">
                                            <DollarSign className="w-4 h-4 mb-1 text-primary" />
                                            <span className="text-sm font-medium">₹{roomType.pricePerNight}</span>
                                        </div>
                                        <div className="flex flex-col items-center p-2 border rounded-lg bg-muted/20 border-muted">
                                            <Users className="w-4 h-4 mb-1 text-primary" />
                                            <span className="text-sm font-medium">{roomType.capacity}</span>
                                        </div>
                                        <div className="flex flex-col items-center p-2 border rounded-lg bg-muted/20 border-muted">
                                            <Maximize className="w-4 h-4 mb-1 text-primary" />
                                            <span className="text-sm font-medium">{roomType.size}</span>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>

                            <Separator />

                            <CardFooter className="flex justify-between pt-3">
                                <Badge variant="outline" className="flex items-center gap-1">
                                    <Image className="h-3.5 w-3.5" />
                                    {roomType.images?.length || 0} Images
                                </Badge>

                                <Badge variant="secondary">{roomType.roomIds?.length || 0} Rooms</Badge>
                            </CardFooter>
                        </Card>
                    ))}
                </div>
            ) : (
                <EmptyState onAddRoomType={handleAddRoomType} />
            )}

            <PopUp width="w-[30rem]" height="h-[100dvh] lg:h-[80dvh]" hide rightTopBack show={openRoomTypeModal} onClose={() => setOpenRoomTypeModal(false)} >
                <AddRoomType onClose={() => setOpenRoomTypeModal(false)} />
            </PopUp>

            <AdvancedBottomButton
                fixed={true}
                maxWidth="30rem"
                buttons={[
                    {
                        text: "Add Room Type",
                        onClick: handleAddRoomType,
                        icon: <Plus className="w-4 h-4 mr-2" />,
                        className: "pl-3 rounded-md w-full",
                    },
                ]}
            />
        </div>
    )
}

// Empty State Component
const EmptyState = ({ onAddRoomType }: { onAddRoomType: () => void }) => {
    return (
        <Card className="p-8 mt-8 text-center">
            <div className="flex flex-col items-center justify-center space-y-3">
                <div className="p-4 rounded-full shadow-lg bg-gradient-to-br from-gray-400 to-gray-600">
                    <Bed className="w-10 h-10 text-white drop-shadow-md" />
                </div>
                <h3 className="text-lg font-medium">No Room Types Added Yet</h3>
                <p className="text-sm text-muted-foreground">
                    Create room types to simplify the process of adding multiple rooms
                </p>
                <Button onClick={onAddRoomType} className="mt-2">
                    <Plus className="w-4 h-4 mr-2" />
                    Add First Room Type
                </Button>
            </div>
        </Card>
    )
}

export default RoomTypeMain

