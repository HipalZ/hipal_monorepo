import useBusinessData from "@/components/store/useBusinessData"
import { BirthdayCampaignPreview, type CampaignSection } from "./birthdayCampaignPreview"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { useGetEvents, usePostEvents, usePutEvents } from "@/hooks/useEvents"
import { lazy, useMemo, useState } from "react";
const BirthdayImage = lazy(() => import("./birthdayImage"));

const SECTION_TITLES = [
    "Exclusive Wins",
    "Complimentary Wins",
    "Decoration",
    "Games & Activities"
]

export default function EventSections() {
    const { campaignSections: apiSections } = useGetEvents()

    const putEventMutation = usePutEvents()
    const postEventMutation = usePostEvents()

    const businessId = useBusinessData((s) => s.businessData?._id)

    const [localEdits, setLocalEdits] = useState<Record<string, Partial<any>>>({})
    const [activeTab, setActiveTab] = useState(SECTION_TITLES[0] || "")

    const sections = useMemo(() => {
        return SECTION_TITLES.map((title) => {
            const apiData = apiSections?.find((s) => s.title === title) || {};
            const edits = localEdits[title] || {};
            return {
                _id: apiData._id || "",
                title: title,
                heading: edits.heading ?? apiData.heading ?? "",
                description: edits.description ?? apiData.description ?? "",
                image: edits.image ?? apiData.image ?? "",
                isActive: edits.isActive ?? apiData.isActive ?? false,
                businessId,
            };
        });
    }, [apiSections, localEdits, businessId]);

    const updateSection = (title: string, field: string, value: string | boolean) => {
        setLocalEdits((prev) => ({
            ...prev,
            [title]: {
                ...prev[title],
                [field]: value,
            },
        }));
    };

    const handleSave = (e, section: CampaignSection) => {
        e.preventDefault()
        if (section._id) {
            putEventMutation.mutate(section)
        } else {
            postEventMutation.mutate(section)
        }
    }

    return (
        <div className="container mx-auto py-8 px-4">
            <h1 className="text-3xl font-bold mb-8">Birthday Campaign</h1>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Preview */}
                <div className="order-2 lg:order-1 sticky top-8">
                    <h2 className="text-xl font-semibold mb-4">Preview</h2>
                    <Card className="bg-gray-50 border-dashed">
                        <CardContent className="p-4">
                            <BirthdayCampaignPreview sections={sections} activeTab={activeTab} />
                        </CardContent>
                    </Card>
                </div>

                {/* Form */}
                <div className="order-1 lg:order-2">
                    <h2 className="text-xl font-semibold mb-4">Campaign Sections</h2>

                    <Tabs value={activeTab} onValueChange={setActiveTab}>
                        <TabsList className="grid grid-cols-4 mb-6">
                            {SECTION_TITLES.map((title, index) => (
                                <TabsTrigger key={title} value={title} className="text-xs sm:text-sm">
                                    {index + 1}
                                </TabsTrigger>
                            ))}
                        </TabsList>

                        {sections?.map((section) => (
                            <TabsContent key={section.title} value={section.title}>
                                <Card>
                                    <CardContent className="p-4 space-y-6">
                                        <div className="flex items-center justify-between">
                                            <h3 className="text-lg font-medium">{section.title}</h3>
                                            <div className="flex items-center space-x-2">
                                                <Label>{section.isActive ? "Enabled" : "Disabled"}</Label>
                                                <Switch
                                                    checked={section.isActive}
                                                    onCheckedChange={(checked) =>
                                                        updateSection(section.title, "isActive", checked)
                                                    }
                                                />
                                            </div>
                                        </div>

                                        <form onSubmit={(e) => handleSave(e, section)} className="space-y-4">
                                            <div>
                                                <Label>Heading *</Label>
                                                <Input
                                                    value={section.heading}
                                                    maxLength={36}
                                                    required
                                                    placeholder="Ex: Exclusive Offers"
                                                    onChange={(e) =>
                                                        updateSection(section.title, "heading", e.target.value)
                                                    }
                                                />
                                            </div>

                                            <div>
                                                <Label>Description *</Label>
                                                <Textarea
                                                    value={section.description}
                                                    required
                                                    maxLength={400}
                                                    placeholder="Ex: Best Offers on your birthday, come and visit"
                                                    onChange={(e) =>
                                                        updateSection(section.title, "description", e.target.value)
                                                    }
                                                    rows={5}
                                                    className="resize-none"
                                                />
                                            </div>

                                            <div>
                                                <Label>Image</Label>
                                                <BirthdayImage
                                                    image={section.image}
                                                    onUploadSuccess={(url) => updateSection(section.title, "image", url)}
                                                />
                                            </div>
                                            <div className="mt-8 flex justify-end">
                                                <Button variant="outline" className="mr-2">
                                                    Cancel
                                                </Button>
                                                <Button type="submit" className="bg-blue-500">
                                                    Save Changes
                                                </Button>
                                            </div>
                                        </form>
                                    </CardContent>
                                </Card>
                            </TabsContent>
                        ))}
                    </Tabs>
                </div>
            </div>
        </div>
    )
}
