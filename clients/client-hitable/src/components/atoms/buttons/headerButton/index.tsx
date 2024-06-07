import React from "react";

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
    <button
      className={
        "flex px-4 text-sm py-2  border rounded-full bg-base-100" +
        className
      }
      {...props}
    >
      {children}
    </button>
  );
}

export default HeaderButton;
