"use client";
import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { CheckCircle2, ThumbsUp } from "lucide-react";
import { motion } from "framer-motion"
import { useHotelStore } from "../store/useHotelStore"

const ReviewUsersHotel = () => {
    const { reviewUserIds, setReviewUserIds, roomData } = useHotelStore()
    const [isSuccess, setIsSuccess] = useState(false)
    const handleToggleUser = (userId: string) => {
        setReviewUserIds((prev) => {
            if (prev.includes(userId)) {
                return prev.filter((id) => id !== userId)
            }
            return [...prev, userId]
        })
    }

    const handleSelectAll = () => {
        if (reviewUserIds.length === roomData?.userIds.length) {
            setReviewUserIds([])
        } else {
            setReviewUserIds(roomData?.userIds.map((user) => user._id))
        }
    }

    if (isSuccess) {
        return (
            <Card>
                <CardContent className="pt-6 pb-6 flex flex-col items-center justify-center">
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", stiffness: 260, damping: 20 }}
                    >
                        <CheckCircle2 className="h-16 w-16 text-green-500 mb-4" />
                    </motion.div>
                    <h2 className="text-xl font-bold text-center mb-2">Thank You!</h2>
                    <p className="text-center text-muted-foreground mb-4">WhatsApp templates have been sent successfully.</p>
                    <div className="flex justify-center">
                        <Button variant="outline" onClick={() => setIsSuccess(false)}>
                            Send to More Users
                        </Button>
                    </div>
                </CardContent>
            </Card>
        )
    }

    return (
        <Card className="mx-auto !border-none !shadow-none pb-5">
            <CardHeader className="space-y-3">
                <CardTitle>
                    <span>Review & Send Feedback</span>
                </CardTitle>
                <CardDescription>Select users who stayed in <b className="text-black">Room {roomData?.name}</b> to send WhatsApp feedback</CardDescription>
            </CardHeader>

            <CardContent className="pb-0">
                <div className="mb-4 flex items-center justify-between">
                    <Button variant="outline" size="sm" onClick={handleSelectAll} className="text-xs h-8">
                        {reviewUserIds.length === roomData?.userIds.length ? "Deselect All" : "Select All"}
                    </Button>
                    <span className="text-sm text-muted-foreground">
                        {reviewUserIds.length} of {roomData?.userIds.length} selected
                    </span>
                </div>

                <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2">
                    {roomData?.userIds.map((user) => (
                        <motion.div
                            key={user._id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.2 }}
                            className={`flex items-center space-x-3 rounded-lg border p-3 transition-colors ${reviewUserIds.includes(user._id)
                                ? "border-green-200 bg-green-50"
                                : "border-gray-200 hover:border-gray-300"
                                }`}
                        >
                            <Checkbox
                                id={`user-${user._id}`}
                                checked={reviewUserIds.includes(user._id)}
                                onCheckedChange={() => handleToggleUser(user._id)}
                                className={reviewUserIds.includes(user._id) ? "text-green-500" : ""}
                            />
                            <div className="flex-1 space-y-1">
                                <div className="flex items-center justify-between">
                                    <Label htmlFor={`user-${user._id}`} className="font-medium cursor-pointer">
                                        {user.name}
                                    </Label>
                                    {reviewUserIds.includes(user._id) && <ThumbsUp className="h-3.5 w-3.5 text-green-500" />}
                                </div>
                                <p className="text-xs text-muted-foreground">{user.phone}</p>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </CardContent>
        </Card>
    )
}

export default ReviewUsersHotel

