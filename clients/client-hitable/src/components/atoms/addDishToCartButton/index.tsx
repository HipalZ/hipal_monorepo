import { useBottomPanel } from '@/components/store/useBottomPanel';
import React, { memo } from 'react';
import { AlertVariant } from '../alertVariant';

function AddDishToCartButton({
  children,
  onClick,
  appendClassNames = '',
  ...props
}: {
  appendClassNames?: string;
  onClick?: () => void;
  children: React.ReactNode;
} & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  const validationRef = useBottomPanel((state) => state.validationRef);
  const variantType = useBottomPanel((state) => state.variantType);
  const displayAlert = useBottomPanel((state) => state.displayAlert);

  return (
    <>
      <div className="bg-base-100 shadow-base-100 fixed bottom-0 z-20 w-full rotate-180 py-2 shadow-lg">
        <div className="mx-auto flex rotate-180 flex-col justify-items-center">
          {displayAlert && <AlertVariant />}
          <button
            className={
              `${
                validationRef || variantType === 'portion' ? 'bg-primary' : 'bg-primary opacity-50'
              } btn btn-md min-w-389 mx-auto my-auto min-h-[3rem] min-w-[95%] rounded-full !py-2 text-[1rem] font-semibold shadow-lg ` +
              appendClassNames
            }
            onClick={onClick}
            {...props}
          >
            {children}
          </button>
        </div>
      </div>
    </>
  );
}

export default memo(AddDishToCartButton);
