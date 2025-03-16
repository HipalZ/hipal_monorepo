import MemoizedMainBusinessPage from "@/pages/app/business/[businessId]/themes"
import { memo } from "react"

const MemoThemes = () => {
    return (
        <MemoizedMainBusinessPage />
    )
}

const Themes = memo(MemoThemes)
export default Themes