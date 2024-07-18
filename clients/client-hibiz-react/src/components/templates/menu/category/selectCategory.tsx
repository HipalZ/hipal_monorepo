import type { CategoryType } from "@hi/db-models/src/validators";
import { memo, useCallback } from "react";
import Fuse from "fuse.js";
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import useMenuPageStore from "@/components/store/useMenuStorage";
import { useCategoryStore } from "@/components/store/useCategoryStore";

const MemoSelectCategory = () => {

    const { selectedIds, handleCategoryChange, setCategoryStep,search,setSearch } = useMenuPageStore(state => ({
        selectedIds: state.selectedIds,
        handleCategoryChange: state.handleCategoryChange,
        setCategoryStep: state.setCategoryStep,
        search:state.search,
        setSearch:state.setSearch
    }));

    const { categories } = useCategoryStore(s=>({
        categories: s.categories
    }))


    const fuse = new Fuse(categories, {
        keys: ["name"],
        threshold: 0.3
    });

    const filteredCategories = search ? fuse.search(search).map(result => result.item) : categories;

    const handleSave = useCallback(() => {
        setCategoryStep("CATEGORY_STEP_1")
    }, []);

    // if(isLoading){
    //     return <div><LoadingSpinner /></div>
    // }

    return (
        <>
            <input
                type="search"
                placeholder="Search categories..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className=" w-[92%] p-2 border rounded-2xl mx-6"
            />
            <div className="flex flex-wrap justify-center gap-4 mt-4">
                {filteredCategories?.map((category: CategoryType) => (
                    <div key={category._id?.toString()} className="flex relative items-center justify-between w-[90%] p-4 bg-white rounded-lg shadow md:max-w-[14rem] lg:max-w-[14rem]">
                        <label className="flex items-center">
                            <input
                                type="checkbox"
                                checked={selectedIds.includes(category._id?.toString() ?? "")}
                                onChange={() => handleCategoryChange(category._id?.toString() ?? "")}
                                className="mr-2 checkbox checkbox-sm checkbox-black"
                            />
                            <h3 className="text-lg font-semibold truncate w-[80%]">{category.name}</h3>
                        </label>
                        <div className="absolute right-2">
                            {category.visibility ? <FaEye className="text-green-500" /> : <FaEyeSlash className="text-red-500" />}
                        </div>
                    </div>
                ))}
            </div>
            <button type="button" onClick={handleSave} className="bottom_btn">Save</button>
        </>
    );
};

const SelectCategory = memo(MemoSelectCategory);
export default SelectCategory;
