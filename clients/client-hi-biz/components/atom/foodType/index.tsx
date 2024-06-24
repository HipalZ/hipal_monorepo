import Mixed from '@/assets/svg/Mixed.svg';
import Image from 'next/image';
import { memo, useEffect, useState } from 'react';

export type FOOD_TYPES = 'veg' | 'nonveg' | 'vegan' | 'egg' | 'other';

function FoodType({ type, hideText }: { type: FOOD_TYPES; hideText?: boolean }) {
  const [_type, setType] = useState('other');

  const classes = {
    veg: {
      border: 'border-green-500',
      circle: 'bg-green-500',
      text: 'text-green-500',
    },

    egg: {
      border: 'border-[#D2C903]',
      circle: 'bg-[#D2C903]',
      text: 'text-[#D2C903]',
    },
    nonveg: {
      border: 'border-red-500',
      circle: 'bg-red-500',
      text: 'text-red-500',
    },
    vegan: {
      border: 'border-[#02614b]',
      circle: 'bg-[#02614b]',
      text: 'text-[#02614b]',
    },
    other: {
      border: 'border-gray-500',
      circle: 'bg-gray-500',
      text: 'text-gray-500',
    },
  };

  useEffect(() => {
    type && Object.keys(classes)?.includes(type?.replace(/[^a-zA-Z ]/, '').toLowerCase()) && setType(type?.replace(/[^a-zA-Z ]/, '').toLowerCase());
  }, [type]);

  if (type.toLowerCase() === 'mixed') {
    return (
      <div className="-mb-2 -mt-2 flex flex-row">
        <Image src={Mixed} width={20} height={4} alt="mixed" />
      </div>
    );
  }

  return (
    <div className="my-auto flex shrink-0 flex-row space-x-2">
      <div className={'flex h-5 w-5 flex-row border-2 ' + classes[`${_type}`].border}>
        <div className={'m-auto h-[0.676rem] w-[0.676rem]  rounded-full p-1 ' + classes[`${_type}`].circle} />
      </div>
    </div>
  );
}

export default memo(FoodType);
