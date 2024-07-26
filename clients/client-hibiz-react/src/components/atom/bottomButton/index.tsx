import { memo } from "react";
import { cn } from "@hi/common";

interface ButtonConfig {
  text: string;
  onClick?: () => void;
  type?: "button" | "reset" | "submit";
}

const MemoBottomButton = (props: { buttons: ButtonConfig[] }) => {
  const { buttons } = props;

  return (
    <article
      className={cn(
        "absolute bottom-0 w-full px-4 py-2  bg-white lg:bg-transparent md:max-w-[30rem] md:left-4 md:right-0 md:mx-auto",
      )}
    >
      <div
        className={cn("flex", {
          "justify-between": buttons.length === 2,
          "justify-center": buttons.length !== 2,
        })}
      >
        {buttons.map((button, index) => (
          <button
            key={button.text}
            className={cn(
              "rounded-full  text-center py-3",
              {
                "bg-custom-gradient text-white":
                  index === 1,
                "bg-black text-white": index !== 1,
              },
              {
                "w-[48%]": buttons.length === 2,
                "w-[100%]": buttons.length !== 2,
              },
            )}
            onClick={button.onClick}
            type={button.type ?? "button"}
          >
            {button.text}
          </button>
        ))}
      </div>
    </article>
  );
};

const BottomButton = memo(MemoBottomButton);
export default BottomButton;
