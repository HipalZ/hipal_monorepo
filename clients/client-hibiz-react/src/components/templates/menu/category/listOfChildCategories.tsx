import useBusinessData from "@/components/store/useBusinessData";
import { apiRpc } from "@hi/common";
import type { CategoryType } from "@hi/db-models/src/validators";
import { useQuery } from "@tanstack/react-query";
import { memo, useCallback, useMemo } from "react";
import Fuse from "fuse.js";
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import useMenuPageStore from "@/components/store/useMenuStorage";

const MemoListOfChildCategory = () => {
    const businessData = useBusinessData((state) => state.businessData);
    const { search } = useMenuPageStore(state => ({
        search: state.search,
    }))

    const getAllChildCategory = useCallback(async () => {
        if (!businessData?._id) return [];
        const res = await apiRpc.categories.$get({
            query: {
                businessId: businessData._id,
                child: "true"
            }
        });
        const data = (await res.json()).data as CategoryType[];
        return data;
    }, [businessData?._id]);

    const { data: categories = [] } = useQuery({
        queryKey: ["categories", businessData?._id],
        queryFn: getAllChildCategory,
        enabled: !!businessData?._id
    });

    const fuse = new Fuse(categories, {
        keys: ["name"],
        threshold: 0.3
    });
    const filteredCategories = useMemo(() => {
        return search ? fuse.search(search).map(result => result.item) : categories;
    }, [search, categories, fuse]);
    const editCategory = useCallback((category: CategoryType) => {
        console.log(category);
    }, []);


    return (
        <section className="flex flex-wrap justify-center mt-[7rem] gap-4 mx-4 lg:mt-[5rem]">
            {filteredCategories?.map(category => (
                <button onClick={() => editCategory(category)} type="button" key={category.name}
                    className="flex items-center justify-between w-full p-4 bg-white h-[4.5rem] rounded-2xl shadow max-w-[28rem] md:max-w-[19rem] lg:max-w-[21.5rem]">
                    <h3 className="mb-2 text-lg font-semibold">{category.name}</h3>
                    <div className="mb-2 text-gray-500">
                        {category.visibility ? <FaEye className="text-green-500" /> : <FaEyeSlash className="text-red-500" />}
                    </div>
                </button>
            ))}
        </section>
    );
};
const ListOfChildCategory = memo(MemoListOfChildCategory);
export default ListOfChildCategory;
