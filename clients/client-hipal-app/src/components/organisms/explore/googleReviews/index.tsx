"use client";
import EmblaCarousel2 from "@/components/atoms/emblaCarousel/emblaCarousel2";
import LoadingSpinner from "@/components/atoms/progressBar/loadingSpinner";
import useBusinessDetails from "@/components/store/useBusinessDetails";
import { useLogin } from "@/components/store/useLogin";
import type { GoogleReview, IResponse } from "@/components/types/businessData";
import { apiRpc } from "@hi/common";
import { useQuery } from "@tanstack/react-query";
import Image from "next/image";
import React, { memo, useState } from "react";

const MemoGoogleReviews = () => {
  const [reviews, setReviews] = useState<GoogleReview[]>([]);
  const [loading, setLoading] = useState(false);
  const [expandedReviews, setExpandedReviews] = useState<{
    [key: number]: boolean;
  }>({});
  const businessDetails = useBusinessDetails((s) => s.businessDetails);
  const businessId = useBusinessDetails((s) => s.businessDetails?.businessId);
  const { userDetails } = useLogin((s) => ({ userDetails: s.userDetails }));
  const isLogin = useLogin((s) => s.isLogin);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const res = await apiRpc.reviews.googleReviews.$get({
        query: {
          placeId: businessDetails?.placeId || "ChIJ_RvSJnebyzsRMjwh2mVwWsk",
          businessId: businessId,
          userId: userDetails._id,
        },
      });
      const response: IResponse = await res.json();
      setReviews(response.data.reviews);
      return response.data.reviews;
    } finally {
      setLoading(false);
    }
  };

  useQuery({
    queryKey: ["reviews", businessId, userDetails._id],
    queryFn: fetchReviews,
    enabled: !!businessId && !!userDetails._id,
  });

  if (!isLogin || !reviews || reviews.length === 0) return;

  const toggleExpanded = (index: number) => {
    setExpandedReviews((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  return (
    <>
      <div>
        <h2 className="py-4 mt-4 text-2xl text-center text-primary">
          Our Reviews
        </h2>
        {loading ? (
          <LoadingSpinner />
        ) : (
          <EmblaCarousel2 customCarousel={true}>
            {reviews.map((review: GoogleReview, index) => (
              <div
                key={index.toString()}
                className="w-full h-full p-4 mx-2 border border-1 border-primary rounded-2xl"
              >
                <div className="flex items-center">
                  {review.profilePhotoUrl ? (
                    <Image
                      src={review.profilePhotoUrl}
                      alt={review.authorName}
                      width={48}
                      height={48}
                      className="w-12 h-12 mr-4 rounded-full"
                    />
                  ) : (
                    <div className="flex items-center justify-center w-12 h-12 mr-4 text-lg font-bold text-white bg-gray-300 rounded-full">
                      {review.authorName.charAt(0)}
                    </div>
                  )}
                  <div>
                    <h4 className="text-base font-bold text-primary">
                      {review.authorName}
                    </h4>
                    <div className="flex">
                      {[...Array(review?.rating)].map((_, index) => (
                        <span
                          key={index.toString()}
                          className="text-lg text-primary"
                        >
                          ★
                        </span>
                      ))}
                      {[...Array(5 - review?.rating)].map((_, index) => (
                        <span
                          key={index.toString()}
                          className="text-lg text-gray-300"
                        >
                          ★
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
                <p className="mt-4 text-lg text-primary">
                  {expandedReviews[index] || review.comment.length <= 200
                    ? review.comment
                    : `${review.comment.substring(0, 200)}...`}
                  {review.comment.length > 200 && (
                    <span
                      onClick={() => toggleExpanded(index)}
                      className="ml-4 text-xs underline text-primary"
                    >
                      {expandedReviews[index] ? "Show Less" : "Read More"}
                    </span>
                  )}
                </p>
              </div>
            ))}
          </EmblaCarousel2>
        )}
      </div>
    </>
  );
};

const GoogleReviews = memo(MemoGoogleReviews);
export default GoogleReviews;
//AIzaSyCyHcjzLm2qr_JlaxdQro40n_jkJCu8muc
