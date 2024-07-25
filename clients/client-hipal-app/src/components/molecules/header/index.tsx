import { useRouter } from "next/navigation";
import { memo, useEffect, useState } from "react";
import { FiChevronLeft, FiX } from "react-icons/fi";
import { HiLightBulb, HiSearch } from "react-icons/hi";
import SearchPanel from "../searchPanel";
import QuickFilter from "@/components/atoms/quickFilter";
import type { ICategory } from "@/components/types/businessData";

function Header({
  hideBackBtn: _hideBackBtn,
  onBack,
  backURL,
  title,
  tag,
  showOtherButtons,
  otherButtons,
  children,
  categories,
}: {
  hideBackBtn?: boolean;
  onBack?: () => void;
  backURL?: string;
  title?: string | JSX.Element | (({ isRounded }: { isRounded: boolean }) => JSX.Element);
  tag?: string;
  showOtherButtons?: boolean;
  otherButtons?: JSX.Element;
  children?: JSX.Element;
  categories?: ICategory[];
}) {
  const router = useRouter();
  const [state, setState] = useState({
    showSearchBox: title ? false : true,
  });
  const [isHeaderVisible, setIsHeaderVisible] = useState(true);

  

  const closeSearchBox = () => {
    if (!title) {
      return;
    }
    setState({ ...state, showSearchBox: false });
  };

  const openSearchBox = () => {
    if (!title) {
      return;
    }
    setState({ ...state, showSearchBox: true });
  };

  const _onBack = () => {
    if (onBack) {
      onBack();
    } else {
      router.back();
  };
}

  const CustomTag = tag ? (`${tag}` as React.ElementType) : ("h4" as React.ElementType);


  return (
    <div
      className={`bg-base-100 transition-transform duration-300 z-50 sticky top-0 flex flex-col ${isHeaderVisible ? 'translate-y-0' : '-translate-y-full'} space-y-2 text-4xl py-4`}
    >
      <div className="relative flex w-full">
        <div className="flex w-full">
          <button
            type="button"
            className="swap swap-rotate my-auto btn btn-ghost !h-8 !min-h-8 aspect-square !px-0 py-0 rounded-full"
            onClick={() => {
              if (title) {
                state.showSearchBox ? closeSearchBox() : _onBack();
              } else {
                _onBack();
              }
            }}
          >
            {title ? (
              <>
                <input type="checkbox" className="hidden" defaultChecked={!state.showSearchBox} />
                <FiChevronLeft className="text-2xl swap-on text-primary" />
                <FiX className="text-2xl swap-off text-primary" />
              </>
            ) : (
              <FiChevronLeft className="text-2xl text-primary" />
            )}
          </button>

          {!state.showSearchBox && title ? (
            <div className="my-auto prose capitalize">
              <CustomTag>
                {typeof title === "function"
                  ? title({ isRounded: false })
                  : title}
              </CustomTag>
            </div>
          ) : (
            <SearchPanel closeSearchBox={closeSearchBox} categories={categories || []} />
          )}
        </div>

        {!state.showSearchBox && otherButtons && otherButtons}
        {showOtherButtons && (
          <div className="flex flex-row">
            {!state.showSearchBox && (
              <div className="flex items-center justify-around px-2">
                <div className="mt-1 mr-2">
                  <QuickFilter />
                </div>
                <button
                  type="button"
                  className="btn btn-ghost bg-base-100 !h-8 !min-h-8 aspect-square !px-1 my-auto  rounded-full"
                  onClick={openSearchBox}
                >
                  <HiSearch size={30} className="text-lg text-primary" />
                </button>
              </div>
            )}

            <div className="hidden ml-2 ">
              <button type="button" className="btn btn-ghost bg-primary !h-8 !min-h-8 aspect-square !px-1 my-auto  rounded-full">
                <HiLightBulb className="text-lg text-primary-content" />
              </button>
            </div>
          </div>
        )}
      </div>
      {children && <div>{children}</div>}
    </div>
  );
}

const MemoHeader = memo(Header);
export default MemoHeader;
