import React, { memo } from 'react';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';

interface SkeletonLoaderProps {
  height?: number;
  count?: number;
}

const SkeletonLoader: React.FC<SkeletonLoaderProps> = ({ height, count }) => {
  return (
    <div className="p-4">
      <Skeleton count={count} height={height || 30} />
    </div>
  );
};

export default memo(SkeletonLoader);