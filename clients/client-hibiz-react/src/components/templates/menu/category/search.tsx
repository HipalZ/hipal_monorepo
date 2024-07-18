import useMenuPageStore from '@/components/store/useMenuStorage';
import { memo } from 'react';
import { FaTimes } from 'react-icons/fa';
import { HiSearch } from 'react-icons/hi';

const MemoSearch = () => {
    const { search, setSearch, searchVisible, setSearchVisible } = useMenuPageStore(s => ({
        search: s.search,
        setSearch: s.setSearch,
        searchVisible: s.searchVisible,
        setSearchVisible: s.setSearchVisible
    }));

    const toggleSearch = () => setSearchVisible(!searchVisible);

    const closeSearch = () => {
        setSearch('');
        setSearchVisible(false);
    };

    return (
        <>
            {
                !searchVisible && (
                    <div className="absolute top-[8rem] lg:top-[5rem] right-0 m-4 w-full lg:max-w-[21.5rem]">
                        <button type='button' onClick={toggleSearch} className="absolute text-lg right-8 top-2">
                            <HiSearch size={24} />
                        </button>
                    </div>
                )
            }

            {searchVisible && (
                <div className="absolute top-[8rem] lg:top-[5rem] my-4 right-0 w-[92%] lg:max-w-[21.5rem]">
                    <input
                        type="text"
                        placeholder="Search"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-[92%] p-2 border rounded-2xl"
                    />
                    <button type='button' onClick={closeSearch} className="absolute text-lg right-10 top-3">
                        <FaTimes />
                    </button>
                </div>
            )}
        </>
    )
}

const Search = memo(MemoSearch);

export default Search