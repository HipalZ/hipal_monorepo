import { memo } from "react";

type Props = {
  layout: {
    _id: string;
    title: string;
    description: string;
    isButton: boolean;
    pattern?: string;
  };
};

const MemoSelectingCardLayout = (props: Props) => {
  const { layout } = props;

  return (
    <section className="w-48">
      <article className="mt-4 mb-2">
        <h6 className="text-[#807C83] text-base ml-2">{layout?.title}</h6>
        <h6 className="text-xs text-[#999999] w-48 leading-1 ml-2 mt-2">
          {layout?.description}
        </h6>
      </article>
    </section>
  );
};

const SelectingCardLayout = memo(MemoSelectingCardLayout);
export default SelectingCardLayout;
