import { memo } from 'react';

function Loader({ type, isSquare }: { type?: 'warning'; isSquare?: boolean }) {
  let className = '';
  if (type === 'warning') {
    className = isSquare ? ' border-t-warning ' : 'progress-warning';
  } else {
    className = isSquare ? ' border-t-primary ' : 'progress-primary';
  }

  if (isSquare) {
    return (
      <div className="flex">
        <div className={`h-8 w-8 animate-spin rounded-full border-4 ${className} bg-transparent`} />
      </div>
    );
  }

  return (
    <div className="flex">
      <progress className={`progress mx-auto w-48 ${className}`} />
    </div>
  );
}

const MemoizedLoader = memo(Loader);

export default MemoizedLoader;
