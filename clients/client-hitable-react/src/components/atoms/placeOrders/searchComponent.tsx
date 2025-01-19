import { useOrderStore } from "@/components/store/useOrderData";
import { Input } from "@/components/ui/input";
import { memo, useMemo, useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import DishQuantityButton from "./dishQuantityBtn";
import { X, Search } from 'lucide-react'; // Using Lucide icons

const AnimatedPlaceholder = ({ text }: { text: string }) => (
    <AnimatePresence mode="wait">
        <motion.span
            key={text}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="absolute left-[7.5rem] lg:left-[7rem] text-sm text-gray-400 pointer-events-none top-[0.55rem] md:top-[0.5]"
        >
            {text}...
        </motion.span>
    </AnimatePresence>
);

const PLACEHOLDER_DISHES = [
    "Butter Chicken",
    "Margherita Pizza",
    "Sushi Roll",
    "Pad Thai",
];

const MemoSearchComponent = () => {
    const {
        allDishes,
        searchActive,
        searchTerm,
        setSearchActive,
        setSearchTerm,
    } = useOrderStore();

    const [placeholderIndex, setPlaceholderIndex] = useState(0);

    const filteredDishes = useMemo(() => {
        return allDishes.filter((dish) =>
            dish.name.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [allDishes, searchTerm]);

    // Clear search input and deactivate search
    const handleClearSearch = () => {
        setSearchTerm("");
        setSearchActive(false);
    };

    // Cycle through placeholder dishes
    useEffect(() => {
        const interval = setInterval(() => {
            setPlaceholderIndex((prevIndex) =>
                (prevIndex + 1) % PLACEHOLDER_DISHES.length
            );
        }, 3000);

        return () => clearInterval(interval);
    }, []);

    return (
        <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="sticky z-[1] px-2 pt-4 pb-2 -mx-2 -mt-4  bg-white border-b border-gray-300 placeholder:text-sm -top-2 md:-top-4 md:pb-3"
        >
            <div className="relative w-full">
                <Input
                    type="text"
                    value={searchTerm}
                    onFocus={() => setSearchActive(true)}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-10 border border-gray-300 rounded-md"
                    placeholder="Search for"
                />
                {!searchTerm && (
                    <AnimatedPlaceholder text={PLACEHOLDER_DISHES[placeholderIndex]} />
                )}
                <Search className="absolute w-5 h-5 text-gray-400 -translate-y-1/2 left-3 top-1/2" />
                <button
                    type="button"
                    onClick={handleClearSearch}
                    className="absolute text-gray-500 -translate-y-1/2 top-1/2 right-3 hover:text-gray-700"
                >
                    <X className="w-5 h-5" />
                </button>
            </div>

            {/* Search Results List */}
            <AnimatePresence>
                {searchActive && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        transition={{ duration: 0.3 }}
                        className="mt-4 bg-white border border-gray-300 rounded-md shadow-md max-h-[55dvh] overflow-y-auto"
                    >
                        {filteredDishes.length > 0 ? (
                            filteredDishes.map((dish) => (
                                <motion.div
                                    key={dish._id}
                                    initial={{ opacity: 0, y: 5 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.2 }}
                                    className="flex items-center justify-between p-4 border-b last:border-none"
                                >
                                    <div>
                                        <p className="text-sm font-medium">{dish.name}</p>
                                        <p className="text-xs text-gray-500">₹{dish.price}</p>
                                    </div>
                                    <DishQuantityButton dishData={dish} />
                                </motion.div>
                            ))
                        ) : (
                            <motion.p
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="p-4 text-sm text-gray-500"
                            >
                                No matching dishes found.
                            </motion.p>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};

export default memo(MemoSearchComponent);

