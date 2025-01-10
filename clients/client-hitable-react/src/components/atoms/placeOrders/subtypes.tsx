import { cn } from "@/components/utils/helpers";
import { ImageIcon } from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { motion } from "framer-motion"
import { useOrderStore } from "@/components/store/useOrderData"
import { ScrollArea } from "@/components/ui/scroll-area"
import { memo } from "react";


const MemoSubtypes = () => {
    const { selectedCategory, setSelectedCategory, allCategories } = useOrderStore()
    return (
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
    )
}

const Subtypes = memo(MemoSubtypes)
export default Subtypes
