import { Button } from "@/components/ui/button";
import { X, FolderPlus, Settings } from "lucide-react";
import { useState, lazy } from "react";
import useBusinessData from "@/components/store/useBusinessData";
import {
  type IServiceCategory,
  type IServicePayload,
  type ICategoryPayload,
  useAddCategory,
  useAddService,
} from "@/components/store/hotel/useHotelServices";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
const CategoryForm = lazy(() => import("./CategoryForm"));
const ServiceForm = lazy(() => import("./ServiceForm"));

const HotelServicesForm = ({
  openServices,
  categories,
}: { openServices: () => void; categories: IServiceCategory[] }) => {
  const businessId = useBusinessData((s) => s.outletInfo?.businessId);
  const { addCategory, addCategoryLoader } = useAddCategory();
  const { addService, addServiceLoader } = useAddService();
  const [categoryForm, setCategoryForm] = useState<ICategoryPayload>({
    businessId: businessId ?? "",
    availability: true,
    name: "",
    image: "",
  });

  // Service form state
  const [serviceForm, setServiceForm] = useState<IServicePayload>({
    name: "",
    categoryId: "",
    availability: true,
    businessId: businessId ?? "",
    avgAcceptanceTime: 2,
    avgCompletionTime: 4,
    avgDeliveryTime: 4,
    quantityLimit: 1,
    serviceBehavior: {
      instructionEnabled: false,
      instruction: "",
      instructionRules: [],
    },
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateCategoryForm = () => {
    const newErrors: Record<string, string> = {};
    if (!categoryForm.name.trim()) {
      newErrors.categoryName = "Category name is required";
    }
    return newErrors;
  };

  const validateServiceForm = () => {
    const newErrors: Record<string, string> = {};
    if (!serviceForm.name.trim()) {
      newErrors.serviceName = "Service name is required";
    }
    if (!serviceForm.categoryId) {
      newErrors.categoryId = "Please select a category";
    }
    const requestTime = serviceForm.avgAcceptanceTime;
    const responseTime = serviceForm.avgDeliveryTime ?? serviceForm.avgCompletionTime;
    if (requestTime == null || requestTime <= 0) {
      newErrors.requestTime = "Request time must be greater than 0";
    }
    if (responseTime == null || responseTime <= 0) {
      newErrors.responseTime = "Response time must be greater than 0";
    }
    if (requestTime != null && responseTime != null && responseTime <= requestTime) {
      newErrors.responseTime = "Response time must be greater than request time";
    }
    const quantityLimit = serviceForm.quantityLimit ?? 1;
    if (!Number.isInteger(quantityLimit) || quantityLimit < 1 || quantityLimit > 20) {
      newErrors.quantityLimit = "Quantity limit must be a whole number from 1 to 20";
    }
    const behavior = serviceForm.serviceBehavior;
    if (behavior?.instructionEnabled) {
      const instruction = behavior.instruction?.trim() || "";
      const validRules = behavior.instructionRules?.filter((rule) => rule.message?.trim()) || [];
      if (!instruction && validRules.length === 0) {
        newErrors.serviceInstruction = "Add a customer instruction or at least one time-based message";
      }
      if ((behavior.instructionRules ?? []).some((rule) => rule.message?.trim() && !/^([01]\d|2[0-3]):[0-5]\d$/.test(rule.time))) {
        newErrors.serviceInstruction = "Time-based rules need a valid time";
      }
    }
    return newErrors;
  };

  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    const categoryErrors = validateCategoryForm();
    if (Object.keys(categoryErrors).length > 0) {
      setErrors(categoryErrors);
      return;
    }
    await addCategory(categoryForm);
  };

  const handleCreateService = async (e: React.FormEvent) => {
    e.preventDefault();
    const serviceErrors = validateServiceForm();
    if (Object.keys(serviceErrors).length > 0) {
      setErrors(serviceErrors);
      return;
    }
    const cleanedBehavior = {
      instructionEnabled: Boolean(serviceForm.serviceBehavior?.instructionEnabled),
      instruction: serviceForm.serviceBehavior?.instruction?.trim() || "",
      instructionRules: (serviceForm.serviceBehavior?.instructionRules ?? [])
        .map((rule) => ({
          condition: rule.condition,
          time: rule.time,
          message: rule.message.trim(),
        }))
        .filter((rule) => rule.message),
    };
    await addService({
      ...serviceForm,
      name: serviceForm.name.trim(),
      serviceBehavior: cleanedBehavior,
    });
  };

  const uploadImage = (
    url: string,
    setForm: React.Dispatch<React.SetStateAction<any>>,
  ) => {
    setForm((prev: IServiceCategory | ICategoryPayload) => ({
      ...prev,
      image: url,
    }));
  };

  const [activeTab, setActiveTab] = useState("categories");

  return (
    <div className="mx-auto flex h-full min-h-0 w-full flex-col overflow-y-auto pr-1 lg:w-[30rem]">
      <div className="flex items-center justify-between mb-2">
        <div>
          <h1 className="text-2xl font-bold">Create Categories & Services</h1>
          <p className="text-sm text-muted-foreground">
            Create categories first, then link services to them
          </p>
        </div>
      </div>
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-4 h-12">
          <TabsTrigger
            value="categories"
            className="flex items-center gap-2 text-base"
          >
            <FolderPlus className="w-4 h-4" />
            Categories
          </TabsTrigger>
          <TabsTrigger
            value="services"
            className="flex items-center gap-2 text-base"
          >
            <Settings className="w-4 h-4" />
            Services
          </TabsTrigger>
        </TabsList>

        <TabsContent value="categories" className="mt-0">
          <CategoryForm
            handleCreateCategory={handleCreateCategory}
            categoryForm={categoryForm}
            setCategoryForm={setCategoryForm}
            errors={errors}
            uploadImage={uploadImage}
            addCategoryLoader={addCategoryLoader}
          />
        </TabsContent>

        <TabsContent value="services" className="mt-0">
          <ServiceForm
            handleCreateService={handleCreateService}
            serviceForm={serviceForm}
            setServiceForm={setServiceForm}
            errors={errors}
            uploadImage={uploadImage}
            addServiceLoader={addServiceLoader}
            categories={categories}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default HotelServicesForm;
