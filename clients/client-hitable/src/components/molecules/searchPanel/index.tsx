import { useSearch } from '@/components/store/useSearch';
import React, { useState } from 'react';
import { HiX, HiSearch } from 'react-icons/hi';

function SearchComponent({ activeButton, onSearch }) {
  const [searchOpen, setSearchOpen] = useState(false);
  const search = useSearch((s) => s.searchText);
  const setSearch = useSearch((s) => s.setSearchText);
  const { isFocused, setIsFocused } = useSearch();
  const popOver = (search = "") => {
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
    setSearch("");
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
      className={`${activeButton.toLowerCase() === "status" ||
        activeButton.toLowerCase() === "settle"
        ? "hidden"
        : ""
        } relative flex justify-between items-center pb-1`}
    >

      <div className={`${search?.length === 0 && isFocused ? "w-[80%] mr-2" : "w-full"} `}>
        <label htmlFor="simple-search" className="sr-only">
          Search
        </label>
        <div className="relative">
          {searchOpen ? (
            <HiX className="absolute inset-y-0 w-4 h-4 text-primary/80 dark:text-primary flex items-center pointer-events-none top-[0.625rem] right-2" />
          ) : (
            <HiSearch className="absolute inset-y-0 w-4 h-4 text-primary/80 dark:text-primary flex items-center pointer-events-none top-[0.625rem] right-2" />
          )}
          <input
            onClick={searchClick}
            onFocus={() => setIsFocused(true)}
            onChange={handleInputChange}
            value={search}
            type="text"
            id="simple-search"
            className="border  border-gray-300 text-gray-900 text-sm rounded-xl focus:outline-none focus:border-primary block w-full pl-4 p-1.5"
            placeholder="Search"
            required
          />
        </div>
      </div>
      {search?.length === 0 && isFocused &&
        <button type="button" onClick={() => setIsFocused(false)} className="bg-base-100 text-base-content rounded-xl px-4 flex text-sm py-2 border on_active_bounce">
          Cancel
        </button >
      }
    </div>
  );
}

export default SearchComponent;
