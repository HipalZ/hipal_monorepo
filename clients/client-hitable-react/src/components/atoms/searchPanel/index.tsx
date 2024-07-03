import { useSearch } from '@/components/store/useSearch';
import { memo, useRef, useState } from 'react';
import { HiSearch } from 'react-icons/hi';
import { RxCross2 } from 'react-icons/rx';

interface ISearch {
  closeSearchBox?: () => void;
}
const SearchPanel = ({ closeSearchBox }: ISearch)=> {
  const panel = useRef(null);
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const { searchText, setSearchText } = useSearch();
  const [search, setSearchOpen] = useState(false);
  const togglePopover = (searchText = '') => {
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
    setSearchText('');
    closeSearchBox?.();
  };

  return (
    <div className="flex w-full flex-row" ref={panel}>
      <div
        className="max-w-screen !-mx-2 flex h-10 w-[110%] min-w-max flex-row justify-between space-x-2 overflow-hidden rounded-lg px-2 py-1.5 transition-all"
        onClick={() => togglePopover(searchText)}
      >
        <input
          autoFocus={true}
          type="text"
          placeholder="Search"
          className="w-full rounded-lg px-2 focus:border-none focus:outline-none"
          value={searchText}
          onChange={handleSearchTextChange}
          onClick={(e) => e.stopPropagation()}
          maxLength={50}
        />
        {searchText.length > 0 ? (
          <RxCross2 className="mx-2 my-auto h-5 w-4 cursor-pointer text-sm" onClick={handleClearSearchText} />
        ) : (
          <HiSearch
            className="mx-2 my-auto h-4 w-4 text-sm"
            onClick={(e: { stopPropagation: () => void }) => {
              e.stopPropagation();
              closeSearchBox?.();
            }}
          />
        )}
      </div>
    </div>
  );
}

const SearchPanelMemo = memo(SearchPanel);
export default SearchPanelMemo
