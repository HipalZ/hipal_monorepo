import { useLogin } from '@/components/store/useLogin';
import { IChildCategory } from '@/components/types/hiTableData';
import { useEffect, useState } from 'react';
import DishMenu from '../../dishMenu';

export default function ChildCategory({ childCategories, show }: { childCategories: IChildCategory[]; show: boolean }) {
  const [openChild, setOpenChild] = useState('');
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
        window.scrollTo({ top: offsetWithMargin, behavior: 'smooth' });
      }
    }
  }, [childId]);

  const toggleOpenChild = (id) => {
    setOpenChild(openChild === id ? '' : id);
    setChildId('');
  };

  return (
    <div className="masonry-layout relative mt-6 w-full pb-[5rem]">
      {childCategories?.map((category, index) => (
        <section id={category?._id} key={index} className="masonry-item bg-base-100 mx-auto w-[85%] max-w-md rounded-2xl border border-[#cacaca]">
          <div
            className="flex w-full items-center justify-between rounded-2xl p-4 text-left text-lg font-medium"
            onClick={() => toggleOpenChild(category?._id)}
          >
            <div className="w-[80%]">{category?.name}</div>
            <div>{category?.dishes?.length}</div>
          </div>
          {openChild === category?._id && (
            <div className="text-sm text-gray-500 transition-all duration-300">
              <div className="bg-primary h-[0.125rem]"></div>
              <DishMenu category={category?.dishes} show={show} categoryName={category?.parentCategory ? category?.parentCategory : category?.name} />
            </div>
          )}
        </section>
      ))}
    </div>
  );
}
