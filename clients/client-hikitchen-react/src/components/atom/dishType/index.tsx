type FoodTypeClasses = {
  [key: string]: {
    border: string;
    circle: string;
    text: string;
  };
};

export default function DishType({ type }: { type: any }) {
  const classes: FoodTypeClasses = {
    VEG: {
      border: 'border-green-500',
      circle: 'bg-green-500',
      text: 'text-green-500',
    },
    EGG: {
      border: 'border-orange-900',
      circle: 'bg-orange-900',
      text: 'text-orange-900',
    },
    NON_VEG: {
      border: 'border-red-500',
      circle: 'bg-red-500',
      text: 'text-red-500',
    },
    VEGAN: {
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

  // Check if the type value is valid, otherwise fallback to 'other'
  const typeClass = classes[type.toUpperCase()] || classes.other;

  return (
    <div className="my-auto mt-[0.0625rem] flex shrink-0 flex-row space-x-2">
      <div className={`flex h-[1.125rem] w-[1.125rem] flex-row border-2 ${typeClass.border}`}>
        <div className={`m-auto h-[0.4rem] w-[0.4rem] rounded-full p-[0.25rem] ${typeClass.circle}`} />
      </div>
    </div>
  );
}
