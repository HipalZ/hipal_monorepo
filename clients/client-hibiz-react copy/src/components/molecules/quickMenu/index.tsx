import axios from '@/axios';
import useItemStore from '@/components/store/useItemStore';
import { type ICategory } from '@/components/types/businessData';
import { memo } from 'react';
import { IoIosCheckbox } from 'react-icons/io';
import { MdOutlineCategory, MdOutlineCheckBoxOutlineBlank } from 'react-icons/md';

const QuickMenuContent = ({ searchText }: { searchText: string }) => {
  const { data, setData } = useItemStore();

  const handleToggle = async (id: string, field: 'visibility' | 'availability', currentValue: boolean, type: 'dish' | 'category') => {
    let endpoint = '';
    let updatedData = {};

    if (type === 'dish') {
      endpoint = `/v1/dishes/${id}`;
      const updatedDishes = data.dishes?.map((dish) => (dish._id === id ? { ...dish, [field]: !currentValue } : dish));
      updatedData = { dishes: updatedDishes };
    } else if (type === 'category') {
      endpoint = `/v1/categories/${id}`;
      const updatedCategories = data.categories?.map((category) => (category._id === id ? { ...category, [field]: !currentValue } : category));
      updatedData = { categories: updatedCategories };
    }

    setData((prevData) => ({ ...prevData, ...updatedData }));

    try {
      const payload = { [field]: !currentValue };
      await axios.put(endpoint, payload);
    } catch (error) {
      console.error('Error updating:', error);
      setData((prevData) => ({ ...prevData }));
    }
  };

  return (
    <div className="masonry-layout mt-6 px-6 pb-[5rem]">
      {data?.categories?.map((category: ICategory) => (
        <div key={category._id} className="masonry-item rounded-md border border-[#cacaca] p-4">
          <div className="mb-4">
            <div className="mb-4 flex items-center justify-start space-x-2 rounded-md bg-[#000000] py-2 pl-4 pr-8">
              <MdOutlineCategory className="text-xl text-white" />
              <h2 className="font-medium text-white">{category.name}</h2>
            </div>
            <label className="mb-2 flex cursor-pointer items-center justify-between">
              Visibility
              <input
                type="checkbox"
                checked={category.visibility}
                onChange={() => handleToggle(category._id, 'visibility', category.visibility, 'category')}
                className="sr-only"
              />
              {category.visibility ? <IoIosCheckbox className="text-2xl text-[#000000] " /> : <MdOutlineCheckBoxOutlineBlank className="text-2xl" />}
            </label>
            <label className="mb-2 flex cursor-pointer items-center justify-between">
              Availability
              <input
                type="checkbox"
                checked={category.availability}
                onChange={() => handleToggle(category._id, 'availability', category.availability, 'category')}
                className="sr-only"
              />
              {category.availability ? (
                <IoIosCheckbox className="text-2xl text-[#000000] " />
              ) : (
                <MdOutlineCheckBoxOutlineBlank className="text-2xl" />
              )}
            </label>
          </div>
          <div className="space-y-4">
            {category?.dishes ? (
              category?.dishes
                .filter((catDish) =>
                  data.dishes?.some((dish) => dish?._id === catDish?._id && dish?.name?.toLowerCase().includes(searchText?.toLowerCase())),
                )
                .map((catDish) => {
                  const dish = data?.dishes?.find((d) => d?._id === catDish?._id);
                  return dish ? (
                    <div key={dish._id} className="flex flex-col rounded-md border border-[#cacaca] p-4">
                      <span className="mb-2 font-semibold">{dish?.name}</span>
                      <label className="mb-2 flex cursor-pointer items-center justify-between">
                        Visibility
                        <input
                          type="checkbox"
                          checked={dish?.visibility}
                          onChange={() => handleToggle(dish._id, 'visibility', dish?.visibility, 'dish')}
                          className="sr-only"
                        />
                        <div className="">
                          {dish?.visibility ? (
                            <IoIosCheckbox className="text-2xl text-[#000000] " />
                          ) : (
                            <MdOutlineCheckBoxOutlineBlank className="text-2xl" />
                          )}
                        </div>
                      </label>
                      <label className="mb-2 flex cursor-pointer items-center justify-between">
                        Availability
                        <input
                          type="checkbox"
                          checked={dish?.availability}
                          onChange={() => handleToggle(dish._id, 'availability', dish?.availability, 'dish')}
                          className="sr-only"
                        />
                        <div className="">
                          {dish?.availability ? (
                            <IoIosCheckbox className="text-2xl text-[#000000] " />
                          ) : (
                            <MdOutlineCheckBoxOutlineBlank className="text-2xl" />
                          )}
                        </div>
                      </label>
                    </div>
                  ) : null;
                })
            ) : (
              <p>No data </p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default memo(QuickMenuContent);
