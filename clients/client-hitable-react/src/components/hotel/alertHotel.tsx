import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
    CheckCircle,
    XCircle,
    Clock,
    Package,
    User,
    Phone,
    CheckCheck,
    AlertTriangle,
    Loader2,
} from "lucide-react";
import { useRespondAlerts, useRoomAlerts } from "@/hooks/useHotelApis"
import type { Alert } from "../types/hotelData"
import { formatDistanceToNow } from "date-fns";
import { useMutation } from "@tanstack/react-query";
import toast from "react-hot-toast";

const RoomAlertCard = () => {
    const [isLoading, setIsLoading] = useState<string | null>(null)
    const { respondAlert } = useRespondAlerts()
    const { mutateAsync } = useMutation({
        mutationFn: respondAlert,
    })
    const { alerts } = useRoomAlerts()
    const handleAction = async (alertId: string, action: "ACCEPTED" | "REJECTED" | "DELIVERED") => {
        setIsLoading(action)
        try {
            mutateAsync({ alertId, action })
        } catch (error) {
            toast.error("Failed to perform action")
        } finally {
            setIsLoading(null)
        }
    }

    // Get status color
    const getStatusColor = (progress: string) => {
        switch (progress) {
            case "CREATED":
                return "bg-amber-100 text-black border-amber-200"
            case "ACCEPTED":
                return "bg-green-100 text-green-800 border-green-200"
            case "REJECTED":
                return "bg-red-100 text-red-800 border-red-200"
            case "DELIVERED":
                return "bg-gradient-to-r from-blue-400 to-blue-600 text-blue-800 border-blue-200"
            default:
                return "bg-gray-100 text-gray-800 border-gray-200"
        }
    }

    // Get status icon
    const getStatusIcon = (progress: string) => {
        switch (progress) {
            case "CREATED":
                return <Clock className="h-4 w-4" />
            case "ACCEPTED":
                return <CheckCircle className="h-4 w-4" />
            case "REJECTED":
                return <XCircle className="h-4 w-4" />
            case "DELIVERED":
                return <CheckCheck className="h-4 w-4" />
            default:
                return <AlertTriangle className="h-4 w-4" />
        }
    }

    // border color
    const borderColor = (progress: string) => {
        switch (progress) {
            case "CREATED":
                return "#f59e0b"
            case "ACCEPTED":
                return "#10b981"
            case "REJECTED":
                return "#ef4444"
            case "DELIVERED":
                return "#3b82f6"
            default:
                return "#d1d5db"
        }
    }

    return (
        <div className="p-4 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
            {alerts?.map((alert: Alert) => {
                return (
                    <Card key={alert?._id}
                        className="w-full overflow-hidden border-l-4 hover:shadow-md transition-all duration-200"
                        style={{
                            borderLeftColor:
                                borderColor(alert.alertProgress),
                        }}
                    >
                        <CardContent className="p-0 flex flex-col justify-between">
                            {/* Header with room number and time */}
                            <div className="bg-gray-50 flex justify-between items-center border-b px-4 py-2">
                                <article className="space-y-2">
                                    <span className="font-bold text-lg">Room {alert.roomId.name}</span>
                                    {/* Service requested */}
                                    <div className="flex flex-wrap gap-2">
                                        {alert.serviceIds.map((service) => (
                                            <Badge key={service._id} variant="outline" className="flex items-center gap-1 px-2 py-1">
                                                <Package className="h-3.5 w-3.5" />
                                                {service.name}
                                            </Badge>
                                        ))}
                                    </div>
                                </article>
                                <section className="space-y-2 flex flex-col items-end">
                                    <div className="text-sm text-gray-500 flex items-center gap-1">
                                        <Clock className="h-3.5 w-3.5" />
                                        {formatDistanceToNow(new Date(alert.createdAt), { addSuffix: true })}
                                    </div>
                                    {/* Status */}
                                    <Badge className={`flex items-center gap-1 px-2 py-1 w-24 ${getStatusColor(alert.alertProgress)}`}>
                                        {getStatusIcon(alert?.alertProgress)}
                                        {alert.alertProgress}
                                    </Badge>
                                </section>
                            </div>
                            {/* Main content */}
                            <div className="p-4 flex flex-col justify-between">
                                {/* Guest information */}
                                <div className="mb-3 grid grid-cols-2 gap-2">
                                    <div>
                                        <div className="text-sm text-gray-500 mb-1">Guest</div>
                                        <div className="flex items-center gap-1">
                                            <User className="h-3.5 w-3.5 text-gray-700" />
                                            <span className="font-medium">{alert.createdBy.name}</span>
                                        </div>
                                    </div>
                                    <div>
                                        <div className="text-sm text-gray-500 mb-1">Contact</div>
                                        <div className="flex items-center gap-1">
                                            <Phone className="h-3.5 w-3.5 text-gray-700" />
                                            <span>{alert.createdBy.phone}</span>
                                        </div>
                                    </div>
                                </div>
                                {/* Accepted by information */}
                                {alert?.acceptedBy &&
                                    <div className="grid grid-cols-2 gap-2">
                                        <div className="text-sm text-gray-500">Accepted By Staff</div>
                                        <div className="flex items-center gap-1">
                                            <User className="h-3.5 w-3.5 text-gray-700" />
                                            <span className="font-medium">{alert?.acceptedBy?.name}</span>
                                        </div>
                                    </div>
                                }
                                {/* Action buttons */}
                                <div className="flex gap-2 mt-4">
                                    {alert.alertProgress === "CREATED" && (
                                        <>
                                            <Button
                                                variant="outline"
                                                className="flex-1 border-red-200 text-red-700 hover:bg-red-50 hover:text-red-800"
                                                onClick={() => handleAction(alert?._id, "REJECTED")}
                                                disabled={isLoading !== null}
                                            >
                                                {isLoading === "REJECTED" ? (
                                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                                ) : (
                                                    <XCircle className="h-4 w-4 mr-2" />
                                                )}
                                                Reject
                                            </Button>
                                            <Button
                                                className="flex-1 bg-gradient-to-r from-green-400 to-green-600 hover:bg-green-700 text-white"
                                                onClick={() => handleAction(alert?._id, "ACCEPTED")}
                                                disabled={isLoading !== null}
                                            >
                                                {isLoading === "ACCEPTED" ? (
                                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                                ) : (
                                                    <CheckCircle className="h-4 w-4 mr-2" />
                                                )}
                                                Accept
                                            </Button>
                                        </>
                                    )}
                                    {alert.alertProgress === "ACCEPTED" && (
                                        <Button
                                            className="flex-1 bg-gradient-to-r from-blue-400 to-blue-600 hover:bg-blue-700 text-white"
                                            onClick={() => handleAction(alert?._id, "DELIVERED")}
                                            disabled={isLoading !== null}
                                        >
                                            {isLoading === "DELIVERED" ? (
                                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                            ) : (
                                                <CheckCheck className="h-4 w-4 mr-2" />
                                            )}
                                            Mark as Delivered
                                        </Button>
                                    )}

                                    {(alert.alertProgress === "REJECTED" || alert.alertProgress === "DELIVERED") && (
                                        <div className="flex-1 text-center text-sm text-gray-500 py-2">No action required</div>
                                    )}
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                )
            })}
        </div>
    )
}

export default RoomAlertCard

