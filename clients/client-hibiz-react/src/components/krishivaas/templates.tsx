import { Button } from "@/components/ui/button"
import {lazy,memo} from "react"
import { TemplateType } from "../store/useWhatsapp";
const TemplatesCarousel = lazy(() => import("./templates-carousel"));
const MemoTemplates = () => {
    const handleCreateTemplate = (type: TemplateType) => {
        
    }
    return (
        <div className="container mx-auto max-w-[1400px] pt-4">
            <article className="flex items-center justify-between mb-6 md:mb-8">
                <h1 className="text-2xl md:text-3xl font-semibold text-[#0c4baa]">
                    WhatsApp Message Templates
                </h1>
                <ul className="hidden md:flex md:justify-center gap-2">
                    <li>
                        <Button
                            type="button"
                            variant="outline"
                            className="px-4 py-2 text-orange-500 border border-orange-500 rounded-lg shadow-lg "
                        onClick={() => handleCreateTemplate(TemplateType.Marketing)}
                        >
                            + Marketing Template
                        </Button>
                    </li>
                    <li>
                        <Button
                            type="button"
                            variant="outline"
                            className="px-4 py-2 text-orange-500 border border-orange-500 rounded-lg shadow-lg "
                        onClick={() => handleCreateTemplate(TemplateType.Utility)}
                        >
                            + Utility Template
                        </Button>
                    </li>
                </ul>
            </article>
            <div
                className="
                grid
                [--min:240px]
                grid-cols-[repeat(auto-fill,minmax(var(--min),1fr))]
                gap-5 md:gap-6 lg:gap-8 pb-[5rem]
              "
            >
                <TemplatesCarousel />
            </div>
            <article className="md:hidden flex gap-1 fixed bottom-0 right-0 left-0 w-full p-2 bg-[#ffffff]">
                <Button
                    type="button"
                    variant="outline"
                    className="text-base px-4 py-2 text-orange-500 border border-orange-500 rounded-lg shadow-lg h-12 w-full"
                onClick={() => handleCreateTemplate(TemplateType.Marketing)}
                >
                    + Marketing Template
                </Button>
                <Button
                    type="button"
                    variant="outline"
                    className="text-base px-4 py-2 text-orange-500 border border-orange-500 rounded-lg shadow-lg h-12 w-full"
                onClick={() => handleCreateTemplate(TemplateType.Utility)}
                >
                    + Utility Template
                </Button>
            </article>
        </div>
    )
}

const Templates = memo(MemoTemplates)
export default Templates