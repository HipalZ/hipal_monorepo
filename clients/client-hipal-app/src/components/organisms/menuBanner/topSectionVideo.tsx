"use client";
import { memo } from "react";

const MemoTopSectionVideo = () => {
  return (
    <div className="" style={{ width: "100%", overflow: "hidden" }}>
      <video
        src="https://assets.hipalz.com/Sequence%2002_1.mp4"
        autoPlay
        loop
        muted
        playsInline
        style={{ width: "100%", height: "100%", objectFit: "cover" }}
      />
    </div>
  );
};

const TopSectionVideo = memo(MemoTopSectionVideo);
export default TopSectionVideo;
