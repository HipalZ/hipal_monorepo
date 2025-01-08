import { apiRpc } from "@hi/common";
import type { CategoryType } from "@hi/db-models/src/validators";
import { useQuery } from "@tanstack/react-query";
import { memo } from "react";
import { useParams } from "react-router-dom";
import SpinnerMemo from "../loadingSpinner";
import { motion } from "framer-motion";
import { ScrollArea } from "@/components/ui/scroll-area";
import CompactDishGrid from "./dishData";
import { cn } from "@/components/utils/helpers";
import { ImageIcon } from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { useOrderStore } from "@/components/store/useOrderData";
import LiveCart from "./liveCart";


const MemoCategory = () => {
    const { businessId } = useParams();
    const { selectedCategory, setSelectedCategory, setAllCategories, setFirstCat, allCategories, openOrderModal, modalType, setOpenOrderModal } = useOrderStore()
    // const { cart } = useCartStore()
    // console.log(cart)
    const getChildCategories = async () => {
        const childCategories = await apiRpc.categories.$get({
            query: {
                businessId: businessId || "",
                dishes: "true",
            },
        });
        const response = await childCategories.json();
        setAllCategories(response.data as CategoryType[]);
        if (selectedCategory === null) {
            setFirstCat(response.data);
            return response.data as CategoryType[]
        }
        return response.data as CategoryType[];
    };


    console.log('MemoCategory')
    // Query to get categories
    const { isLoading, error } = useQuery({
        queryKey: ["getChildCategories", businessId],
        queryFn: getChildCategories,
        enabled: !!businessId,
        staleTime: 1000 * 30,
    });

    if (isLoading) {
        return <SpinnerMemo />;
    }

    if (error) {
        return (
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="p-4 text-center text-red-500"
            >
                Error loading categories.
            </motion.div>
        );
    }

    return (
        <div className="flex h-[calc(100dvh)] pt-[4.25rem] lg:pt-[7.25rem] hide-scrollbar">
            <ScrollArea className="w-1/4 pt-4 bg-white ">
                <div className="md:space-y-8 pb-[5rem] relative hide-scrollbar">
                    {allCategories?.map((category, index) => (
                        <motion.div
                            key={category?._id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.1 }}
                            onClick={() => setSelectedCategory(category)}
                            className={cn(
                                'flex flex-col py-4 items-center cursor-pointer transition-all relative',
                                selectedCategory?._id === category?._id
                                    ? ''
                                    : 'hover:bg-gray-100'
                            )}
                        >
                            {selectedCategory?._id === category._id && (
                                <motion.div
                                    layoutId="category-border"
                                    className="absolute inset-0 border-r-4 border-purple-200"
                                    initial={false}
                                    transition={{
                                        type: "spring",
                                        stiffness: 600,
                                        damping: 60
                                    }}
                                />
                            )}

                            <Avatar className="w-10 h-10">
                                {category?.coverImage ? (
                                    <AvatarImage src={category.coverImage} alt={category.name} />
                                ) : (
                                    <AvatarFallback>
                                        <ImageIcon className="w-6 h-6 text-gray-500" />
                                    </AvatarFallback>
                                )}
                            </Avatar>

                            <h3 className="mt-2 text-sm font-semibold text-center md:text-base">
                                {category?.name}
                            </h3>
                        </motion.div>
                    ))}
                </div>
            </ScrollArea>

            {/* Main Content: Dishes */}
            <div className="w-3/4 p-2 md:p-4 overflow-auto pb-[5rem] border-l border-gray-200">
                <h2 className="pt-4 mb-6 text-xl font-bold">
                    {selectedCategory ? selectedCategory.name : 'Select a category'}
                </h2>
                <CompactDishGrid selectedCategory={selectedCategory} />
            </div>
            <LiveCart />
        </div>
    );
};

const Category = memo(MemoCategory);
export default Category;
