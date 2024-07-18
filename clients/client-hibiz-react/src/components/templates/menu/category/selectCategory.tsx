import useBusinessData from "@/components/store/useBusinessData";
import { apiRpc } from "@hi/common";
import type { CategoryType } from "@hi/db-models/src/validators";
import { useQuery } from "@tanstack/react-query";
import { memo, useCallback, useState } from "react";
import Fuse from "fuse.js";
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import useMenuPageStore from "@/components/store/useMenuStorage";

const MemoSelectCategory = () => {
    const businessData = useBusinessData((state) => state.businessData);
    const [searchTerm, setSearchTerm] = useState("");

    const { selectedIds, handleCategoryChange, setCategoryStep, setCategories, categories } = useMenuPageStore(state => ({
        selectedIds: state.selectedIds,
        handleCategoryChange: state.handleCategoryChange,
        setCategoryStep: state.setCategoryStep,
        setCategories: state.setCategories,
        categories: state.categories
    }));

    const getAllParentCategory = useCallback(async () => {
        if (!businessData?._id) return [];
        const res = await apiRpc.categories.$get({
            query: {
                businessId: businessData._id,
                parent: "true"
            }
        });
        const data = (await res.json()).data as CategoryType[];
        setCategories(data);
        return data;
    }, [businessData?._id]);

    useQuery({
        queryKey: ["categories", businessData?._id],
        queryFn: getAllParentCategory,
        enabled: !!businessData?._id
    });

    const fuse = new Fuse(categories, {
        keys: ["name"],
        threshold: 0.3
    });

    const filteredCategories = searchTerm ? fuse.search(searchTerm).map(result => result.item) : categories;


    const handleSave = useCallback(() => {
        setCategoryStep("CATEGORY_STEP_1")
    }, []);

    return (
        <>
            <input
                type="search"
                placeholder="Search categories..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
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
