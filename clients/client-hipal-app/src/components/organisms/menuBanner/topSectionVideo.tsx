"use client";

import { useSearch } from "@/components/store/useSearch";
import { memo } from "react";
import { motion, AnimatePresence } from "framer-motion";

const MemoTopSectionVideo = () => {
  const { isSearchActive } = useSearch();

  return (
    <AnimatePresence>
      {!isSearchActive && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.3 }}
          style={{ width: "100%", overflow: "hidden" }}
        >
          <video
            src="https://assets.hipalz.com/Sequence%2002_1.mp4"
            autoPlay
            loop
            muted
            playsInline
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
};

const TopSectionVideo = memo(MemoTopSectionVideo);
export default TopSectionVideo;
