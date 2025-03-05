import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { useQr } from "@/components/store/useQr"
import { LetterTextIcon, RotateCw } from "lucide-react"
type AspectRatio = "1:1" | "4:3" | "16:9" | "custom"


const BottomStyleSection = ({ handleRotateImage }: { handleRotateImage: () => void }) => {

    const {
        setAspectRatio,
        width,
        setWidth,
        height,
        setHeight,
        isPortrait,
        setIsPortrait,
        hideTableNames,
        setHideTableNames,
        aspectRatio,
        image,
    } = useQr(s => ({
        aspectRatio: s.aspectRatio,
        setAspectRatio: s.setAspectRatio,
        width: s.width,
        setWidth: s.setWidth,
        height: s.height,
        setHeight: s.setHeight,
        isPortrait: s.isPortrait,
        setIsPortrait: s.setIsPortrait,
        hideTableNames: s.hideTableNames,
        setHideTableNames: s.setHideTableNames,
        image: s.image,
    }))


    const handleAspectRatioChange = (value: AspectRatio) => {
        setAspectRatio(value)
        if (value === "1:1") {
            setWidth(300)
            setHeight(300)
        } else if (value === "4:3") {
            setWidth(400)
            setHeight(300)
        } else if (value === "16:9") {
            setWidth(480)
            setHeight(270)
        }
    }

    const handleWidthChange = (value: number) => {
        const newWidth = Math.min(value, 500)
        setWidth(newWidth)
        if (!isPortrait) {
            setHeight(newWidth)
        }
    }

    const handleHeightChange = (value: number) => {
        const newHeight = Math.min(value, 500)
        setHeight(newHeight)
        if (isPortrait) {
            setWidth(newHeight)
        }
    }


    return (
        <section className="md:fixed absolute mx-auto md:bottom-[6rem] max-w-[33rem] z-10 bottom-0 w-full pb-[5rem] px-4 md:pb-0 space-y-4 overflow-y-auto ">
            <div className="w-full">
                <div className="flex flex-wrap gap-2">
                    {["1:1", "4:3", "16:9", "custom"].map((ratio) => (
                        <Button
                            key={ratio}
                            variant={aspectRatio === ratio ? "default" : "outline"}
                            onClick={() => handleAspectRatioChange(ratio as AspectRatio)}
                            className="flex-1 min-w-[4rem]"
                        >
                            {ratio}
                        </Button>
                    ))}
                </div>
            </div>

            <div className="flex w-full space-x-4 max-w-[33rem] pb-2">
                <div className="flex-1">
                    <Label htmlFor="width">Width: {width}px</Label>
                    <Slider
                        id="width"
                        min={100}
                        max={500}
                        step={10}
                        value={[width]}
                        onValueChange={(value) => handleWidthChange(value[0])}
                    />
                </div>
                <div className="flex-1">
                    <Label htmlFor="height">Height: {height}px</Label>
                    <Slider
                        id="height"
                        min={100}
                        max={500}
                        step={10}
                        value={[height]}
                        onValueChange={(value) => handleHeightChange(value[0])}
                    />
                </div>
            </div>

            <div className="flex items-center gap-2">
                <div className="flex items-center space-x-2">
                    <Switch id="orientation" checked={isPortrait} onCheckedChange={setIsPortrait} />
                    <Label htmlFor="orientation">Portrait</Label>
                </div>
                {
                    image && (
                        <Button variant="outline" onClick={handleRotateImage}>
                            <RotateCw className="w-4 h-4 mr-2" />
                            Image
                        </Button>
                    )
                }
                <Button variant="outline" onClick={() => setHideTableNames(!hideTableNames)}>
                    <LetterTextIcon className="w-4 h-4 mr-2" />
                    Hide
                </Button>
            </div>
        </section>
    )
}

export default BottomStyleSection
