import Hi from '@/assets/svg/hi.svg';
import Header from '@/components/molecules/header';
import { useOwnerLogin } from '@/components/store/useOwnerLogin';
import { useSelectedIcon } from '@/components/store/useSelectedIcon';
import { memo, useState } from 'react';
import { FaArrowLeft } from 'react-icons/fa';

const menuOptions = [
  {
    text: 'Dine In',
  },
  {
    text: 'Take Away',
  },
  {
    text: 'Delivery',
  },
];

function Menu() {
  const [activeIndex, setActiveIndex] = useState(0);
  const setSelectedIcon = useSelectedIcon((s) => s.setSelectedIcon);
  const user = useOwnerLogin((s) => s.user);

  function handleOptionSelect(text: string, index: number) {
    setActiveIndex(index);
    setSelectedIcon(text);
  }
  return (
    <>
      <div className="sticky top-0 z-20 linear_gradient_background">
        <Header
          title="Menu"
          onBack={() => setSelectedIcon('')}
          leftIcon={<FaArrowLeft />}
          centerImage={Hi}
          rightImage={Hi}
          isIconBusinessShow={user.role !== 'RESTAURANT_MANAGER'}
        />
        <div className="mt-6 flex items-center justify-between  px-6 pb-4">
          <div className="flex text-2xl">
            <span className="ml-2">Menu</span>
          </div>
          <button type="button" className="rounded-xl bg-[#000000] px-4 py-2 text-sm text-white">
            + Add Menu
          </button>
        </div>
      </div>
      <div className="mx-6 mt-5">
        {menuOptions.map((item, index) => {
          return (
            <h1
              onKeyDown={() => handleOptionSelect(item.text, index)}
              onClick={() => handleOptionSelect(item.text, index)}
              key={index.toString()}
              className={`${
                index === activeIndex ? 'bg-[#000000] text-white' : 'border-1 border text-gray-200'
              } my-4 cursor-pointer rounded-lg px-4  py-5 text-xl`}
            >
              {item.text}
            </h1>
          );
        })}
      </div>
    </>
  );
}

export default memo(Menu);
