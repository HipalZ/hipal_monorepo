import Image from 'next/image';
import { memo, useEffect, useState } from 'react';
import Mixed from '../../../assets/svg/Mixed.svg';

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
      border: 'border-orange-900',
      circle: 'bg-orange-900',
      text: 'text-orange-900',
    },
    nonveg: {
      border: 'border-red-500',
      circle: 'bg-red-500',
      text: 'text-red-500',
    },
    nonveg: {
      border: 'border-red-500',
      circle: 'bg-red-500',
      text: 'text-red-500',
    },
    vegan: {
      border: 'border-yellow-500',
      circle: 'bg-yellow-500',
      text: 'text-yellow-500',
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

  if (type?.toLowerCase() === 'mixed') {
    return (
      <div className="flex flex-row">
        <Image src={Mixed} width={20} height={4} alt="mixed" />
      </div>
    );
  }

  return (
    <div className="my-auto flex shrink-0 flex-row space-x-2">
      <div className={'flex h-5 w-5 flex-row border-2 ' + classes[`${_type}`].border}>
        <div className={'m-auto h-[0.676rem] w-[0.676rem]  rounded-full p-1 ' + classes[`${_type}`].circle}></div>
      </div>

      {/* {!hideText && (
				<span
					className={
						' my-auto text-[0.813rem] leading-3 font-medium capitalize  ' + classes[`${_type}`].text
					}
				>
					{lowerCase(_type)}
				</span>
			)} */}
    </div>
  );
}

export default memo(FoodType);
