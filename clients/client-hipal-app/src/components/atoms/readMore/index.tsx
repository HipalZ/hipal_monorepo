"use client";
import { memo } from "react";

const ReadMore = ({
  text,
  className,
  hide,
}: { text: string; className?: string; hide?: boolean }) => {
  const displayText = hide ? `${text.slice(0, 70)}...` : text;

  return (
    <p
      className={`text-left opacity-80 w-full line-clamp-2 text-sm ${className}`}
    >
      {displayText}
    </p>
  );
};

const MemoReadMore = memo(ReadMore);

export default MemoReadMore;
