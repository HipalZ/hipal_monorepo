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
  // Destructure contentEditable from props to avoid passing it to the button
  const { contentEditable, ...buttonProps } = props;

  return (
    <button
      className={
        "flex px-4 text-sm py-2  border rounded-full bg-base-100 " + (className || "")
      }
      {...buttonProps} // Spread the remaining props excluding contentEditable
    >
      {children}
    </button>
  );
}

export default HeaderButton;