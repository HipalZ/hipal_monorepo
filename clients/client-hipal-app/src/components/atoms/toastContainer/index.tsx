"use client";
import { memo } from "react";
import { Toaster } from "react-hot-toast";

const ToastContainers = () => {
  return (
    <Toaster
      position="top-center"
      reverseOrder={false}
      gutter={10}
      containerStyle={{
        top: 14,
        left: 12,
        right: 12,
        zIndex: 99999,
      }}
      toastOptions={{
        duration: 2200,
        className: "hipal-hot-toast plus-jakarta-font",
        style: {
          maxWidth: "min(92vw, 26rem)",
        },
        success: {
          duration: 1800,
          iconTheme: {
            primary: "#147a3d",
            secondary: "#f7fff9",
          },
        },
        error: {
          duration: 3000,
          iconTheme: {
            primary: "#b42318",
            secondary: "#fff7f6",
          },
        },
        loading: {
          duration: Number.POSITIVE_INFINITY,
        },
      }}
    />
  );
};

const MemoToastContainers = memo(ToastContainers);
export default MemoToastContainers;
