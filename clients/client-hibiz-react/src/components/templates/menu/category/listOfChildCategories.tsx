import type { CategoryType } from "@hi/db-models/src/validators";
import Fuse from "fuse.js";
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import useMenuPageStore from "@/components/store/useMenuStorage";
import { useChildCategories } from "@/hooks/useCategory";
import LoadingSpinner from "@/components/atom/loadingSpinner";
import { memo, useCallback, useMemo } from "react";
import { useCategoryStore } from "@/components/store/useCategoryStore";
import { BiEdit } from "react-icons/bi";

const MemoListOfChildCategory = () => {
    const { setAvailability, setImagePreview, setSelectedIds,
        setCategoryName, setVisibility, search, visibilityFilter,
        sortOrder, setCategoryStep, setOpenMenu,setEditingSubCat,setCatId,setIdCheck } = useMenuPageStore(state => ({
            search: state.search,
            visibilityFilter: state.visibilityFilter,
            sortOrder: state.sortOrder,
            setCategoryStep: state.setCategoryStep,
            setOpenMenu: state.setOpenMenu,
            setVisibility: state.setVisibility,
            setAvailability: state.setAvailability,
            setImagePreview: state.setImagePreview,
            setSelectedIds: state.setSelectedIds,
            setCategoryName: state.setCategoryName,
            setEditingSubCat: state.setEditingSubCat,
            setCatId: state.setCatId,
            setIdCheck: state.setIdCheck
        }));
    const { subCategories } = useCategoryStore(state => ({
        subCategories: state.subCategories,
    }))

    const { isLoading } = useChildCategories()

    const fuse = new Fuse(subCategories, {
        keys: ["name"],
        threshold: 0.3
    });
    const filteredCategories = useMemo(() => {
        let filtered = search ? fuse.search(search).map(result => result.item) : subCategories;
        if (visibilityFilter !== 'all') {
            filtered = filtered.filter(c => c.visibility === (visibilityFilter === 'visible'));
        }
        if(Object.keys(filtered).length === 0) return [];
        return sortOrder === 'asc' ? filtered.sort((a, b) => a.name.localeCompare(b.name)) : filtered.sort((a, b) => b.name.localeCompare(a.name));
    }, [search, subCategories, fuse, visibilityFilter, sortOrder]);

    const editCategory = useCallback((category: CategoryType) => {
        console.log(category);
        setCategoryStep("EDIT_SUB_CATEGORY")
        setVisibility(category.visibility ?? false)
        setAvailability(category.availability ?? false)
        setImagePreview(category.coverImage ?? null)
        setSelectedIds(category.parentCategoryIds)
        setIdCheck(category.parentCategoryIds)
        setCategoryName(category.name)
        setCatId(category._id?.toString() ?? "")
        setOpenMenu(true)
        setEditingSubCat(true)
    }, []);

    if (isLoading) {
        return <div><LoadingSpinner /></div>
    }


    return (
        <section className="flex flex-wrap justify-center mt-[7rem] gap-4 mx-4 lg:mt-[5rem]">
            {filteredCategories?.map(category => (
                <button type="button" key={category.name}
                    className="flex items-center justify-between w-full p-4 bg-white h-[4.5rem] rounded-2xl shadow max-w-[28rem] md:max-w-[19rem] lg:max-w-[21.5rem]">
                    <h3 className="mb-2 text-lg font-semibold">{category.name}</h3>
                    <article className="flex">
                        <div >
                            {category.visibility ? <FaEye className="text-green-500" /> : <FaEyeSlash className="text-red-500" />}
                        </div>
                        <button onClick={() => editCategory(category)} type="button" className="pl-8 text-black">
                            <BiEdit />
                        </button>
                    </article>
                </button>
            ))}
        </section>
    );
};
const ListOfChildCategory = memo(MemoListOfChildCategory);
export default ListOfChildCategory;
