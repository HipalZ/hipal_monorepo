import useHiPeopleStore from "@/components/store/useHipeopleStore";
import { Switch } from "@headlessui/react";
import { useState } from "react";
import { CiCirclePlus } from "react-icons/ci";
import { LuBellRing } from "react-icons/lu";
import { TiTick } from "react-icons/ti";

const TagPopup = () => {
  const { singleTagData } = useHiPeopleStore((s) => ({
    singleTagData: s.singleTagData,
  }));

  const [enabled, setEnabled] = useState(false);

  return (
    <section className="px-6 pt-2 bg-white rounded-2xl">
      <center># Manual Tag</center>
      <center className=""># No Sugar</center>
      <section className="my-2">
        <article className="flex justify-between ">
          <h1>Number: 1 times</h1>
          <h1>Created by: Rajkumar</h1>
        </article>
        <article className="flex justify-between mt-6">
          <div className="flex space-x-2">
            <h1 className="border border-1 border-[#000] rounded-full w-fit h-fit">
              <TiTick size={20} />
            </h1>
            <h1>Display this for captains</h1>
          </div>
          <Switch
            checked={enabled}
            onChange={setEnabled}
            className={`group relative flex h-3 w-10 cursor-pointer rounded-full border-2 border-[#8C63FF] transition-colors duration-200 ease-in-out focus:outline-none ${
              enabled ? "bg-[#8C63FF]" : "bg-transparent"
            }`}
          >
            <span
              aria-hidden="true"
              className={`pointer-events-none inline-block h-5 w-5 transform absolute -top-[6px] -left-1 rounded-full border-2 border-[#8C63FF] transition duration-200 ease-in-out ${
                enabled ? "translate-x-5 bg-white" : "bg-[#8C63FF]"
              }`}
            />
          </Switch>
        </article>
        <article className="flex justify-between mt-6">
          <div className="flex space-x-2">
            <LuBellRing size={20} />
            <h1>Add remainder</h1>
          </div>
          <CiCirclePlus size={24} color="#8C63FF" />
        </article>
      </section>
    </section>
  );
};

export default TagPopup;
