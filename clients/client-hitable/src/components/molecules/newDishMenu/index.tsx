import DayOutPopup from '@/components/atoms/dayoutPopup';
import FoodType from '@/components/atoms/foodType';
import DishQuantityBtn from '@/components/organisms/dishDescription/dishQuantityButton';
import { useSearch } from '@/components/store/useSearch';
import { getPrice } from '@/components/utils/helpers';
import { isEmpty } from 'lodash';
import Image from 'next/image';
import { useState } from 'react';
import { BsExclamationCircle, BsQuestionCircle } from 'react-icons/bs';
import { MdFastfood, MdOutlineRiceBowl } from 'react-icons/md';

function NewDishMenu({ category, show }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDish, setSelectedDish] = useState<any>(null);
  const [image, setImage] = useState('');
  const search = useSearch((s) => s.searchText);
  const setSearch = useSearch((s) => s.setSearchText);
  const { setSearchHistory, setIsFocused, isFocused } = useSearch();
  const openModal = (dish) => {
    const pic = dish?.images?.[0];
    setIsModalOpen(true);
    setSelectedDish(dish);
    setImage(pic);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };
  const handleClearHistory = () => {
    setSearchHistory({});
    setSearch('');
    setIsFocused(false);
  };
  return (
    <div>
      {' '}
      <div className={`pb-[5rem] ${show ? 'masonry-layout mt-4 px-6' : ''} flex flex-col`}>
        {category?.map((dish: any) => (
          <div
            className={`${!dish.availability ? 'bg-gray-100' : 'bg-base-100'} relative flex justify-between px-4 py-3  ${
              show ? 'masonry-item rounded-xl border border-[#cacaca]' : ''
            } `}
            key={dish?.id}
          >
            <div className="mr-2">
              <FoodType type={dish?.dishType} />
            </div>
            <div className="w-[70%]">
              <div className="text-base-content text-[1rem] leading-[1.25rem]">{dish?.name}</div>
              <div className="text-base-content/40 mt-2 text-[1rem] leading-[1.25rem]">₹ {dish?.price}</div>
              <div onClick={() => openModal(dish)} className="text-primary mt-2 flex text-[1rem] font-normal capitalize leading-[1.25rem]">
                <BsQuestionCircle className="mr-1 mt-[0.125rem]" />
                info
                {!dish.availability && (
                  <span className="ml-2 flex items-center text-blue-500">
                    <BsExclamationCircle className="mr-1" />
                    Not Available
                  </span>
                )}
              </div>
            </div>
            <div className="mt-6">
              <DishQuantityBtn dishData={dish} categoryName={dish.parentCategoryName} />
            </div>
          </div>
        ))}
        {search?.length === 0 && isFocused && (
          <div className="mb-4 flex self-center">
            <button
              onClick={handleClearHistory}
              type="button"
              className="bg-base-100 text-base-content on_active_bounce flex rounded-xl border px-4 py-2 text-sm"
            >
              Clear All History
            </button>
          </div>
        )}
      </div>
      {
        <DayOutPopup show={isModalOpen} onClose={closeModal}>
          <div className="relative max-h-[30rem] min-h-[30rem] rounded-b-2xl">
            <div className="text-base-content fixed left-0 right-0 top-0 ml-2 mt-2 px-4 py-2 text-[1rem] font-[500] capitalize leading-[1.25rem]">
              Dish description
            </div>
            <div className="hide-scrollbar absolute inset-0 top-12 max-h-[30rem] overflow-y-auto pb-4">
              {image && (
                <div className="mx-4 mt-4 flex h-[18rem] justify-center">
                  <Image
                    layout={'intrinsic'}
                    alt="dish"
                    quality={95}
                    width={350}
                    height={200}
                    objectFit="cover"
                    className="!w-128 !h-128 overflow-hidden rounded-xl"
                    src={image}
                  />
                </div>
              )}

              <div className="text-base-content mx-4 mt-4 text-xl font-[500] capitalize">{selectedDish?.name}</div>
              <div className=" text-base-content mx-4 mt-4 flex text-[1rem] leading-[1.25rem]">
                <FoodType type={selectedDish?.dishType} />
                <div className="ml-2 capitalize">{selectedDish?.dishType}</div>
              </div>
              {!isEmpty(selectedDish?.avgTime) && (
                <div className="text-base-content mx-4 mt-4 text-base capitalize">Average time {selectedDish?.avgTime} minutes(running on delay)</div>
              )}
              <div className="text-base-content/40 mx-4 mt-2 line-clamp-3 text-base">{selectedDish?.description}</div>
              {!isEmpty(selectedDish?.portions) && (
                <div className="mx-4 flex flex-col space-y-2">
                  <div className="text-primary flex flex-row gap-2 text-base">
                    <MdOutlineRiceBowl className="my-auto" />
                    <h4 className="my-auto">{selectedDish?.portions.length} Portions available</h4>
                  </div>

                  <div className="divide-base-content bg-base-content/10 flex w-full flex-row flex-wrap gap-px">
                    {selectedDish?.portions.map((portion, key) => (
                      <div
                        key={key}
                        className={'bg-base-100 mx-auto flex min-w-[22%] max-w-full flex-grow flex-col space-y-1 p-2 text-center text-base'}
                      >
                        <span className="text-base-content text-base font-normal">{portion?.name}</span>
                        <span className="text-base-content/60 text-xs font-normal">{getPrice(portion?.price)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {!isEmpty(selectedDish?.extras?.[0]?.items) && (
                <div className="mx-4 flex flex-col space-y-2">
                  <div className="text-primary flex flex-row gap-4 text-base">
                    <MdOutlineRiceBowl className="my-auto" />
                    <h4 className="my-auto">Extras available</h4>
                  </div>
                  {selectedDish?.extras.map((extra, key) => (
                    <div key={extra?.name} className="space-y-3">
                      <h6 className="text-base ">
                        {key + 1}. {extra?.name}
                      </h6>
                      <ul className="border-base-content/20 flex flex-row flex-wrap gap-5 rounded-lg border px-4 py-2">
                        {extra?.items.map((item) => (
                          <li key={item?.name} className="text-base-content/40 mx-auto flex min-w-fit flex-row gap-2 text-sm font-normal">
                            <MdFastfood className="my-auto inline-flex" />
                            <span className="my-auto">{item?.name}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </DayOutPopup>
      }
    </div>
  );
}

export default NewDishMenu;
