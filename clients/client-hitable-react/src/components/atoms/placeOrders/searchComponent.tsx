import { useOrderStore } from "@/components/store/useOrderData";
import { Input } from "@/components/ui/input";
import { memo, useMemo } from "react";
import { motion } from "framer-motion";
import DishQuantityButton from "./dishQuantityBtn";

const MemoSearchComponent = () => {
    const {
        allDishes,
        searchActive,
        searchTerm,
        setSearchActive,
        setSearchTerm,
    } = useOrderStore();

    const filteredDishes = useMemo(() =>
        allDishes.filter((dish) =>
            dish.name.toLowerCase().includes(searchTerm.toLowerCase())
        ), [allDishes, searchTerm]
    );

    return (
        <div className="sticky z-10 px-2 pb-2 -mx-2 -mt-4 bg-white border-b border-gray-300 -top-2">

            <Input
                type="search"
                placeholder="Search for dishes..."
                value={searchTerm}
                onFocus={() => setSearchActive(true)}
                onBlur={() => !searchTerm && setSearchActive(false)}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md"
            />

            {searchActive && (
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-4 bg-white border border-gray-300 rounded-md shadow-md max-h-[60vh] overflow-y-auto"
                >
                    {filteredDishes.length > 0 ? (
                        filteredDishes.map((dish) => (
                            <div
                                key={dish._id}
                                className="flex items-center justify-between p-4 border-b last:border-none"
                            >
                                <div>
                                    <p className="text-sm font-medium">{dish.name}</p>
                                    <p className="text-xs text-gray-500">₹{dish.price}</p>
                                </div>
                                <DishQuantityButton dishData={dish} />
                            </div>
                        ))
                    ) : (
                        <p className="p-4 text-sm text-gray-500">No matching dishes found.</p>
                    )}
                </motion.div>
            )}
        </div>
    );
};

export default memo(MemoSearchComponent);
