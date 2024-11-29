import type { ICategory, IDish } from "@/components/types/businessData";
import { apiRpc } from "@hi/common";
import { memo, useState, useEffect, useCallback, lazy } from "react";
import { useParams } from "react-router-dom";
import { combineAllDishes } from "./explorePageStore";
import { useQuery } from "@tanstack/react-query";
import { IoIosSearch } from "react-icons/io";
import { useBannerStore } from "@/components/store/useBannerStore";
import { FaArrowLeft } from "react-icons/fa";
import useBusinessData from "@/components/store/useBusinessData";
const SubHeader = lazy(() => import("@/components/atom/subHeader"));

interface IProps {
  setClickRedirect: (value: boolean) => void;
  handleSaveRedirections: (
    selectedLink: string,
    selectedRedirectionId: string,
    selectedRedirectionName: string,
  ) => void;
}

enum RedirectionType {
  CATEGORIES = "CATEGORY",
  DISHES = "DISH",
  LINK = "LINK",
}

const MemoRedirectionPopUp = (props: IProps) => {
  const { handleSaveRedirections, setClickRedirect } = props;
  const {
    setRedirectCategories,
    setRedirectDishes,
    redirectCategories,
    selectedRedirectionId,
    setSelectedRedirectionId,
    selectedRedirectionName,
    setSelectedRedirectionName,
  } = useBannerStore((s) => ({
    setRedirectCategories: s.setRedirectCategories,
    setRedirectDishes: s.setRedirectDishes,
    redirectCategories: s.redirectCategories,
    redirectDishes: s.redirectDishes,
    selectedRedirectionId: s.selectedRedirectionId,
    setSelectedRedirectionId: s.setSelectedRedirectionId,
    selectedRedirectionName: s.selectedRedirectionName,
    setSelectedRedirectionName: s.setSelectedRedirectionName,
  }));
  const businessId = useParams()?.businessId;
  const [selectedLink, setSelectedLink] = useState("");
  const [dishes, setDishes] = useState<IDish[]>([]);
  const [categories, setCategories] = useState<ICategory[]>([]);
  const [filteredDishes, setFilteredDishes] = useState<IDish[]>([]);
  const [filteredCategories, setFilteredCategories] = useState<ICategory[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [isVisible, setIsVisible] = useState(false);

  const outLetType = useBusinessData((s) => s.outletInfo?.outLetType);

  // redirection type selection categories
  const handleSelectCategory = useCallback(() => {
    setSelectedLink(RedirectionType.CATEGORIES);
  }, [selectedLink]);

  // toggle search bar
  const toggleSearch = useCallback(() => {
    setIsVisible(!isVisible);
  }, [isVisible]);

  // redirection type selection dishes
  const handleSelectDish = useCallback(() => {
    setSelectedLink(RedirectionType.DISHES);
  }, [selectedLink]);

  // redirection type selection external link
  const handleExternalLink = useCallback(() => {
    setSelectedLink(RedirectionType.LINK);
  }, [selectedLink]);

  // save redirections
  const handleSave = () => {
    handleSaveRedirections(
      selectedLink,
      selectedRedirectionId,
      selectedRedirectionName,
    );
    setClickRedirect(false);
  };

  // setting redirection id and name
  const handleItem = useCallback((id: string, name: string) => {
    setSelectedRedirectionId(id);
    setSelectedRedirectionName(name);
  }, []);

  // all category data
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

  const handleBack = useCallback(() => {
    setSelectedLink("");
    if (selectedLink === "") {
      setClickRedirect(false);
    }
  }, [selectedLink, setClickRedirect]);

  useQuery<ICategory[]>({
    queryKey: ["categories", businessId],
    queryFn: () => getAllCategoryData(businessId ?? ""),
    enabled: !!businessId,
  });

  return (
    <section className="m-6 h-[80vh] overflow-y-auto pb-[5rem]">
      <div>
        <button
          type="button"
          onClick={handleBack}
          className="px-4 py-2 bg-[#FFFFFF] border border-[#00000050] rounded-3xl on_active_bounce"
        >
          <FaArrowLeft />
        </button>
        <center className="mb-4 -mt-6 text-2xl">Add Redirection</center>
      </div>
      {selectedLink === "" ? (
        <article className="md:mx-10">
          <SubHeader text="Link Action Button" />
          <article className="p-4 mt-6 mb-4 space-y-10 bg-white rounded-2xl">
            <button
              onClick={handleSelectCategory}
              type="button"
              className="w-full py-2 bg-gray-100 rounded-full"
            >
              <h1>
                &#128279;{" "}
                {outLetType === "MENU"
                  ? "Direct to Category"
                  : "Direct to Catalogue"}
              </h1>
            </button>
            <button
              onClick={handleSelectDish}
              type="button"
              className="w-full py-2 bg-gray-100 rounded-full"
            >
              <h1>
                &#128279;{" "}
                {outLetType === "MENU"
                  ? "Direct to Dish"
                  : "Direct to Service"}{" "}
              </h1>
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
            {isVisible && (
              <div className="w-[90vw]">
                <input
                  type="search"
                  className="h-[2rem] border border-gray-300 rounded-2xl"
                  placeholder="Search for a items"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            )}
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
                  <label
                    onChange={() => handleItem(cat?._id, cat?.name)}
                    className="flex items-center w-full gap-4 cursor-pointer"
                  >
                    <input
                      type="radio"
                      name="cat"
                      checked={selectedRedirectionId === cat?._id}
                      className="text-black"
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
                  <label
                    onChange={() => handleItem(dish?._id, dish?.name)}
                    className="flex items-center w-full gap-4 cursor-pointer"
                  >
                    <input
                      type="radio"
                      name="dish"
                      checked={selectedRedirectionId === dish?._id}
                      className="text-black"
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
                      className="w-full text-lg text-black rounded-2xl"
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
