import { memo } from "react";
import { HiLightBulb, HiSearch } from "react-icons/hi";
import QuickFilter from "@/components/atoms/quickFilter";

function Header({ categories }) {

  return (
    <div
      className={`bg-base-100 rounded-t-2xl pt-4 transition-transform duration-300
         z-50 sticky top-0 flex flex-col space-y-2 text-4xl py-4 
         `}
    >
      <div className="relative flex items-center justify-between w-full ">
        <h3 className="ml-4 text-2xl">Menu</h3>
        <div className="flex">
          <div className="flex items-center justify-around px-2">
            <div className="mt-1 mr-2">
              <QuickFilter />
            </div>
            <button
              type="button"
              className="btn btn-ghost bg-base-100 !h-8 !min-h-8 aspect-square !px-1 my-auto rounded-full"
            >
              <HiSearch size={30} className="text-lg text-primary" />
            </button>
          </div>

          <div className="hidden ml-2 ">
            <button
              type="button"
              className="btn btn-ghost bg-primary !h-8 !min-h-8 aspect-square !px-1 my-auto rounded-full"
            >
              <HiLightBulb className="text-lg text-primary-content" />
            </button>
          </div>
        </div>
      </div>
   </div>
  );
}

const MemoHeader = memo(Header);
export default MemoHeader;
