import { memo } from "react";
import { cn } from "@hi/common";

interface ButtonConfig {
  text: string;
  onClick?: () => void;
  type?: "button" | "reset" | "submit";
  isLoading?: boolean;
  delete?: boolean;
}

const MemoBottomButton = (props: { buttons: ButtonConfig[] }) => {
  const { buttons } = props;

  return (
    <article
      className={cn(
        "absolute bottom-0 w-full px-4 py-2 bg-white lg:bg-transparent md:max-w-[30rem] md:left-4 md:right-0 md:mx-auto",
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
              "rounded-full text-center py-3",
              button?.isLoading ? "pointer-events-none" : "",
              {
                "bg-red-500 text-white": button.delete,
                "bg-custom-gradient text-white": !button.delete && index === 1,
                "bg-black text-white": !button.delete && index !== 1,
              },
              {
                "w-[48%]": buttons.length === 2,
                "w-[100%]": buttons.length !== 2,
              },
            )}
            onClick={button.onClick}
            type={button.type ?? "button"}
          >
            {button.isLoading ?? false ? (
              <svg
                className="w-5 h-5 mx-auto text-white animate-spin"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                ></path>
              </svg>
            ) : (
              button.text
            )}
          </button>
        ))}
      </div>
    </article>
  );
};

const BottomButton = memo(MemoBottomButton);
export default BottomButton;
