import LoadingSpinner from "@/components/atom/loadingSpinner";
import { memo, Suspense } from "react";
import { motion } from "framer-motion";
import { cn } from "@hi/common";
import MemoizedHeader from "@/components/molecules/header";
import EventSections from "@/components/templates/events";

const MemoEvents = () => {
  
    return (
        <main className="relative">
            <Suspense fallback={<LoadingSpinner />}>

                <motion.section
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    className={cn("sticky top-0 z-50 w-full bg-[#f4f4f4]")}
                >
                    <MemoizedHeader title="Events"  />
                </motion.section>
            </Suspense>
            <Suspense fallback={<LoadingSpinner />}>
                <EventSections />
            </Suspense>
        </main>
    )
}

const Events = memo(MemoEvents)
export default Events