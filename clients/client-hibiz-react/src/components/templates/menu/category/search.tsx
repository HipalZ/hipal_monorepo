import useMenuPageStore from '@/components/store/useMenuStorage';
import { memo } from 'react';
import { FaTimes } from 'react-icons/fa';
import { HiSearch } from 'react-icons/hi';

const MemoSearch = () => {
  const { search, setSearch, searchVisible, setSearchVisible } = useMenuPageStore((s) => ({
    search: s.search,
    setSearch: s.setSearch,
    searchVisible: s.searchVisible,
    setSearchVisible: s.setSearchVisible,
  }));

  const toggleSearch = () => setSearchVisible(!searchVisible);

  const closeSearch = () => {
    setSearch('');
    setSearchVisible(false);
  };

  return (
    <>
      {!searchVisible && (
        <div className="absolute right-0 top-[8rem] mx-4 mt-2 w-full lg:top-[5rem] lg:max-w-[21.5rem]">
          <button type="button" onClick={toggleSearch} className="absolute right-8 top-2 text-lg">
            <HiSearch size={24} />
          </button>
        </div>
      )}

      {searchVisible && (
        <div className="absolute right-2 top-[8rem] my-4 w-[92%] lg:right-4 lg:top-[5rem] lg:max-w-[21.5rem]">
          <input
            type="text"
            placeholder="Search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-[92%] rounded-2xl border p-2"
          />
          <button type="button" onClick={closeSearch} className="absolute right-10 top-3 text-lg">
            <FaTimes />
          </button>
        </div>
      )}
    </>
  );
};

const Search = memo(MemoSearch);

export default Search;
