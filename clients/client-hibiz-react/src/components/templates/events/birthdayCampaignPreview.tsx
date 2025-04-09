import { useMemo } from "react"
import birthdayImage from "@/assets/happy_birthday.png"

export interface CampaignSection {
    _id: string
    isActive: boolean
    title: string
    heading: string
    description: string
    image: string
}

export function BirthdayCampaignPreview({
    sections,
    activeTab,
}: {
    sections: CampaignSection[]
    activeTab: string
}) {
    const currentSection = useMemo(
        () => sections?.find(({ title }) => title === activeTab),
        [sections, activeTab]
    )

    if (!currentSection) return null

    return (
        <section className="p-4 mx-auto bg-white rounded-lg overflow-hidden shadow">
            <h2 className="text-xl font-bold text-center mb-4">Birthday Campaign Preview</h2>
            <section className="border-b pb-4 last:border-b-0 last:pb-0 flex items-center justify-between">
                <article className="flex-1">
                    <h3 className="text-sm font-medium text-purple-600">{currentSection.title}</h3>
                    <p className="font-bold text-lg">{currentSection.heading || "Heading"}</p>
                    <p className="text-sm text-gray-500">{currentSection.description || "description"}</p>
                </article>
                <article className="ml-4 flex-shrink-0 relative w-16 h-16 rounded-full overflow-hidden">
                    <img
                        src={currentSection.image || birthdayImage}
                        alt={currentSection.title}
                        className="object-cover"
                    />
                </article>
            </section>
        </section>
    )
}
