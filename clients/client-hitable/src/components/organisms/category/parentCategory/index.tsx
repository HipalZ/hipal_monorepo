import { useLogin } from '@/components/store/useLogin';
import { Disclosure } from '@headlessui/react';
import Link from 'next/link';
import { FiChevronDown } from 'react-icons/fi';

export default function ParentCategory({ parentCategory, closeModal }: { parentCategory: any; closeModal: () => void }) {
  const setChildId = useLogin((s) => s.setChildId);
  console.log(parentCategory);
  return (
    <div className="relative w-full px-4">
      {parentCategory.map((ele) => (
        <div key={ele._id} className="bg-base-100 px- mx-auto w-full max-w-md rounded-2xl">
          <Disclosure>
            {({ open }) => (
              <>
                <Disclosure.Button className="flex w-full justify-between rounded-2xl px-4 pt-4 text-left text-lg font-medium">
                  <div className="-ml-1 mt-[0.125rem] w-[80%]">{ele?.parentName}</div>
                  <span className="mr-1 mt-1">{ele?.childCate?.length > 0 ? ele.childCate.length : ' '}</span>
                  <FiChevronDown className={`${open ? 'rotate-180 transform' : ''} -mr-2 mt-2 h-5 w-5`} />
                </Disclosure.Button>
                {ele?.children?.map((child) => (
                  <Disclosure.Panel key={child?._id} className="py-2 text-sm text-gray-500 transition-all duration-300">
                    <div className="flex justify-between">
                      <Link href={`#${child._id}`} passHref>
                        <div
                          onClick={() => {
                            setChildId(child?._id);
                            closeModal();
                          }}
                          className="ml-[1.5rem]"
                        >
                          {child?.name}
                        </div>
                      </Link>
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
