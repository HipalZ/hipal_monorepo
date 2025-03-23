import { useState, useCallback } from "react"
import { Building2, HousePlus, Plus, } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import MemoizedFloorCard from "./FloorCard"
import AdvancedBottomButton from "@/components/atom/bottomButton/advancedBottomButton"
import PopUp from "@/components/atom/popUp"
import useFloorFormStore, { useFloorStore } from "@/components/store/hotel/useFloorStore"
import AddFloor from "./AddFloor"
import { useRoomStore } from "@/components/store/hotel/useRoomStore"

// Define the Floor interface
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
interface EmptyStateProps {
    onAddFloor: () => void
}

const EmptyState: React.FC<EmptyStateProps> = ({ onAddFloor }) => (
    <Card className="p-8 mt-8 text-center">
        <div className="flex flex-col items-center justify-center space-y-3">
            <div className="p-4 rounded-full shadow-lg bg-gradient-to-br from-gray-400 to-gray-600">
                <Building2 className="w-10 h-10 text-white drop-shadow-md" />
            </div>
            <h3 className="text-lg font-medium">No Floors Added Yet</h3>
            <p className="text-sm text-muted-foreground">Add floors to organize your hotel rooms</p>
            <Button onClick={onAddFloor} className="mt-2">
                <Plus className="w-4 h-4 mr-2" />
                Add First Floor
            </Button>
        </div>
    </Card>
)

const FloorMain: React.FC = () => {
    const [hoveredCard, setHoveredCard] = useState<string | null>(null)

    const { floorData, setAddFloorModal, addFloorModal } = useFloorStore((s) => ({
        floorData: s.floorData as Floor[],
        setAddFloorModal: s.setAddFloorModal,
        addFloorModal: s.addFloorModal
    }))

    const { roomData } = useRoomStore(s => ({
        roomData: s.roomData
    }))

    const { setEditMode, setEditFloorId, initializeFormForEdit, setCurrentStep } = useFloorFormStore((state) => ({
        setEditMode: state.setEditMode,
        setEditFloorId: state.setEditFloorId,
        initializeFormForEdit: state.initializeFormForEdit,
        setCurrentStep: state.setCurrentStep,
    }))


    const handleAddFloor = useCallback(() => {
        setAddFloorModal(true)
    }, [addFloorModal])

    const handleManageRooms = useCallback((floorId: string) => {
        const floorToEdit = floorData.find((floor) => floor._id === floorId)
        if (floorToEdit) {
            setEditMode(true)
            setEditFloorId(floorId)
            initializeFormForEdit(floorToEdit, roomData)
            setAddFloorModal(true)
            setCurrentStep(2)
        }
    }, [
        floorData,
        initializeFormForEdit,
        setEditMode,
        setEditFloorId,
        setAddFloorModal,
        roomData,
    ])

    const handleEditFloor = useCallback((floorId: string) => {
        const floorToEdit = floorData.find((floor) => floor._id === floorId)
        if (floorToEdit) {
            setEditMode(true)
            setEditFloorId(floorId)
            initializeFormForEdit(floorToEdit, roomData)
            setAddFloorModal(true)
        }
    }, [
        floorData,
        initializeFormForEdit,
        setEditMode,
        setEditFloorId,
        setAddFloorModal,
        roomData,
    ])

    const handleDeleteFloor = useCallback((floorId: string) => {
        console.log("Delete floor:", floorId)
    }, [])

    const handleToggleAvailability = useCallback((floorId: string, currentStatus: boolean) => {
        console.log("Toggle availability for floor:", floorId, "New status:", !currentStatus)
    }, [])


    return (
        <div className="px-4 py-8 mx-auto ">
            <h2 className="mb-6 text-2xl font-bold">Hotel Floors</h2>


            {floorData && floorData.length > 0 ? (
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 pb-[10rem]">
                    {floorData.map((floor, index) => (
                        <MemoizedFloorCard
                            key={floor._id}
                            floor={floor}
                            index={index}
                            hoveredCard={hoveredCard}
                            setHoveredCard={setHoveredCard}
                            onManageRooms={handleManageRooms}
                            onEditFloor={handleEditFloor}
                            onDeleteFloor={handleDeleteFloor}
                            onToggleAvailability={handleToggleAvailability}
                        />
                    ))}

                </div>
            ) : (
                <EmptyState onAddFloor={handleAddFloor} />
            )}
            <PopUp hide width="w-[30rem]" height="h-[100dvh] lg:h-[90dvh]" show={addFloorModal} onClose={() => setAddFloorModal(false)}>
                <AddFloor />
            </PopUp>
            <AdvancedBottomButton
                fixed={true}
                maxWidth="30rem"
                buttons={
                    [
                        {
                            text: "Add Floor",
                            onClick: handleAddFloor,
                            icon: <HousePlus />,
                            className: "pl-3 rounded-md w-full"
                        }
                    ]
                }
            />
        </div>
    )
}

export default FloorMain

