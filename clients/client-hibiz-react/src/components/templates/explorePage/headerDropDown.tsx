import React, { lazy } from 'react'
import type { IBannerType } from './explorePageStore';
import { FaCaretDown } from 'react-icons/fa';
const Header = lazy(() => import('@/components/molecules/header'));

type Props = {
    handleChangeColors: () => void
    toggleDropDown: () => void
    isDropDownVisible: boolean
    bannerTypes: IBannerType[]
    handleOptionClick: (id: string) => void
}

const HeaderDropDown = (props:Props) => {
    const { handleChangeColors, toggleDropDown, isDropDownVisible, bannerTypes, handleOptionClick } = props
    return (
        <Header onBack={handleChangeColors} dropDown={
            <div className="relative">
                <label className='flex items-center text-lg font-medium text-gray-900'>
                    <span>Select Card Type</span>
                    <span onClick={toggleDropDown} className="ml-2 cursor-pointer">
                        <FaCaretDown />
                    </span>
                </label>
                {isDropDownVisible && (
                    <div className="absolute w-48 mt-2 bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5">
                        <ul className="p-2">
                            {bannerTypes.map((banner) => (
                                <li
                                    key={banner._id}
                                    onClick={() => handleOptionClick(banner._id)}
                                    className="p-2 text-lg cursor-pointer hover:bg-gray-100"
                                >
                                    {banner.title}
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
            </div>
        } isIconBusinessShow={false}>
        </Header>
    )
}

export default HeaderDropDown