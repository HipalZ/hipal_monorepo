import React from 'react';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';

type SkeletonLoaderProps = {
  height?: number;
  count?: number;
};

const SkeletonLoader = ({ height, count }: SkeletonLoaderProps) => {
  return (
    <div className="p-4">
      <Skeleton count={count} height={height ?? 30} />
    </div>
  );
};

export default SkeletonLoader
