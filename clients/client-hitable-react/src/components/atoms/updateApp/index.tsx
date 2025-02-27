import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import MiddlePopUpMemo from "../middlePopUp"
import { Button } from "@/components/ui/button"
import { useLiteStore } from "@/components/store/useLiteStore"
import hipalLogo from "@/assets/svg/HiTableLogo.svg"

const UpdateApp = () => {
    const {
        isVersionPopup,
        setIsVersionPopup,
        updateUrl,
        updateFeature,
    } = useLiteStore()
    const handleUpdateApp = () => {
        setIsVersionPopup(false);
        window.open(updateUrl, "_blank");
    }
    return (
        <>
            {isVersionPopup && (
                <MiddlePopUpMemo onClose={() => setIsVersionPopup(false)} show={isVersionPopup}>
                    <section className="h-[90dvh] flex flex-col items-center justify-center px-4">
                        <Card className="w-full max-w-md border-none shadow-none">
                            <CardHeader className="text-center space-y-2">
                                <div className="mx-auto">
                                    <img src={hipalLogo} alt="hipal" />
                                </div>
                                <CardTitle className="text-2xl sm:text-3xl">Update Available!</CardTitle>
                                <CardDescription className="text-base">
                                    A new version of the app is available with improved features and bug fixes.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="rounded-lg bg-muted p-4">
                                    <h3 className="font-medium mb-2">What's New:</h3>
                                    <ul className="space-y-2 text-sm">
                                        {updateFeature?.map((feature) => (
                                            <li className="flex items-center" key={feature}>
                                                <span className="h-1.5 w-1.5 rounded-full bg-primary mr-2" />
                                                {feature}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                                <div className="flex flex-col gap-2">
                                    <Button size="lg" className="w-full text-base font-medium" onClick={handleUpdateApp}>
                                        Update App
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </section>
                </MiddlePopUpMemo>
            )}
        </>
    )
}

export default UpdateApp