import { Disclosure } from "@headlessui/react";
import { FiChevronDown } from "react-icons/fi";
import { useLogin } from "@/components/store/useLogin";
interface ChildCategory {
  _id: string;
  name: string;
}

interface ParentCategoryType {
  _id: string;
  parentName: string;
  childCate?: any[]; 
  children?: ChildCategory[];
}

interface ParentCategoryProps {
  parentCategory: ParentCategoryType[];
  closeModal: () => void;
}
export default function ParentCategory({
  parentCategory,
  closeModal,
}:ParentCategoryProps) {
  const setChildId = useLogin((s) => s.setChildId);
  return (
    <div className="relative w-full px-4">
      {parentCategory.map((ele) => (
        <div
          key={ele._id}
          className="w-full max-w-md mx-auto bg-base-100 px- rounded-2xl"
        >
          <Disclosure>
            {({ open }) => (
              <>
                <Disclosure.Button className="flex justify-between w-full px-4 pt-4 text-lg font-medium text-left rounded-2xl">
                  <div className="w-[80%] mt-[0.125rem] -ml-1">{ele?.parentName}</div>
                  <span className="mt-1 mr-1">
                    {ele?.childCate && ele?.childCate?.length > 0 ? ele.childCate.length : " "}
                  </span>
                  <FiChevronDown
                    className={`${
                      open ? "rotate-180 transform" : ""
                    } h-5 w-5 mt-2 -mr-2`}
                  />
                </Disclosure.Button>
                {ele?.children?.map((child) => (
                  <Disclosure.Panel
                    key={child?._id}
                    className="py-2 text-sm text-gray-500 transition-all duration-300"
                  >
                    <div className="flex justify-between">
                      <a href={`#${child._id}`} >
                        <div
                          onClick={() => {
                            setChildId(child?._id);
                            closeModal();
                          }}
                          className="ml-[1.5rem]"
                        >
                          {child?.name}
                        </div>
                      </a>
                    </div>
                  </Disclosure.Panel>
                ))}
              </>
            )}
          </Disclosure>
        </div>
      ))}
    </div>
  );
}
