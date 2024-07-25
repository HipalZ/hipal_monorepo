import Fuse from "fuse.js";
import { memo, useMemo, useState } from "react";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { IoMdArrowDropdown, IoMdArrowDropup } from "react-icons/io";
import useMenuPageStore, { DishSteps } from "@/components/store/useMenuStorage";
import BottomButton from "@/components/atom/bottomButton";

interface Props {
  data: any;
}

const MemoLinkAddons = (props: Props) => {
  const { data } = props;
  const {
    setAddonIds,
    setDishStep,
    addonIds,
    setRemoveAddOnIds,
    removeAddOnIds,
  } = useMenuPageStore((s) => ({
    setAddonIds: s.setAddonIds,
    setDishStep: s.setDishStep,
    addonIds: s.addonIds,
    setRemoveAddOnIds: s.setRemoveAddOnIds,
    removeAddOnIds: s.removeAddOnIds,
  }));
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedIds, setExpandedIds] = useState<string[]>([]);

  const initialTempIds = useMemo(() => [...addonIds], [addonIds]);
  const [tempIds, setTempIds] = useState<string[]>(initialTempIds);

  const fuse = new Fuse(data, {
    keys: ["name"],
    threshold: 0.3,
  });

  let filteredData = searchTerm
    ? fuse.search(searchTerm).map((result) => result.item)
    : data;
  filteredData = [...filteredData].sort((a, b) => {
    const aIsSelected = tempIds.includes(a._id?.toString() ?? "");
    const bIsSelected = tempIds.includes(b._id?.toString() ?? "");
    return aIsSelected === bIsSelected ? 0 : aIsSelected ? -1 : 1;
  });

  const handleSave = () => {
    setAddonIds(tempIds);
    setRemoveAddOnIds(removeAddOnIds);
    setDishStep(DishSteps.DISH_STEP_1);
  };

  const handleDataChange = (id: string) => {
    if (tempIds.includes(id)) {
      setTempIds(tempIds.filter((catId) => catId !== id));
      if (!removeAddOnIds.includes(id)) {
        setRemoveAddOnIds([...removeAddOnIds, id]);
      }
    } else {
      setTempIds([...tempIds, id]);
      setRemoveAddOnIds(removeAddOnIds.filter((catId) => catId !== id));
    }
  };

  const handleToggleExpand = (id: string) => {
    if (expandedIds.includes(id)) {
      setExpandedIds(expandedIds.filter((expandedId) => expandedId !== id));
    } else {
      setExpandedIds([...expandedIds, id]);
    }
  };

  return (
    <>
      <input
        type="search"
        placeholder="Search Item..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className=" w-[92%] p-2 border rounded-2xl mx-6"
      />
      <div className="flex flex-wrap justify-start gap-4 mx-6 mt-4">
        {filteredData?.map((data) => (
          <div
            key={data._id?.toString()}
            className="relative flex flex-col w-[90%] p-4 bg-white rounded-lg shadow md:max-w-[14rem] lg:max-w-[14rem]"
          >
            <div className="flex items-center justify-between">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={tempIds.includes(data._id?.toString() ?? "")}
                  onChange={() => handleDataChange(data._id?.toString() ?? "")}
                  className="mr-2 text-sm text-black rounded-md"
                />
                <h3 className="text-lg font-semibold truncate w-[80%]">
                  {data.name}
                </h3>
              </label>
              <div className="absolute flex items-center right-2">
                <button
                  type="button"
                  onClick={() => handleToggleExpand(data._id?.toString() ?? "")}
                >
                  {expandedIds.includes(data._id?.toString() ?? "") ? (
                    <IoMdArrowDropup className="text-gray-500" />
                  ) : (
                    <IoMdArrowDropdown className="text-gray-500" />
                  )}
                </button>
                {data.visibility ? (
                  <FaEye className="text-green-500" />
                ) : (
                  <FaEyeSlash className="text-red-500" />
                )}
              </div>
            </div>
            {expandedIds.includes(data._id?.toString() ?? "") && (
              <div className="mt-2">
                {data.choices.map((choice) => (
                  <div key={choice._id} className="ml-6">
                    <p className="text-sm font-medium">{choice.name}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      <BottomButton text="Save" onClick={handleSave} />
    </>
  );
};

const LinkAddons = memo(MemoLinkAddons);
export default LinkAddons;
