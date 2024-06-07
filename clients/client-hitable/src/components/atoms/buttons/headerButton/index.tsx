import React from 'react';

interface OnImgButtonProps extends React.HTMLAttributes<HTMLButtonElement> {
  /**
   * The content of the button.
   */
  children?: React.ReactNode;

  /**
   * The class name of the button.
   */
  className?: string;
}

function HeaderButton({ children, className, ...props }: OnImgButtonProps) {
  return (
    <button className={'bg-base-100 flex rounded-full border  px-4 py-2 text-sm' + className} {...props}>
      {children}
    </button>
  );
}

export default HeaderButton;
