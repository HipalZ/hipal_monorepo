"use client"

import { useState } from "react"
import { Star, X, Send } from "lucide-react"
import useBusinessDetails from "@/components/store/useBusinessDetails"
import { toast } from "react-toastify"
import { apiRpc } from "@hi/common"
import useLoyaltyData from "@/components/store/useLoyaltyData"
import { useLogin } from "@/components/store/useLogin"
import { useParams, useRouter } from "next/navigation"
import { useReview } from "@/components/store/useReview"
import { useErrorHandling } from "@/utils/helper"

interface ReviewState {
    rating: number
    comment: string
}

export default function ReviewPage() {
    const [showModal, setShowModal] = useState(false)
    const customLink = useParams()?.businessId as string;
    const [review, setReview] = useState<ReviewState>({
        rating: 0,
        comment: "",
    })
    const router = useRouter()
    const { setShowGoogleReview } = useReview((s) => ({
        setShowGoogleReview: s.setShowGoogleReview,
    }));
    const { loyaltySetting } = useLoyaltyData();
    const { errorText } = useErrorHandling();
    const {
        userDetails,
        setReviewPopup,
        googleReviewCount,
        isLogin,
        setDirection,
    } = useLogin((s) => ({
        userDetails: s.userDetails,
        setReviewPopup: s.setReviewPopup,
        googleReviewCount: s.googleReviewCount,
        isLogin: s.isLogin,
        setDirection: s.setDirection,
    }));
    const businessDetails = useBusinessDetails((s) => s.businessDetails);
    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        let newWindow: Window | null = null;
        if (review.rating >= 3) {
            // Redirect to Google review page for ratings > 3
            const url = businessDetails?.placeUrl || "";
            newWindow = window.open(url, "_blank");
        } else {
            // Show thank you message for ratings <= 3
            setShowModal(false)
            toast.success("Thank you for your valuable feedback!")
        }
        try {
            const res = await apiRpc.reviews["update-google-review"].$put({
                json: {
                    loyaltyId: loyaltySetting?.loyaltyId.toString(),
                    userId: userDetails._id.toString(),
                },
            });

            if (res.status === 409) {
                toast.error("Review Already Submitted");
                router.push(`/${customLink}/explore`);
                setShowGoogleReview(false);
                return;
            }

            if (res.status === 401 || res.status === 400) {
                errorText(res.status);
                setShowGoogleReview(false);
                newWindow?.close();
                return;
            }

            await res.json();
            if (res.status === 200) {
                setReviewPopup(true);
            }

            if (!newWindow) {
                toast.error(
                    "Failed to open the new tab. Please enable pop-ups for this site and try again.",
                );
                alert("Please enable pop-ups for this site to proceed.");
            }
        } catch (error) {
            console.error("Error during sign-in:", error);
            newWindow?.close();
        }
    }

    const handleStarClick = (rating: number) => {
        setReview((prev) => ({ ...prev, rating }))
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-white to-pink-100 flex items-center justify-center p-2">
            {/* Main Button */}
            <button
                onClick={() => setShowModal(true)}
                type="button"
                className="group relative overflow-hidden bg-white px-8 py-4 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 flex items-center gap-3 text-gray-700"
            >
                <div className="absolute inset-0 bg-gradient-to-r from-yellow-400/10 to-orange-400/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <Star className="w-6 h-6 text-blue-400" />
                <span className="font-semibold text-lg">Rate your experience</span>
            </button>

            {/* Combined Review Modal */}
            <dialog
                open={showModal}
                className="fixed inset-0 flex items-center justify-center backdrop-blur-sm z-50"
            >
                <div className="bg-white rounded-3xl p-8 w-full max-w-md transform transition-all duration-300">
                    <div className="flex justify-between items-center mb-6">
                        <div className="flex items-center gap-3">
                            <div className="bg-blue-100 p-3 rounded-2xl">
                                <Star className="w-6 h-6 text-blue-600" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold text-gray-900">Rate us</h2>
                                <p className="text-gray-500">Share your experience</p>
                            </div>
                        </div>
                        <button
                            type="button"
                            onClick={() => setShowModal(false)}
                            className="text-gray-400 hover:text-gray-600 transition-colors p-2 hover:bg-gray-100 rounded-full"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Star Rating */}
                        <div className="flex gap-2 justify-center bg-gray-50 py-6 rounded-2xl">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <button
                                    key={star}
                                    type="button"
                                    onClick={() => handleStarClick(star)}
                                    className="p-1 transform hover:scale-110 transition-transform duration-200"
                                >
                                    <Star
                                        className={`w-10 h-10 ${star <= review.rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300 hover:text-yellow-400"
                                            }`}
                                    />
                                </button>
                            ))}
                        </div>
                        {/* Comment Input */}
                        <div className="space-y-2">
                            <label htmlFor="comment" className="block text-sm font-medium text-gray-700">
                                Share details of your experience
                            </label>
                            <textarea
                                id="comment"
                                name="comment"
                                rows={4}
                                value={review.comment}
                                onChange={(e) => setReview((prev) => ({ ...prev, comment: e.target.value }))}
                                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200 outline-none resize-none"
                                placeholder="What did you like or dislike? What should others know?"
                            />
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={review.rating === 0}
                            className="w-full group bg-blue-500 active:bg-blue-700 text-white py-3 px-6 rounded-xl font-medium hover:from-yellow-500 hover:to-orange-600 transition-all duration-200 transform hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            Submit feedback
                            <Send className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
                        </button>
                    </form>
                </div>
            </dialog>
        </div>
    )
}

