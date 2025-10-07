import { BusinessCategoryImages } from "@/components/businessImageUploader"
import { useParams } from "react-router-dom"


export default function BusinessCategoryImagesPage() {
  const params = useParams()
  const categoryId = params.categoryId as string

  return (
    <div className="min-h-screen bg-gray-50">
      <BusinessCategoryImages  categoryId={categoryId} />
    </div>
  )
}
