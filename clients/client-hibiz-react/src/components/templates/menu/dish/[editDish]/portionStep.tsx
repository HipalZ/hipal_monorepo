import { type ChangeEvent, type DragEvent, memo, useState } from "react";
import { Listbox } from "@headlessui/react";
import { foodTypes } from "@/components/utils/helper";
import useMenuPageStore from "@/components/store/useMenuStorage";
import { Fragment } from "react";
import {
  ListboxButton,
  ListboxOption,
  ListboxOptions,
  Transition,
} from "@headlessui/react";
import { IoMdArrowDropdown } from "react-icons/io";
import { CheckmarkIcon } from "react-hot-toast";

type Section = {
  portionTypes: ("VEG" | "NON_VEG" | "EGG" | "VEGAN")[];
  name: string;
  price: number;
  default: boolean;
};

type ExtendedSection = Section & {
  [key: string]: any;
};
const MemoPortionStep = () => {
  const { setPortions, setDishStep, portions, dishPrice } = useMenuPageStore(
    (state) => ({
      setPortions: state.setPortions,
      setDishStep: state.setDishStep,
      portions: state.portions,
      dishPrice: state.dishPrice,
    }),
  );

  const [sections, setSections] = useState(
    portions.map((p) => ({
      ...p,
    })) ?? [
      {
        portionTypes: [foodTypes[0].name],
        name: "",
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
        name: "",
        price: 0,
        default: false,
      },
    ]);
  };

  const handleSelectionChange = (index: number, newValue) => {
    const newSections = [...sections];
    newSections[index].portionTypes = [newValue.name];
    setSections(newSections);
  };

  const handleInputChange = (
    index: number,
    event: ChangeEvent<HTMLInputElement>,
  ) => {
    const { name, value } = event.target;
    const newSections: ExtendedSection[] = [...sections];
    newSections[index][name] = name === "price" ? Number(value) : value;
    setSections(newSections);
  };

  const handleSave = () => {
    setPortions(structuredClone(sections));
    setDishStep("DISH_STEP_1");
  };

  const handleDragStart = (event: DragEvent<HTMLElement>, index: number) => {
    event.dataTransfer.setData("text/plain", index.toString());
  };

  const handleDragOver = (event: DragEvent<HTMLElement>) => {
    event.preventDefault();
  };

  const handleDrop = (event: DragEvent<HTMLElement>, dropIndex: number) => {
    event.preventDefault();
    const dragIndex = Number(event.dataTransfer.getData("text/plain"));
    if (dragIndex !== dropIndex) {
      const newSections = [...sections];
      [newSections[dragIndex], newSections[dropIndex]] = [
        newSections[dropIndex],
        newSections[dragIndex],
      ];
      setSections(newSections);
    }
  };

  return (
    <section className="mx-6 rounded-2xl lg:mx-16 lg:mt-6">
      <p className="mb-2 text-sm text-gray-500">
        Click to edit Drag to rearrange
      </p>
      {sections.map((section, index) => (
        <article
          key={index.toString()}
          className="p-3 my-2 bg-white rounded-t-2xl"
          draggable="true"
          onDragStart={(event) => handleDragStart(event, index)}
          onDragOver={handleDragOver}
          onDrop={(event) => handleDrop(event, index)}
          role="button"
          tabIndex={0}
        >
          <Listbox
            value={foodTypes.find((type) =>
              section.portionTypes.includes(type.name),
            )}
            onChange={(newValue) => handleSelectionChange(index, newValue)}
          >
            {({ open }) => (
              <div className="relative mt-1">
                <section className="flex">
                  <ListboxButton className="relative flex items-center py-2 text-left bg-white rounded-lg cursor-default sm:text-sm">
                    <span className="flex items-center">
                      <img
                        src={
                          foodTypes.find((type) =>
                            section.portionTypes.includes(type.name),
                          )?.icon
                        }
                        alt="icon"
                        className="flex-shrink-0 w-6 h-6 mr-1"
                      />
                      <IoMdArrowDropdown
                        className="w-6 h-6 mr-1 text-gray-400"
                        aria-hidden="true"
                      />
                    </span>
                  </ListboxButton>
                  <input
                    type="text"
                    id={`name-${index}`}
                    name="name"
                    placeholder="Enter Portion Name"
                    maxLength={21}
                    minLength={3}
                    required
                    value={section.name}
                    onChange={(e) => handleInputChange(index, e)}
                    className="w-full p-2 border border-black rounded-xl focus:outline-none focus:ring-0 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </section>
                <article className="relative p-3 bg-white rounded-b-2xl">
                  <small className="absolute ml-2 text-lg bottom-5 left-4">
                    ₹
                  </small>
                  <input
                    minLength={1}
                    maxLength={6}
                    placeholder="Enter Price"
                    type="text"
                    name="price"
                    value={section.price}
                    onChange={(e) => handleInputChange(index, e)}
                    required
                    className="bg-white rounded-xl w-full pl-8 focus:ring-0 focus:bg-white focus:border-[#8C63FF]"
                  />
                </article>
                <Transition
                  show={open}
                  as={Fragment}
                  leave="transition ease-in duration-100"
                  leaveFrom="opacity-100"
                  leaveTo="opacity-0"
                >
                  <ListboxOptions className="absolute z-10 w-full py-1 mt-1 overflow-auto text-base bg-white rounded-md shadow-lg max-h-60 ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
                    {foodTypes.map((foodType, foodTypeIdx: number) => (
                      <ListboxOption
                        key={foodTypeIdx.toString()}
                        className={({ selected }) =>
                          `cursor-default select-none relative py-2 pl-10 pr-4 ${
                            selected
                              ? "text-amber-900 bg-amber-100"
                              : "text-gray-900"
                          }`
                        }
                        value={foodType}
                      >
                        {({ selected }) => (
                          <>
                            <span
                              className={`block truncate ${
                                selected ? "font-medium" : "font-normal"
                              }`}
                            >
                              {foodType.name}
                            </span>
                            {selected ? (
                              <span
                                className={`absolute inset-y-0 left-0 flex items-center pl-3 ${
                                  selected ? "text-amber-600" : "text-amber-600"
                                }`}
                              >
                                <CheckmarkIcon
                                  className="w-5 h-5"
                                  aria-hidden="true"
                                />
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
          className="bg-[#f4f4f4] w-full py-2 rounded-full flex items-center justify-center"
        >
          + Add
        </button>
      </section>
      <button onClick={handleSave} type="button" className="action_btn">
        Save
      </button>
    </section>
  );
};

const PortionStep = memo(MemoPortionStep);
export default PortionStep;
