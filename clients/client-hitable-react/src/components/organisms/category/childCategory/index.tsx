import { useEffect, useState } from "react";
import { IChildCategory } from "@/components/types/hiTableData";
import DishMenu from "../../dishMenu";
import { useLogin } from "@/components/store/useLogin";

export default function ChildCategory({
  childCategories,
  show,
}: {
  childCategories: IChildCategory[];
  show: boolean;
}) {
  const [openChild, setOpenChild] = useState("");
  const childId = useLogin((s) => s.childId);
  const setChildId = useLogin((s) => s.setChildId);

  useEffect(() => {
    if (childId) {
      setOpenChild(childId);
    }
  }, [childId]);
  useEffect(() => {
    if (childId) {
      const element = document.getElementById(childId);
      if (element) {
        const offsetTop = element.getBoundingClientRect().top;
        const offsetWithMargin = offsetTop - window.innerHeight * 0.3;
        window.scrollTo({ top: offsetWithMargin, behavior: "smooth" });
      }
    }
  }, [childId]);

  const toggleOpenChild = (id:string) => {
    setOpenChild(openChild === id ? "" : id);
    setChildId("");
  };

  return (
    <div className="relative w-full mt-6 masonry-layout pb-[5rem]">
      {childCategories?.map((category) => (
        <section
          id={category?._id}
          key={category?._id}
          className="masonry-item w-[85%] max-w-md mx-auto bg-base-100 rounded-2xl border border-[#cacaca]"
        >
          <div
            className="flex items-center justify-between w-full p-4 text-lg font-medium text-left rounded-2xl"
            onClick={() => toggleOpenChild(category?._id)}
          >
            <div className="w-[80%]">{category?.name}</div>
            <div>{category?.dishes?.length}</div>
          </div>
          {openChild === category?._id && (
            <div className="text-sm text-gray-500 transition-all duration-300">
              <div className="h-[0.125rem] bg-primary"></div>
              <DishMenu
                category={category?.dishes}
                show={show}
                categoryName={
                  category?.parentCategory
                    ? category?.parentCategory
                    : category?.name
                }
              />
            </div>
          )}
        </section>
      ))}
    </div>
  );
}
