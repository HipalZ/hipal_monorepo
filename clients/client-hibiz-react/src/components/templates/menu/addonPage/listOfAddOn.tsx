import { memo, useCallback, useMemo } from "react";
import Fuse from "fuse.js";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import useMenuPageStore, {
  type AddonChoice,
} from "@/components/store/useMenuStorage";
import LoadingSpinner from "@/components/atom/loadingSpinner";
import { useCategoryStore } from "@/components/store/useCategoryStore";
import { BiSolidEditAlt } from "react-icons/bi";
import { useAddOnList } from "@/hooks/useAddOn";
import type { AddOnType } from "@hi/db-models/src/validators";

const MemoListOfAddon = () => {
  const setAvailability = useMenuPageStore((state) => state.setAvailability);
  const setVisibility = useMenuPageStore((state) => state.setVisibility);
  const search = useMenuPageStore((state) => state.search);
  const visibilityFilter = useMenuPageStore((state) => state.visibilityFilter);
  const sortOrder = useMenuPageStore((state) => state.sortOrder);
  const setOpenMenu = useMenuPageStore((state) => state.setOpenMenu);
  const setAddOnChoice = useMenuPageStore((state) => state.setAddOnChoice);
  const setAddOnId = useMenuPageStore((state) => state.setAddOnId);
  const setAddOnName = useMenuPageStore((state) => state.setAddOnName);
  const setChoices = useMenuPageStore((state) => state.setChoices);
  const setMaxChoices = useMenuPageStore((state) => state.setMaxChoices);
  const setMinChoices = useMenuPageStore((state) => state.setMinChoices);
  const setAddOnToggle = useMenuPageStore((state) => state.setAddOnToggle);
  const setRecommendationIds = useMenuPageStore(
    (state) => state.setRecommendationIds,
  );
  const setRemoveRecommendationIds = useMenuPageStore(
    (state) => state.setRemoveRecommendationIds,
  );
  const { addOns } = useCategoryStore((state) => ({
    addOns: state.addOns,
  }));
  const { isLoading } = useAddOnList();

  const fuse = useMemo(
    () =>
      new Fuse(addOns, {
        keys: ["name"],
        threshold: 0.3,
      }),
    [addOns],
  );

  const filteredAddOns = useMemo(() => {
    let filtered = search
      ? fuse.search(search).map((result) => result.item)
      : addOns;
    if (visibilityFilter !== "all") {
      filtered = filtered.filter(
        (c) => c.visibility === (visibilityFilter === "visible"),
      );
    }
    if (Object.keys(filtered).length === 0) return [];
    return sortOrder === "asc"
      ? filtered.sort((a, b) => a.name.localeCompare(b.name))
      : filtered.sort((a, b) => b.name.localeCompare(a.name));
  }, [search, addOns, fuse, visibilityFilter, sortOrder]);

  const editAddOn = useCallback(
    (addon: AddOnType) => {
      setVisibility(addon.visibility ?? false);
      setAvailability(addon.availability ?? false);
      setAddOnId(addon._id?.toString() ?? "");
      setAddOnName(addon.name);
      setChoices(addon.choices);
      setMaxChoices(addon.addOnMaxQuantity ?? 0);
      setMinChoices(addon.compulsory ?? 0);
      setAddOnChoice(addon.choiceType as AddonChoice);
      setRecommendationIds(addon.dishIds);
      setRemoveRecommendationIds(addon.dishIds);
      setAddOnToggle("EDIT_ADDON");
      setOpenMenu(true);
    },
    [setVisibility, setAvailability, setOpenMenu],
  );

  if (isLoading) {
    return (
      <div>
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <section className="flex flex-wrap justify-start mt-[7rem] gap-4 mx-4 lg:mt-[5rem]">
      {filteredAddOns.map((addon) => (
        <div
          key={addon.name}
          onClick={() => editAddOn(addon)}
          role="button"
          onKeyDown={() => editAddOn(addon)}
          className="flex items-center justify-between w-full p-4 bg-white h-[4.5rem] rounded-2xl shadow max-w-[28rem] md:max-w-[19rem] lg:max-w-[21.5rem]"
        >
          <h3 className="mb-2 text-lg font-semibold">{addon.name}</h3>
          <article className="flex">
            <div className="flex items-center space-x-4">
              {addon.visibility ? (
                <FaEye className="text-green-500" />
              ) : (
                <FaEyeSlash className="text-red-500" />
              )}
              <div>
                {addon.availability ? null : (
                  <div className="font-semibold text-red-500">N/A</div>
                )}
              </div>
            </div>
            <button type="button" className="pl-4 text-black">
              <BiSolidEditAlt />
            </button>
          </article>
        </div>
      ))}
    </section>
  );
};
const ListOfAddOn = memo(MemoListOfAddon);
export default ListOfAddOn;
