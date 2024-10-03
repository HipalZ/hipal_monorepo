import { useSearch } from "@/components/store/useSearch";
import { memo, useRef, useState } from "react";
import { HiSearch } from "react-icons/hi";
import { RxCross2 } from "react-icons/rx";

interface ISearch {
  closeSearchBox?: () => void;
}
const SearchPanel = ({ closeSearchBox }: ISearch) => {
  const panel = useRef(null);
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const { searchText, setSearchText } = useSearch((s) => ({
    searchText: s.searchText,
    setSearchText: s.setSearchText,
  }));
  const [search, setSearchOpen] = useState(false);
  const togglePopover = (searchText = "") => {
    if (searchText.length > 0) {
      if (!isPanelOpen) {
        setIsPanelOpen(true);
      }
    } else {
      setIsPanelOpen(false);
    }
  };

  const handleSearchTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchText(e.target.value);
    setSearchOpen(!search);
    togglePopover(e.target.value);
  };

  const handleClearSearchText = () => {
    setSearchText("");
    closeSearchBox?.();
  };

  return (
    <div className="flex flex-row w-full" ref={panel}>
      <div
        className="max-w-screen !-mx-2 flex h-10 w-[110%] min-w-max flex-row justify-between space-x-2 overflow-hidden rounded-lg px-2 py-1.5 transition-all"
        onClick={() => togglePopover(searchText)}
      >
        <input
          type="text"
          placeholder="Search"
          className="w-full px-2 rounded-lg focus:border-none focus:outline-none"
          value={searchText}
          onChange={handleSearchTextChange}
          onClick={(e) => e.stopPropagation()}
          maxLength={50}
        />
        {searchText.length > 0 ? (
          <RxCross2
            className="w-4 h-5 mx-2 my-auto text-sm cursor-pointer"
            onClick={handleClearSearchText}
          />
        ) : (
          <HiSearch
            className="w-4 h-4 mx-2 my-auto text-sm"
            onClick={(e: { stopPropagation: () => void }) => {
              e.stopPropagation();
              closeSearchBox?.();
            }}
          />
        )}
      </div>
    </div>
  );
};

const SearchPanelMemo = memo(SearchPanel);
export default SearchPanelMemo;
