import { useSearch } from '@/components/store/useSearch'
import { memo, useRef, useState } from 'react'
import { HiSearch } from 'react-icons/hi'
import { RxCross2 } from "react-icons/rx";

interface ISearch{
    closeSearchBox?:()=>void
}
function SearchPanel({ closeSearchBox }: ISearch) {
    const panel = useRef(null)
    const [isPanelOpen, setIsPanelOpen] = useState(false)
    const { searchText, setSearchText } = useSearch()

    const [search, setSearchOpen] = useState(false)
    const togglePopover = (searchText = '') => {
        if (searchText.length > 0) {
            if (!isPanelOpen) {
                setIsPanelOpen(true)
            }
        } else {
            setIsPanelOpen(false)
        }
    }

    const handleSearchTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchText(e.target.value)
        setSearchOpen(!search)
        togglePopover(e.target.value)
    }

    const handleClearSearchText = () => {
        setSearchText('')
    }

    return (
        <div className='flex flex-row w-full' ref={panel}>
            <div
                className='h-10 max-w-screen flex flex-row justify-between w-[110%] min-w-max px-2 py-1.5 !-mx-2 space-x-2 overflow-hidden transition-all rounded-lg z-50 '
                onClick={() => togglePopover(searchText)}
            >
                <input
                    autoFocus={true}
                    type='text'
                    placeholder='Search'
                    className='w-full px-2 rounded-lg focus:outline-none focus:border-none'
                    value={searchText}
                    onChange={handleSearchTextChange}
                    onClick={(e) => e.stopPropagation()}
                    maxLength={50}
                />
                {searchText.length > 0 ? (
                    <RxCross2
                        className='w-4 h-5 mx-2 my-auto text-sm cursor-pointer'
                        onClick={handleClearSearchText}
                    />
                ) : (
                    <HiSearch
                        className='w-4 h-4 mx-2 my-auto text-sm'
                        onClick={(e: { stopPropagation: () => void; }) => {
                            e.stopPropagation();
                            closeSearchBox?.();
                        }}
                    />
                )}
            </div>
        </div>
    )
}

export default memo(SearchPanel)
