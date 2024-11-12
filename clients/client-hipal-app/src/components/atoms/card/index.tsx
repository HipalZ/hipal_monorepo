import { memo } from "react";
import PlaceholderImg from "../placeholder";
import ShimmerImage from "../imageshimmer";

export interface ICard extends React.HTMLAttributes<HTMLButtonElement> {
  size: "lg";
  src: string;
  appendCardClassNames?: string;
  appendTextClassNames?: string;
  innerContentTop?: boolean;
  isOuterContent?: boolean;
  children?: React.ReactNode;
}

const Card = ({
  size,
  src,
  innerContentTop,
  isOuterContent,
  appendCardClassNames,
  appendTextClassNames,
  children,
  ...props
}: ICard) => {
  const defaultClasses = {
    mainCard:
      "py-1 prose relative overflow-hidden rounded-2xl mb-6 bg-base-100 border-0 capitalize",
    imageSize: "",
    innerContent:
      " px-3 w-full rounded-md capitalize font-normal truncate text-black flex  text-sm overflow-hidden ",
    outerContent: "w-full z-10 flex flex-row bg-base-200",
  };

  const classes = {
    lg: {
      mainCard: "w-[21rem] min-w-[90%] h-[21rem] mx-auto",
      imageSize: "",
      innerContent: `p-3 !h-full ${
        innerContentTop ? "items-start" : "items-end"
      } !text-xs`,
      outerContent: "px-3 py-1 bg-base-200",
    },
  };
  return (
    <button
      className={`${defaultClasses.mainCard} ${classes[size].mainCard} ${appendCardClassNames}`}
      {...props}
    >
      <div
        className={`${defaultClasses.imageSize} ${classes[size].imageSize} `}
      >
        {src?.length > 0 ? (
          <figure className="w-full max-w-[22rem] h-full max-h-[22rem]">
            <ShimmerImage
              src={src}
              quality={95}
              layout="fill"
              objectFit="cover"
              alt={src}
            />
          </figure>
        ) : (
          <PlaceholderImg />
        )}
      </div>
      <div
        className={`${
          isOuterContent ? "bg-base-200" : ""
        } absolute bottom-0 w-full h-[5.5rem] text-left`}
      >
        {children}
      </div>
    </button>
  );
};

const CardMemo = memo(Card);
export default CardMemo;
