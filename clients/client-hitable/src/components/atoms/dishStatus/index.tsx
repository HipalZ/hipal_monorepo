import { IStatus } from '@/components/types/hiTableData';
import React from 'react';
import { BiBowlRice } from 'react-icons/bi';
import { MdDelete } from 'react-icons/md';

interface DishStatusProps {
  selectedDishStatus: IStatus | null;
}

const DishStatusComponent: React.FC<DishStatusProps> = ({ selectedDishStatus }) => {
  if (!selectedDishStatus || !selectedDishStatus.dishStatus) {
    return null;
  }

  const statusConfig = {
    delivered: {
      bgColor: '#DBFFE2',
      iconColor: '#00BA34',
      textColor: '#00BA34',
      text: 'delivered',
      icon: <BiBowlRice className="text-base-100" />,
    },
    cooked: {
      bgColor: '#E0EBFF',
      iconColor: '#5591FF',
      textColor: '#5591FF',
      text: 'cooked',
      icon: <BiBowlRice className="text-base-100" />,
    },
    deleted: {
      bgColor: '#F5E5E5',
      iconColor: '#F04B4B',
      textColor: '#F04B4B',
      text: 'deleted',
      icon: <MdDelete className="text-base-100" />, // new icon added here
    },
    default: {
      bgColor: '#FFF6DB',
      iconColor: '#FFC318',
      textColor: '#FFC318',
      text: 'cooking',
      icon: <BiBowlRice className="text-base-100" />, // default icon added here
    },
  };

  let config = statusConfig[selectedDishStatus.dishStatus] || statusConfig.default;

  if (selectedDishStatus?.isDeleted) {
    config = statusConfig.deleted;
  }

  return (
    <div className="mt-2">
      <button type="button" className="relative rounded-full px-2 font-normal text-black" style={{ backgroundColor: config.bgColor }}>
        <div className="inline-flex items-center justify-start">
          <div className="flex h-[1.5rem] w-[1.5rem] items-center justify-center rounded-full" style={{ backgroundColor: config.iconColor }}>
            {config.icon}
          </div>
          <div className="mb-[0.1rem] ml-2 mr-4 pl-1 pr-1 text-lg font-[500] capitalize" style={{ color: config.textColor }}>
            {config.text}
          </div>
        </div>
      </button>
    </div>
  );
};

export default DishStatusComponent;
