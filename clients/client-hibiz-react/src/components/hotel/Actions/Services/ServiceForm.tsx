import type {
  IServiceCategory,
  IServicePayload,
} from "@/components/store/hotel/useHotelServices";
import BirthdayImageUploader from "@/components/templates/events/birthdayImage";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ImageIcon, Plus } from "lucide-react";

interface ServiceFormProps {
  handleCreateService: (e: React.FormEvent<HTMLFormElement>) => void;
  serviceForm: IServicePayload;
  setServiceForm: React.Dispatch<React.SetStateAction<any>>;
  errors: Record<string, string>;
  uploadImage: (
    url: string,
    setServiceForm: React.Dispatch<React.SetStateAction<any>>,
  ) => void;
  addServiceLoader: boolean;
  categories: IServiceCategory[];
}

const ServiceForm = ({
  handleCreateService,
  serviceForm,
  setServiceForm,
  errors,
  uploadImage,
  addServiceLoader,
  categories,
}: ServiceFormProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <ImageIcon className="w-5 h-5" />
          Create Services
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleCreateService} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="category-name">Service Name *</Label>
            <Input
              id="category-name"
              placeholder="e.g., AC Services, Plumbing, Electrical"
              value={serviceForm.name}
              onChange={(e) =>
                setServiceForm((prev) => ({
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
            <Label htmlFor="service-image">Service Image (Optional)</Label>
            <article className="flex gap-3">
              <BirthdayImageUploader
                image={""}
                onUploadSuccess={(url) => uploadImage(url, setServiceForm)}
              />
            </article>
          </section>
          <section className="space-y-2">
            <Label htmlFor="service-category">Link Category *</Label>
            <select
              id="service-category"
              value={serviceForm.categoryId}
              onChange={(e) => {
                const selectedCategoryId = e.target.value;
                setServiceForm((prev) => ({
                  ...prev,
                  categoryId: selectedCategoryId,
                }));
              }}
              className={`w-full border rounded px-3 py-2 ${
                errors.categoryId ? "border-red-500" : ""
              }`}
            >
              <option value="">Select a category</option>
              {categories.map((cat) => (
                <option key={cat._id} value={cat._id}>
                  {cat.name} {/* Display category name */}
                </option>
              ))}
            </select>
            {serviceForm.categoryId && (
              <div className="mt-2 text-sm text-muted-foreground">
                Selected Category:{" "}
                {
                  categories.find((cat) => cat._id === serviceForm.categoryId)
                    ?.name
                }
              </div>
            )}
            {errors.categoryId && (
              <p className="text-sm text-red-500">{errors.categoryId}</p>
            )}
          </section>
          <Button type="submit" className="w-full" disabled={addServiceLoader}>
            <Plus className="w-4 h-4 mr-2" />
            Create Service
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default ServiceForm;
