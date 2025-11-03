import BottomButton from '@/components/atom/bottomButton';
import useBusinessData from '@/components/store/useBusinessData';
import useMenuPageStore from '@/components/store/useMenuStorage';
import { foodTypes } from '@/components/utils/helper';
import { Listbox, ListboxButton, ListboxOption, ListboxOptions, Transition } from '@headlessui/react';
import { Trash2 } from 'lucide-react';
import { type ChangeEvent, type DragEvent, Fragment, memo, useState } from 'react';
import { CheckmarkIcon } from 'react-hot-toast';
import { IoMdArrowDropdown } from 'react-icons/io';

type Section = {
  portionTypes: ('VEG' | 'NON_VEG' | 'EGG' | 'VEGAN')[];
  name: string;
  price: number;
  default: boolean;
};

type ExtendedSection = Section & {
  [key: string]: any;
};
const MemoPortionStep = () => {
  const { setPortions, setDishStep, portions, dishPrice } = useMenuPageStore((state) => ({
    setPortions: state.setPortions,
    setDishStep: state.setDishStep,
    portions: state.portions,
    dishPrice: state.dishPrice,
  }));

  const outLetType = useBusinessData((s) => s.outletInfo?.outLetType);

  const [sections, setSections] = useState(
    portions.map((p) => ({
      ...p,
    })) ?? [
      {
        portionTypes: [foodTypes[0].name],
        name: '',
        price: dishPrice || 0,
        default: true,
      },
    ],
  );

  const addSection = () => {
    setSections([
      ...sections,
      {
        portionTypes: [foodTypes[0].name],
        name: '',
        price: 0,
        default: false,
      },
    ]);
  };

  const handleDelete = (index: number) => {
    if (sections.length <= 1) return;
    const newSections = sections.filter((_, i) => i !== index);
    newSections.forEach((section, idx) => {
      section.default = idx === 0;
    });
    setSections(newSections);
  };

  const handleSelectionChange = (index: number, newValue) => {
    const newSections = [...sections];
    newSections[index].portionTypes = [newValue.name];
    setSections(newSections);
  };

  const handleInputChange = (index: number, event: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;

    if (name === 'price' && Number.isNaN(Number(value))) {
      return;
    }

    const newSections: ExtendedSection[] = [...sections];
    newSections[index][name] = name === 'price' ? Number(value) : value;
    if (index === 0) {
      newSections.forEach((section, idx) => {
        section.default = idx === 0;
      });
    }
    setSections(newSections);
  };

  const handleSave = () => {
    setPortions(structuredClone(sections));
    setDishStep('DISH_STEP_1');
  };

  const handleDragStart = (event: DragEvent<HTMLElement>, index: number) => {
    event.dataTransfer.setData('text/plain', index.toString());
  };

  const handleDragOver = (event: DragEvent<HTMLElement>) => {
    event.preventDefault();
  };

  const handleDrop = (event: DragEvent<HTMLElement>, dropIndex: number) => {
    event.preventDefault();
    const dragIndex = Number(event.dataTransfer.getData('text/plain'));
    if (dragIndex !== dropIndex) {
      const newSections = [...sections];
      [newSections[dragIndex], newSections[dropIndex]] = [newSections[dropIndex], newSections[dragIndex]];
      setSections(newSections);
    }
  };

  return (
    <section className="mx-6 rounded-2xl lg:mx-16 lg:mt-6">
      <p className="mb-2 text-sm text-gray-500">Click to edit Drag to rearrange</p>
      {sections.map((section, index) => (
        <article
          key={index.toString()}
          className="my-2 rounded-t-2xl bg-white p-3"
          draggable="true"
          onDragStart={(event) => handleDragStart(event, index)}
          onDragOver={handleDragOver}
          onDrop={(event) => handleDrop(event, index)}
          role="button"
          tabIndex={0}
        >
          <Listbox
            value={foodTypes.find((type) => section.portionTypes.includes(type.name))}
            onChange={(newValue) => handleSelectionChange(index, newValue)}
          >
            {({ open }) => (
              <div className="relative mt-1">
                <section className="flex items-center">
                  {outLetType === 'OTHER' ? null : (
                    <ListboxButton className="listbox-button relative flex cursor-pointer items-center rounded-lg bg-white py-2 text-left sm:text-sm">
                      <span className="flex items-center">
                        <img
                          src={foodTypes.find((type) => section.portionTypes.includes(type.name))?.icon}
                          alt="icon"
                          className="mr-1 h-6 w-6 flex-shrink-0"
                        />
                        <IoMdArrowDropdown className="mr-1 h-6 w-6 text-gray-400" aria-hidden="true" />
                      </span>
                    </ListboxButton>
                  )}
                  <input
                    type="text"
                    id={`name-${index}`}
                    name="name"
                    placeholder="Enter Portion Name"
                    maxLength={50}
                    minLength={3}
                    required
                    value={section.name}
                    onChange={(e) => handleInputChange(index, e)}
                    className="flex-1 rounded-xl border border-black p-2 focus:border-indigo-500 focus:outline-none focus:ring-0 focus:ring-indigo-500"
                  />
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(index);
                    }}
                    type="button"
                    className="ml-2 p-1 text-red-500 hover:text-red-700 focus:outline-none"
                  >
                    <Trash2 size={20} aria-label="Delete portion" />
                  </button>
                </section>
                <article className="relative rounded-b-2xl bg-white p-3">
                  <small className="absolute bottom-5 left-4 ml-2 text-lg">₹</small>
                  <input
                    minLength={1}
                    maxLength={6}
                    placeholder="Enter Price"
                    type="tel"
                    name="price"
                    value={section.price || 0}
                    onChange={(e) => handleInputChange(index, e)}
                    required
                    className="w-full rounded-xl bg-white pl-8 focus:border-[#8C63FF] focus:bg-white focus:ring-0"
                  />
                </article>
                <Transition show={open} as={Fragment} leave="transition ease-in duration-100" leaveFrom="opacity-100" leaveTo="opacity-0">
                  <ListboxOptions className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
                    {foodTypes.map((foodType, foodTypeIdx: number) => (
                      <ListboxOption
                        key={foodTypeIdx.toString()}
                        className={({ selected }) =>
                          `relative cursor-default select-none py-2 pl-10 pr-4 ${selected ? 'bg-amber-100 text-amber-900' : 'text-gray-900'}`
                        }
                        value={foodType}
                      >
                        {({ selected, focus }) => (
                          <>
                            <span className={`block cursor-pointer truncate ${focus ? 'font-medium' : 'font-normal'}`}>{foodType.name}</span>
                            {selected ? (
                              <span className={`absolute inset-y-0 left-0 flex items-center pl-3 ${selected ? 'text-amber-600' : 'text-amber-600'}`}>
                                <CheckmarkIcon className="h-5 w-5" aria-hidden="true" />
                              </span>
                            ) : null}
                          </>
                        )}
                      </ListboxOption>
                    ))}
                  </ListboxOptions>
                </Transition>
              </div>
            )}
          </Listbox>
        </article>
      ))}
      <section>
        <button
          onClick={addSection}
          type="button"
          className="border-1 flex w-full items-center justify-center rounded-full border border-[#F4F4F4] bg-white py-2"
        >
          + Add
        </button>
      </section>
      <BottomButton
        buttons={[
          {
            text: 'Save',
            onClick: handleSave,
            type: 'button',
          },
        ]}
      />
    </section>
  );
};

const PortionStep = memo(MemoPortionStep);
export default PortionStep;
