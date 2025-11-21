import usePaginationStore from '@/components/store/usePagination';
import { Pagination, PaginationContent, PaginationItem } from '@/components/ui/pagination';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { memo } from 'react';

interface PaginationProps {
  dataLength?: number;
}

const MemoPagination = (props: PaginationProps) => {
  const { dataLength: lengthOfDataByProps = 1 } = props;
  console.log('Length of data by props:', lengthOfDataByProps);

  const handleClick = usePaginationStore((s) => s.handleClick);
  const pageNumber = usePaginationStore((s) => s.pageNumber);
  const dataLength = usePaginationStore((s) => s.dataLength);

  return (
    <div className="fixed bottom-[1rem] left-1/2 z-50 -translate-x-1/2 transform">
      <Pagination>
        <PaginationContent className="flex items-center justify-center space-x-4">
          {dataLength >= 0 && (
            <PaginationItem>
              <button
                type="button"
                onClick={() => handleClick(pageNumber - 1)}
                className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-r from-[#6F649B] to-[#8C63FF] text-white shadow-lg transition-transform hover:-translate-x-1 hover:scale-105"
                aria-label="Go to previous page"
              >
                <ChevronLeft className="h-6 w-6" />
              </button>
            </PaginationItem>
          )}

          <PaginationItem>
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-r from-[#2B354D] to-[#6F649B] text-xl font-bold text-white shadow-lg">
              {pageNumber}
            </div>
          </PaginationItem>

          {dataLength && dataLength > 0 && lengthOfDataByProps >= 20 && (
            <PaginationItem>
              <button
                type="button"
                onClick={() => handleClick(pageNumber + 1)}
                className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-r from-[#8C63FF] to-[#6F649B] text-white shadow-lg transition-transform hover:translate-x-1 hover:scale-105"
                aria-label="Go to next page"
              >
                <ChevronRight className="h-6 w-6" />
              </button>
            </PaginationItem>
          )}
        </PaginationContent>
      </Pagination>
    </div>
  );
};

const ShadcnPagination = memo(MemoPagination);
export default ShadcnPagination;
