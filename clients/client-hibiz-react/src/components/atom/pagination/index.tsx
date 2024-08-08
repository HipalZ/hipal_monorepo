import usePaginationStore from "@/components/store/usePaginationStore";
import { memo } from "react";
import { BiChevronsLeft, BiChevronsRight } from "react-icons/bi";

const MemoPagination = () => {
  const { handleClick, pageNumber, dataLength } = usePaginationStore((s) => ({
    pageNumber: s.pageNumber,
    handleClick: s.handleClick,
    dataLength: s.dataLength,
  }));

  return (
    <div className="fixed bottom-[3rem] left-1/2 z-50 flex -translate-x-1/2 transform items-center justify-center space-x-4">
      {dataLength >= 0 ? (
        <button
          type="button"
          onClick={() => handleClick(pageNumber - 1)}
          className="flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-r from-[#6F649B] to-[#8C63FF] text-white shadow-lg transition-transform transform hover:-translate-x-1 hover:scale-105"
        >
          <BiChevronsLeft size={24} />
        </button>
      ) : null}
      <p className="flex items-center justify-center w-12 h-12 text-xl font-bold text-white rounded-full bg-gradient-to-r from-[#2B354D] to-[#6F649B] shadow-lg">
        {pageNumber}
      </p>
      {dataLength && dataLength > 0 ? (
        <button
          type="button"
          onClick={() => handleClick(pageNumber + 1)}
          className="flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-r from-[#8C63FF] to-[#6F649B] text-white shadow-lg transition-transform transform hover:translate-x-1 hover:scale-105"
        >
          <BiChevronsRight size={24} />
        </button>
      ) : null}
    </div>
  );
};

const Pagination = memo(MemoPagination);
export default Pagination;
