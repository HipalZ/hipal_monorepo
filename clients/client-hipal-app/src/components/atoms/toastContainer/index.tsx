"use client";
import { memo } from "react";
import { ToastContainer, Zoom } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const ToastContainers = () => {
  return (
    <ToastContainer
      position="top-right"
      autoClose={1500}
      transition={Zoom}
      theme="dark"
      hideProgressBar
      toastClassName="custom-toast-body"
      closeButton={false}
      stacked
    />
  );
};

const MemoToastContainers = memo(ToastContainers);
export default MemoToastContainers;
