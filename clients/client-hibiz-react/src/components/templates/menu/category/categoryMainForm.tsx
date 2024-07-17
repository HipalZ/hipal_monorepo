import { memo } from "react";
import { cn } from "@hi/common/src/error-handler";
import { RiGitBranchLine, RiLinkUnlink } from "react-icons/ri";
import { TbCircuitSwitchClosed } from "react-icons/tb";
import useMenuPageStore from "@/components/store/useMenuStorage";
import Background from "@/components/atom/feildBackground";
import { apiRpc } from "@hi/common";

const MemoCategoryMainForm = () => {
    const { selectedCategory, setSelectedCategory, categoryName, setCategoryName } = useMenuPageStore(s => ({
        selectedCategory: s.selectedCategory,
        setSelectedCategory: s.setSelectedCategory,
        setOpenMenu: s.setOpenMenu,
        categoryName: s.categoryName,
        setCategoryName: s.setCategoryName
    }));

    // const saveCatogory = async () => {
    //     const res = await apiRpc.categories.
    // }

    return (
        <>
            <article className="mx-6 lg:mx-16 lg:mt-6">
                <label className="font-semibold opacity-50" htmlFor="name">Category Name*</label>
                <Background>

                    <input type="text" id="name"
                        placeholder="Enter Category Name"
                        value={categoryName}
                        maxLength={21}
                        onChange={(e) => setCategoryName(e.target.value)}
                        className="w-full p-2 bg-white border border-black rounded-xl focus:ring-0 focus:bg-white focus:border-[#8C63FF]" />
                </Background>
            </article>

            <section className="mx-6 mt-4 lg:mx-16 lg:mt-6">
                <label className="font-semibold opacity-50" htmlFor="name">Category type*</label>
                <article className="p-4 mt-2 bg-white rounded-xl">
                    <label className="text-xs font-semibold opacity-50" htmlFor="name">Select one type*</label>
                    <article className="flex w-full mt-4">
                        <button
                            type="button"
                            className={cn(
                                "p-6 rounded-2xl flex-1 mx-2 text-left",
                                selectedCategory === "MAIN_CATEGORY" ? "bg-[#F1E9FB] text-[#8C63FF]" : "bg-[#f4f4f490]"
                            )}
                            onClick={() => setSelectedCategory("MAIN_CATEGORY")}>
                            <RiGitBranchLine className="rotate-180" size={28} />
                            Main categories
                        </button>
                        <button
                            type="button"
                            className={cn(
                                "p-6 rounded-2xl flex-1 mx-2 text-left",
                                selectedCategory === "SUB_CATEGORY" ? "bg-[#F1E9FB] text-[#8C63FF]" : "bg-[#f4f4f490]"
                            )}
                            onClick={() => setSelectedCategory("SUB_CATEGORY")}>
                            <TbCircuitSwitchClosed size={28} className="-ml-2 rotate-90" />
                            Sub Categories
                        </button>
                    </article>
                </article>
            </section>

            {
                selectedCategory === "MAIN_CATEGORY" && (
                    <section className="mx-6 mt-4 lg:mx-16 lg:mt-6">
                        <label className="font-semibold opacity-50" htmlFor="name">Link Sub-Categories</label>
                        <Background>
                            <button type="button" className="bg-[#f4f4f4] w-full py-2 rounded-full flex items-center justify-center">
                                <RiLinkUnlink className="mr-2" />  Link Sub Categories
                            </button>
                        </Background>
                    </section>
                )
            }

            {
                selectedCategory === "SUB_CATEGORY" && (
                    <>
                        <section className="mx-6 mt-4 lg:mx-16 lg:mt-6">
                            <label className="font-semibold opacity-50" htmlFor="name">Link Sub-Categories</label>
                            <Background>
                                <button type="button" className="bg-[#f4f4f4] w-full py-2 rounded-full flex items-center justify-center">
                                    <RiLinkUnlink className="mr-2" />  Link Main Categories
                                </button>
                            </Background>
                        </section>

                        <section className="mx-6 mt-4 lg:mx-16 lg:mt-6">
                            <label className="font-semibold opacity-50" htmlFor="name">Link Dishes</label>
                            <Background>
                                <button type="button" className="bg-[#f4f4f4] w-full py-2 rounded-full flex items-center justify-center">
                                    <RiLinkUnlink className="mr-2" />  Link Dishes
                                </button>
                            </Background>
                        </section>
                    </>
                )
            }

            <footer className="absolute bottom-4 flex w-[92%] lg:w-[96%] gap-4 mx-4">
                {/* <button onClick={saveCatogory} type="button" className="w-full py-3 text-white bg-[#7D68FE] rounded-full">
                    Quick Save
                </button> */}
                <button type="button" className="w-full py-3 text-white bg-black rounded-full">
                    Next
                </button>
            </footer>
        </>
    )
}
const CategoryMainForm = memo(MemoCategoryMainForm)

export default CategoryMainForm