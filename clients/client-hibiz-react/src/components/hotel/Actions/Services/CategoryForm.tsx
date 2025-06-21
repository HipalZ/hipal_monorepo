import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ImageIcon, Plus } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import BirthdayImageUploader from "@/components/templates/events/birthdayImage";
import { Button } from "@/components/ui/button";
import type { ICategoryPayload } from "@/components/store/hotel/useHotelServices";

interface CategoryFormProps {
  handleCreateCategory: (e: React.FormEvent<HTMLFormElement>) => void;
  categoryForm: ICategoryPayload;
  setCategoryForm: React.Dispatch<React.SetStateAction<any>>;
  errors: Record<string, string>;
  uploadImage: (
    url: string,
    setCategoryForm: React.Dispatch<React.SetStateAction<any>>,
  ) => void;
  addCategoryLoader: boolean;
}

const CategoryForm = ({
  handleCreateCategory,
  categoryForm,
  setCategoryForm,
  errors,
  uploadImage,
  addCategoryLoader,
}: CategoryFormProps) => {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <ImageIcon className="w-5 h-5" />
            Create Category
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleCreateCategory} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="category-name">Category Name *</Label>
              <Input
                id="category-name"
                placeholder="e.g., AC Services, Plumbing, Electrical"
                value={categoryForm.name}
                onChange={(e) =>
                  setCategoryForm((prev) => ({
                    ...prev,
                    name: e.target.value?.trimStart(),
                  }))
                }
                className={errors.categoryName ? "border-red-500" : ""}
              />
              {errors.categoryName && (
                <p className="text-sm text-red-500">{errors.categoryName}</p>
              )}
            </div>

            <section className="space-y-2">
              <Label htmlFor="category-image">Category Image (Optional)</Label>
              <article className="flex gap-3">
                <BirthdayImageUploader
                  image={""}
                  onUploadSuccess={(url) => uploadImage(url, setCategoryForm)}
                />
              </article>
            </section>

            <Button
              type="submit"
              className="w-full"
              disabled={addCategoryLoader}
            >
              <Plus className="w-4 h-4 mr-2" />
              Create Category
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default CategoryForm;
