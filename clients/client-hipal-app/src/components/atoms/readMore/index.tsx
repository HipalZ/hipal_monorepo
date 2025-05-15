"use client";
import { useState, memo } from "react";

const ReadMore = ({
  text,
  className = "",
  hide,
}: { text: string; className?: string; hide?: boolean }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const shouldTruncate = hide ?? !isExpanded;

  const toggleExpand = () => setIsExpanded(!isExpanded);

  const maxChars = 120;
  const isLong = text.length > maxChars;
  const displayText =
    shouldTruncate && isLong ? `${text.slice(0, maxChars)}...` : text;

  return (
    <p className={`text-sm text-left opacity-80 ${className}`}>
      {displayText}
      {isLong && (
        <span
          className="ml-1 underline cursor-pointer underline-offset-4 text-xs"
          onClick={toggleExpand}
        >
          {" "}
          {shouldTruncate ? "Read More" : "Read Less"}
        </span>
      )}
    </p>
  );
};

const MemoReadMore = memo(ReadMore);

export default MemoReadMore;
