import { useSearch } from '@/components/store/useSearch';
import { useState } from 'react';
import { HiSearch, HiX } from 'react-icons/hi';

function SearchComponent({ activeButton, onSearch }) {
  const [searchOpen, setSearchOpen] = useState(false);
  const search = useSearch((s) => s.searchText);
  const setSearch = useSearch((s) => s.setSearchText);
  const { isFocused, setIsFocused } = useSearch();
  const popOver = (search = '') => {
    if (search.length > 0) {
      if (!searchOpen) {
        setSearchOpen(true);
      }
    } else {
      setSearchOpen(false);
    }
  };

  const searchClick = () => {
    setSearchOpen(!searchOpen);
    setSearch('');
  };

  const handleInputChange = (e) => {
    const value = e.target.value;
    if (value.length > 0) {
      setIsFocused(true);
    }
    setSearch(value);
    popOver(value);
    if (onSearch) {
      onSearch(value);
    }
  };
  return (
    <div
      className={`${
        activeButton.toLowerCase() === 'status' || activeButton.toLowerCase() === 'settle' ? 'hidden' : ''
      } relative flex items-center justify-between pb-1`}
    >
      <div className={`${search?.length === 0 && isFocused ? 'mr-2 w-[80%]' : 'w-full'} `}>
        <label htmlFor="simple-search" className="sr-only">
          Search
        </label>
        <div className="relative">
          {searchOpen ? (
            <HiX className="text-primary/80 dark:text-primary pointer-events-none absolute inset-y-0 right-2 top-[0.625rem] flex h-4 w-4 items-center" />
          ) : (
            <HiSearch className="text-primary/80 dark:text-primary pointer-events-none absolute inset-y-0 right-2 top-[0.625rem] flex h-4 w-4 items-center" />
          )}
          <input
            onClick={searchClick}
            onFocus={() => setIsFocused(true)}
            onChange={handleInputChange}
            value={search}
            type="text"
            id="simple-search"
            className="focus:border-primary  block w-full rounded-xl border border-gray-300 p-1.5 pl-4 text-sm text-gray-900 focus:outline-none"
            placeholder="Search"
            required
          />
        </div>
      </div>
      {search?.length === 0 && isFocused && (
        <button
          type="button"
          onClick={() => setIsFocused(false)}
          className="bg-base-100 text-base-content on_active_bounce flex rounded-xl border px-4 py-2 text-sm"
        >
          Cancel
        </button>
      )}
    </div>
  );
}

export default SearchComponent;
