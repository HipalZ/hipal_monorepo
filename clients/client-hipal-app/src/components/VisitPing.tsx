"use client";

import { apiRpc } from "@hi/common";
import { useParams } from "next/navigation";
import { useEffect } from "react";
import { useBusinessDetails } from "./store/useBusinessDetails";
import { useLogin } from "./store/useLogin";

const OBJECT_ID = /^[a-f0-9]{24}$/i;

// Logs a customer visit when a returning user opens the app. Returning
// users are auto-logged-in from localStorage and never hit the sign-in
// API, so without this ping their repeat visits are invisible.
// The server dedupes to one visit per user per day, so firing on every
// page load is safe; the sessionStorage guard just avoids redundant
// network calls within a browsing session.
const VisitPing = () => {
  const params = useParams();
  const userId = useLogin((s) => s.userDetails?._id);
  const storeBusinessId = useBusinessDetails(
    (s) => s.businessDetails?.businessId || s.businessDetails?._id,
  );

  const paramBusinessId =
    typeof params?.businessId === "string" ? params.businessId : undefined;

  // Route param may be a customLink slug — only trust it when it is a
  // real ObjectId; otherwise use the business store (set after fetch).
  const businessId =
    paramBusinessId && OBJECT_ID.test(paramBusinessId)
      ? paramBusinessId
      : storeBusinessId && OBJECT_ID.test(storeBusinessId)
        ? storeBusinessId
        : undefined;

  useEffect(() => {
    if (!businessId || !userId || !OBJECT_ID.test(userId)) return;

    const day = new Date().toISOString().slice(0, 10);
    const key = `visit-ping:${businessId}:${userId}:${day}`;
    try {
      if (sessionStorage.getItem(key)) return;
      sessionStorage.setItem(key, "1");
    } catch {
      // sessionStorage unavailable (private mode) — server dedup covers it
    }

    apiRpc.visits.ping
      .$post({ json: { businessId, userId } })
      .catch(() => {
        // never disturb the customer experience; retry next page load
        try {
          sessionStorage.removeItem(key);
        } catch {}
      });
  }, [businessId, userId]);

  return null;
};

export default VisitPing;
