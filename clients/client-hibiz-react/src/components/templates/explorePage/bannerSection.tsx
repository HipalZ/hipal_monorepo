import { lazy, memo, useCallback, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { ExplorePages, useExploreStore } from "@/components/store/useExploreStore"
import type { IBannerPayload } from "@/components/types/businessData"
import { useBanners } from "@/hooks/useExplore"
import LoadingSpinner from "@/components/atom/loadingSpinner"

const SubHeader = lazy(() => import("@/components/atom/subHeader"))
const PlusButton = lazy(() => import("@/components/atom/plusButton"))
const BannersExplorePage = lazy(() => import("../createdBannerLayouts"))

const MemoBannerSection = () => {
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const { bannersLoading } = useBanners()
  const { setToggleExplorePages, banners } = useExploreStore((state) => ({
    setToggleExplorePages: state.setToggleExplorePages,
    banners: state.banners,
  }))
  const handleNavigation = useCallback(() => {
    setToggleExplorePages(ExplorePages.BANNERS)
  }, [setToggleExplorePages])

  const scroll = (direction: "left" | "right") => {
    if (scrollContainerRef.current) {
      const scrollAmount = 400 // Adjust this value to control scroll distance
      const container = scrollContainerRef.current
      const targetScroll =
        direction === "left" ? container.scrollLeft - scrollAmount : container.scrollLeft + scrollAmount

      container.scrollTo({
        left: targetScroll,
        behavior: "smooth",
      })
    }
  }

  if (bannersLoading) {
    return (
      <article className="h-96">
        <LoadingSpinner />
      </article>
    )
  }

  return (
    <section className="mb-4 relative">
      <SubHeader text="Banners" />

      {/* Banner Container */}
      <div className="relative group">
        {/* Left Arrow */}
        <AnimatePresence>
          <motion.button
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            onClick={() => scroll("left")}
            type="button"
            className="hidden md:flex absolute left-2 top-1/2 -translate-y-1/2 z-10 items-center justify-center w-10 h-10 rounded-full bg-white/80 backdrop-blur-3xl shadow-lg hover:bg-white transition-all duration-200 group-hover:opacity-100 opacity-0"
          >
            <ChevronLeft className="w-6 h-6 text-gray-700" />
          </motion.button>
        </AnimatePresence>

        {/* Right Arrow */}
        <AnimatePresence>
          <motion.button
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            type="button"
            onClick={() => scroll("right")}
            className="hidden md:flex absolute right-2 top-1/2 -translate-y-1/2 z-10 items-center justify-center w-10 h-10 rounded-full bg-white/80 backdrop-blur-lg shadow-3xl hover:bg-white transition-all duration-200 group-hover:opacity-100 opacity-0"
          >
            <ChevronRight className="w-6 h-6 text-gray-700" />
          </motion.button>
        </AnimatePresence>

        {/* Banners Container */}
        <article
          ref={scrollContainerRef}
          onClick={handleNavigation}
          onKeyDown={handleNavigation}
          className="flex items-center gap-4 p-2 overflow-x-auto bg-white rounded-lg flex-nowrap scroll-smooth hide-scrollbar"
        >
          {banners?.map((banner: IBannerPayload) => (
            <BannersExplorePage key={banner?._id} banner={banner} />
          ))}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.2 }}
            className="ml-2 aspect-square shrink-0 relative rounded-xl h-[12rem] lg:h-[12rem] border-dashed border-2 border-[#8C63FF] hover:border-[#7047ff] transition-colors"
          >
            <label className="flex items-center justify-center w-full h-full overflow-hidden cursor-pointer rounded-xl">
              <PlusButton />
            </label>
          </motion.div>
        </article>
      </div>
    </section>
  )
}

const BannerSection = memo(MemoBannerSection)
export default BannerSection

