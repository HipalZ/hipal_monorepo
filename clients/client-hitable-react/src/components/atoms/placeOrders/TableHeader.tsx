import { memo, useCallback } from "react";
import useBusinessData from "@/components/store/useBusinessData";
import { useOrderStore } from "@/components/store/useOrderData";
import { SlidersHorizontal } from "lucide-react";

interface TableHeaderProps {
  width?: string;
}

const MemoTableHeader = ({ width = "30rem" }: TableHeaderProps) => {
  const outletInfo = useBusinessData((s) => s.outletInfo);
  const selectedTable = useOrderStore((s) => s.selectedTable);
  const setShowMoreOption = useOrderStore((s) => s.setShowMoreOption);

  const openOrderModalHandler = useCallback(() => {
    setShowMoreOption(true);
  }, [setShowMoreOption]);

  return (
    <div>
      <header
        className="fixed top-0 z-10 flex items-center justify-between w-full px-4 py-3 bg-white shadow-md"
        style={{ maxWidth: width }}
      >
        {/* Logo Section */}
        <section className="flex items-center space-x-2">
          <div className="w-[46px] h-[46px] rounded-full overflow-hidden">
            <img
              src={outletInfo?.logoUrl}
              alt="logo"
              className="object-cover w-full h-full"
            />
          </div>
          <h1 className="-ml-8 text-xl font-bold text-gray-800">
            {selectedTable?.name}
          </h1>
        </section>

        <section className="flex items-center space-x-6">
          <SlidersHorizontal
            onClick={openOrderModalHandler}
            className="w-6 h-6 text-[#8E24AA]"
          />
        </section>
      </header>
    </div>
  );
};

const TableHeader = memo(MemoTableHeader);
export default TableHeader;
