import type { ICategory, IDish } from "@/components/types/businessData";
import { apiRpc } from "@hi/common";
import { memo, useState, useEffect, useCallback } from "react";
import { useParams } from "react-router-dom";
import { combineAllDishes } from "./explorePageStore";
import { useQuery } from "@tanstack/react-query";
import BottomButton from "@/components/atom/bottomButton";
import { IoIosSearch } from "react-icons/io";
import SubHeader from "@/components/atom/subHeader";
import { useBannerStore } from "@/components/store/useBannerStore";

interface IProps {
  setClickRedirect: (value: boolean) => void;
  handleSaveRedirections: (
    selectedLink: string,
    selectedId: string,
    itemName: string,
  ) => void;
}

enum RedirectionType {
  CATEGORIES = "CATEGORY",
  DISHES = "DISH",
  LINK = "LINK",
}

const MemoRedirectionPopUp = (props: IProps) => {
  const { handleSaveRedirections, setClickRedirect } = props;
  const { setRedirectCategories, setRedirectDishes, redirectCategories } =
    useBannerStore((s) => ({
      setRedirectCategories: s.setRedirectCategories,
      setRedirectDishes: s.setRedirectDishes,
      redirectCategories: s.redirectCategories,
      redirectDishes: s.redirectDishes,
    }));
  const businessId = useParams()?.businessId;
  const [selectedLink, setSelectedLink] = useState("");
  const [itemName, setItemName] = useState("");
  const [dishes, setDishes] = useState<IDish[]>([]);
  const [categories, setCategories] = useState<ICategory[]>([]);
  const [filteredDishes, setFilteredDishes] = useState<IDish[]>([]);
  const [filteredCategories, setFilteredCategories] = useState<ICategory[]>([]);
  const [selectedId, setSelectedId] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState<string>("");

  const handleSelectCategory = useCallback(() => {
    setSelectedLink(RedirectionType.CATEGORIES);
  }, [selectedLink]);

  const [isVisible, setIsVisible] = useState(false);

  const toggleSearch = useCallback(() => {
    setIsVisible(!isVisible);
  }, [isVisible]);

  const handleSelectDish = useCallback(() => {
    setSelectedLink(RedirectionType.DISHES);
  }, [selectedLink]);

  const handleExternalLink = useCallback(() => {
    setSelectedLink(RedirectionType.LINK);
  }, [selectedLink]);

  const handleSave = () => {
    handleSaveRedirections(selectedLink, selectedId, itemName);
    setClickRedirect(false);
  };

  const handleItem = useCallback((id: string, name: string) => {
    setSelectedId(id);
    setItemName(name);
  }, []);

  const getAllCategoryData = async (businessId: string): Promise<IDish[]> => {
    if (redirectCategories.length > 0) {
      setCategories(redirectCategories);
      const allDishes = await combineAllDishes(redirectCategories);
      setDishes(allDishes);
      return allDishes || [];
    }

    const categoryResponse = await apiRpc.categories.$get({
      query: {
        businessId: businessId,
        dishes: "true",
      },
    });
    const data = (await categoryResponse.json()) as {
      data: ICategory[];
      err: boolean;
      message: string;
    };
    console.log("data", data);
    const categories = data?.data;

    if (redirectCategories.length === 0) {
      setCategories(categories);
      setRedirectCategories(categories);
      setFilteredCategories(categories);
    }

    const allDishes = await combineAllDishes(categories);
    setDishes(allDishes);
    setRedirectDishes(allDishes);
    setFilteredDishes(allDishes);
    return allDishes || [];
  };

  useQuery<ICategory[]>({
    queryKey: ["categories", businessId],
    queryFn: () => getAllCategoryData(businessId ?? ""),
    enabled: !!businessId,
  });

  useEffect(() => {
    if (selectedLink === RedirectionType.CATEGORIES) {
      setFilteredCategories(
        categories.filter((category) =>
          category.name.toLowerCase().includes(searchQuery.toLowerCase()),
        ),
      );
    } else if (selectedLink === RedirectionType.DISHES) {
      setFilteredDishes(
        dishes?.filter((dish) =>
          dish?.name.toLowerCase().includes(searchQuery.toLowerCase()),
        ),
      );
    }
  }, [searchQuery, selectedLink, categories, dishes]);

  return (
    <section className="m-6 h-[80vh] overflow-y-auto">
      <center className="mb-4 text-2xl">Add Redirection</center>
      {selectedLink === "" ? (
        <article>
          <SubHeader text="Link Action Button" />
          <article className="p-4 space-y-10 bg-white rounded-2xl">
            <button
              onClick={handleSelectCategory}
              type="button"
              className="w-full py-2 bg-gray-100 rounded-full"
            >
              <h1>&#128279; Direct to Category</h1>
            </button>
            <button
              onClick={handleSelectDish}
              type="button"
              className="w-full py-2 bg-gray-100 rounded-full"
            >
              <h1>&#128279; Direct to Dish</h1>
            </button>
            <button
              onClick={handleExternalLink}
              type="button"
              className="w-full py-2 bg-gray-100 rounded-full"
            >
              <h1>&#128279; External Link</h1>
            </button>
          </article>
        </article>
      ) : (
        <>
          <div className="relative flex items-center justify-between h-6 mx-6 mt-4 space-x-10">
            <div className="w-[90vw]">
              {isVisible && (
                <input
                  type="search"
                  className="h-[2rem] border border-gray-300 rounded-2xl"
                  placeholder="Search for a dish or category"
                  value={searchQuery}
                  autoFocus
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              )}
            </div>
            {selectedLink !== RedirectionType.LINK && (
              <figure>
                <IoIosSearch size={20} onClick={toggleSearch} />
              </figure>
            )}
          </div>
          <article>
            {selectedLink === RedirectionType.CATEGORIES &&
              filteredCategories.map((cat) => (
                <section
                  key={cat?._id}
                  className="flex items-center gap-4 p-4 m-2 bg-white rounded-2xl"
                >
                  <label className="flex items-center w-full gap-4 cursor-pointer">
                    <input
                      type="radio"
                      name="cat"
                      className="text-2xl text-black"
                      onChange={() => handleItem(cat?._id, cat?.name)}
                    />
                    <span className="text-xl truncate">{cat?.name}</span>
                  </label>
                </section>
              ))}
            {selectedLink === RedirectionType.DISHES &&
              Array.isArray(filteredDishes) &&
              filteredDishes.map((dish) => (
                <section
                  key={dish?._id}
                  className="flex items-center gap-4 p-4 m-2 bg-white rounded-2xl"
                >
                  <label className="flex items-center w-full gap-4 cursor-pointer">
                    <input
                      type="radio"
                      name="dish"
                      className="text-2xl text-black"
                      onChange={() => handleItem(dish?._id, dish?.name)}
                    />
                    <span className="text-xl truncate">{dish?.name}</span>
                  </label>
                </section>
              ))}
            {selectedLink === RedirectionType.LINK && (
              <>
                <span className="ml-4 text-xl truncate">External Link</span>
                <section className="flex items-center gap-4 p-4 m-2 bg-white rounded-2xl">
                  <label className="flex items-center w-full gap-4 cursor-pointer">
                    <input
                      type="text"
                      name="external"
                      className="w-full text-2xl text-black rounded-2xl"
                      onChange={(e) => handleItem(e.target.value, "EXTERNAL")}
                    />
                  </label>
                </section>
              </>
            )}
          </article>
          <button type="button" onClick={handleSave} className="bottom_btn">
            Save
          </button>
        </>
      )}
    </section>
  );
};

const RedirectionPopUp = memo(MemoRedirectionPopUp);
export default RedirectionPopUp;
