import {
  lazy,
  useState,
  useCallback,
  useEffect,
  Suspense,
  useMemo,
  type ChangeEvent,
} from "react";
import {
  ToggleLeft,
  ToggleRight,
  Settings,
  Loader2,
  Search,
  Clock,
  Timer,
  MoreVertical,
  Trash,
  Edit,
  GripVertical,
  ChevronUp,
  ChevronDown,
  ArrowUpDown,
  CheckCircle2,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import LoadingSpinner from "@/components/atom/loadingSpinner";
import { toast } from "react-hot-toast";
import useBusinessData from "@/components/store/useBusinessData";
import {
  type IService,
  useDeleteHotelService,
  useGetServiceCategories,
  useUpdateHotelService,
} from "@/components/store/hotel/useHotelServices";
import AdvancedBottomButton from "@/components/atom/bottomButton/advancedBottomButton";
import PopUp from "@/components/atom/popUp";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  useUpdateCategorySequence,
  useUpdateServiceSequence,
} from "@/components/store/hotel/useHotelServices";

const BirthdayImageUploader = lazy(
  () => import("@/components/templates/events/birthdayImage"),
);
const ServicesForm = lazy(() => import("./HotelServices"));

interface EditServiceData {
  _id: string;
  name: string;
  availability: boolean;
  image?: string;
  categoryName: string;
  avgAcceptanceTime?: number;
  avgCompletionTime?: number;
}

const HotelServices = () => {
  const businessId = useBusinessData((s) => s.businessData?._id);
  const { categoriesData, categoriesLoading } = useGetServiceCategories(
    businessId as string,
  );
  const { updateService } = useUpdateHotelService();
  const { deleteService } = useDeleteHotelService();
  const { updateCategorySequence } = useUpdateCategorySequence();
  const { updateServiceSequence } = useUpdateServiceSequence();

  const [searchQuery, setSearchQuery] = useState("");
  const [isReorderMode, setIsReorderMode] = useState(false);
  const [localCategories, setLocalCategories] = useState<any[]>([]);
  // Track pending order changes — API is only called on explicit "Save Order"
  const [isDirty, setIsDirty] = useState(false);
  const [isSavingOrder, setIsSavingOrder] = useState(false);

  const [serviceAvailability, setServiceAvailability] = useState<
    Record<string, boolean>
  >({});

  const [openService, setOpenService] = useState(false);

  const [editingService, setEditingService] = useState<EditServiceData | null>(
    null,
  );
  const [showEditModal, setShowEditModal] = useState(false);
  const [newImageUrl, setNewImageUrl] = useState<string | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [responseMin, setResponseMin] = useState<string>("");
  const [resolutionMin, setResolutionMin] = useState<string>("");

  useEffect(() => {
    if (categoriesData) {
      const availabilityMap: Record<string, boolean> = {};

      for (const category of categoriesData) {
        for (const service of category.serviceIds) {
          availabilityMap[service._id] =
            service.availability !== undefined ? service.availability : true;
        }
      }

      setServiceAvailability(availabilityMap);
      setLocalCategories(categoriesData);
    }
  }, [categoriesData]);

  // ── Batch save: called only when user clicks "Save Order" ──────────────────
  const handleSaveOrder = useCallback(async () => {
    if (!businessId || !isDirty) return;
    try {
      setIsSavingOrder(true);
      // 1) Category sequence — one call
      const categorySequences = localCategories.map((cat, idx) => ({
        id: cat._id,
        sequence: idx,
      }));
      await updateCategorySequence({ sequences: categorySequences, businessId });

      // 2) Service sequences — one call per category
      for (const category of localCategories) {
        const serviceSequences = category.serviceIds.map(
          (svc: any, idx: number) => ({ id: svc._id, sequence: idx }),
        );
        await updateServiceSequence({ sequences: serviceSequences, businessId });
      }

      setIsDirty(false);
      toast.success("Order saved!");
    } catch (e: any) {
      toast.error(e?.message ?? "Failed to save order");
    } finally {
      setIsSavingOrder(false);
    }
  }, [businessId, isDirty, localCategories, updateCategorySequence, updateServiceSequence]);

  // Discard: reset to last confirmed server state
  const handleDiscardOrder = useCallback(() => {
    if (categoriesData) setLocalCategories(categoriesData);
    setIsDirty(false);
  }, [categoriesData]);

  // Sensors for dnd-kit
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const handleDragEndCategory = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      setLocalCategories((items) => {
        const oldIndex = items.findIndex((i) => i._id === active.id);
        const newIndex = items.findIndex((i) => i._id === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
      setIsDirty(true);
    }
  };

  const handleDragEndService = (categoryId: string, event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      setLocalCategories((items) => {
        const categoryIndex = items.findIndex((c) => c._id === categoryId);
        if (categoryIndex === -1) return items;
        const services = [...items[categoryIndex].serviceIds];
        const oldIndex = services.findIndex((s) => s._id === active.id);
        const newIndex = services.findIndex((s) => s._id === over.id);
        const newServices = arrayMove(services, oldIndex, newIndex);
        const newItems = [...items];
        newItems[categoryIndex] = { ...newItems[categoryIndex], serviceIds: newServices };
        return newItems;
      });
      setIsDirty(true);
    }
  };

  // ── Arrow-button nudge for categories (local only — no API) ────────────────
  const nudgeCategory = useCallback(
    (categoryId: string, direction: "up" | "down") => {
      setLocalCategories((items) => {
        const idx = items.findIndex((c) => c._id === categoryId);
        const targetIdx = direction === "up" ? idx - 1 : idx + 1;
        if (targetIdx < 0 || targetIdx >= items.length) return items;
        return arrayMove(items, idx, targetIdx);
      });
      setIsDirty(true);
    },
    [],
  );

  // ── Arrow-button nudge for services (local only — no API) ──────────────────
  const nudgeService = useCallback(
    (categoryId: string, serviceId: string, direction: "up" | "down") => {
      setLocalCategories((items) => {
        const catIdx = items.findIndex((c) => c._id === categoryId);
        if (catIdx === -1) return items;
        const services = [...items[catIdx].serviceIds];
        const svcIdx = services.findIndex((s) => s._id === serviceId);
        const targetIdx = direction === "up" ? svcIdx - 1 : svcIdx + 1;
        if (targetIdx < 0 || targetIdx >= services.length) return items;
        const newServices = arrayMove(services, svcIdx, targetIdx);
        const newItems = [...items];
        newItems[catIdx] = { ...newItems[catIdx], serviceIds: newServices };
        return newItems;
      });
      setIsDirty(true);
    },
    [],
  );

  const handleServiceClick = useCallback(
    (service: IService, categoryName: string) => {
      setEditingService({
        _id: service._id,
        name: service.name,
        availability: serviceAvailability[service._id] || false,
        image: service.image,
        categoryName,
        avgAcceptanceTime: service.avgAcceptanceTime,
        avgCompletionTime: service.avgCompletionTime,
      });
      setResponseMin(
        service.avgAcceptanceTime != null
          ? String(service.avgAcceptanceTime)
          : "",
      );
      setResolutionMin(
        service.avgCompletionTime != null
          ? String(service.avgCompletionTime)
          : "",
      );
      setNewImageUrl(null);
      setShowEditModal(true);
    },
    [serviceAvailability],
  );

  const handleImageUploadSuccess = useCallback(
    (url: string) => {
      if (editingService?.image === url) {
        toast.error("This image is already uploaded");
        return;
      }
      setNewImageUrl(url);
      toast.success("Image uploaded successfully");
    },
    [editingService?.image],
  );

  const handleSaveService = useCallback(async () => {
    if (!editingService || !businessId) return;

    try {
      setUploadingImage(true);
      const imageUrl = newImageUrl || editingService.image;
      const payload: any = {
        name: editingService.name,
        businessId,
        availability: editingService.availability,
        serviceId: editingService._id,
        image: imageUrl,
      };
      if (Number(responseMin) != null) payload.avgAcceptanceTime = Number(responseMin);
      if (Number(resolutionMin) != null) payload.avgCompletionTime = Number(resolutionMin);
      await updateService(payload);

      setServiceAvailability((prev) => ({
        ...prev,
        [editingService._id]: editingService.availability,
      }));

      toast.success("Service updated successfully");
      setShowEditModal(false);
      setEditingService(null);
      setNewImageUrl(null);
    } catch (error: any) {
      const message =
        error?.response?.data?.message ||
        error?.data?.message ||
        error?.message ||
        "Failed to update service";
      toast.error(message);
    } finally {
      setUploadingImage(false);
    }
  }, [
    editingService,
    businessId,
    newImageUrl,
    updateService,
    responseMin,
    resolutionMin,
  ]);

  const handleCloseEditModal = useCallback(() => {
    setShowEditModal(false);
    setEditingService(null);
    setNewImageUrl(null);
    setResponseMin("");
    setResolutionMin("");
  }, []);

  const filteredCategories = useMemo(() => {
    if (!categoriesData || !searchQuery.trim()) return categoriesData;

    return categoriesData
      .map((category) => {
        const filteredServices = category.serviceIds.filter((service) =>
          service.name.toLowerCase().includes(searchQuery.toLowerCase()),
        );
        return { ...category, serviceIds: filteredServices };
      })
      .filter((category) => category.serviceIds.length > 0);
  }, [categoriesData, searchQuery]);

  const totalServices = useMemo(() => {
    return (
      categoriesData?.reduce(
        (count, category) => count + category.serviceIds.length,
        0,
      ) || 0
    );
  }, [categoriesData]);

  const filteredServicesCount = useMemo(() => {
    return (
      filteredCategories?.reduce(
        (count, category) => count + category.serviceIds.length,
        0,
      ) || 0
    );
  }, [filteredCategories]);

  const openServices = useCallback(() => {
    setOpenService(!openService);
  }, [openService]);

  const handleChange =
    (setter: (v: string) => void) => (e: ChangeEvent<HTMLInputElement>) => {
      const raw = e.target.value.replace(/[^\d]/g, "");
      setter(raw);
    };

  const toInt = (time: string) => {
    if (!time?.trim()) return null;
    const timeInNumber = Number.parseInt(time, 10);
    return Number.isFinite(timeInNumber) ? timeInNumber : null;
  };

  const response = toInt(responseMin);
  const resolution = toInt(resolutionMin);

  const cmpError =
    response !== null && resolution !== null && resolution <= response
        ? "Fulfillment time must be greater than response time"
      : "";

  const bothEmpty = response === null && resolution === null;
  const canSave =
    bothEmpty || (response !== null && resolution !== null && resolution > response);

  const fmtDuration = useCallback((time?: number | null) => {
    if (time == null) return "—";
    if (time < 60) return `${time} min`;
    const h = Math.floor(time / 60);
    const m = time % 60;
    return m ? `${h}h ${m}m` : `${h}h`;
  }, []);

  const handleDeleteService = useCallback(
    async (service: IService) => {
      if (!businessId) {
        toast.error("Missing business id");
        return;
      }
      const ok = window.confirm(
        `Delete "${service.name}"? This action cannot be undone.`,
      );
      if (!ok) return;
      try {
        await deleteService({ serviceId: service._id, businessId });
        toast.success("Service deleted");
      } catch (e: any) {
        toast.error(e?.message ?? "Failed to delete service");
      }
    },
    [businessId, deleteService],
  );

  // ── Service card (normal view) ─────────────────────────────────────────────
  const ServiceCard = useCallback(
    ({
      service,
      categoryName,
    }: { service: IService; categoryName: string }) => {
      const isAvailable = serviceAvailability[service._id] ?? true;
      const hasTimingIssue =
        typeof service.avgAcceptanceTime === "number" &&
        typeof service.avgCompletionTime === "number" &&
        service.avgCompletionTime <= service.avgAcceptanceTime;

      return (
        <div
          className={`group relative flex flex-col rounded-xl border bg-card transition-all hover:shadow-sm hover:border-primary/30 ${
            !isAvailable ? "opacity-70" : ""
          }`}
        >
          {/* ── Main row: avatar + name + status + actions ── */}
          <div className="flex items-center gap-3 px-3 py-3">
            {/* Avatar */}
            <div className="relative shrink-0">
              <div className="w-10 h-10 overflow-hidden rounded-lg bg-primary/8">
                {service.image ? (
                  <img
                    src={service.image}
                    alt={service.name}
                    className="object-cover w-full h-full"
                  />
                ) : (
                  <div className="flex items-center justify-center w-full h-full">
                    <span className="text-base font-bold text-primary">
                      {service.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}
              </div>
              {/* Availability dot on avatar */}
              <span
                className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-card ${
                  isAvailable ? "bg-green-500" : "bg-gray-400"
                }`}
              />
            </div>

            {/* Name + category */}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold leading-tight truncate">
                {service.name}
              </p>
              <p className="text-xs text-muted-foreground mt-0.5 truncate">
                {isAvailable ? (
                  <span className="text-green-600">Available</span>
                ) : (
                  <span className="text-muted-foreground">Unavailable</span>
                )}
              </p>
            </div>

            {/* Actions — always visible on mobile, hover on desktop */}
            <div className="flex items-center gap-0.5 shrink-0">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 rounded-lg opacity-60 hover:opacity-100 hover:bg-primary/8 hover:text-primary"
                onClick={() => handleServiceClick(service, categoryName)}
                title="Edit"
              >
                <Edit className="w-3.5 h-3.5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 rounded-lg opacity-60 hover:opacity-100 hover:bg-destructive/10 hover:text-destructive"
                onClick={() => handleDeleteService(service)}
                title="Delete"
              >
                <Trash className="w-3.5 h-3.5" />
              </Button>
            </div>
          </div>

          {/* ── Time strip ────────────────────────────────────────────────── */}
          <div className="flex border-t divide-x rounded-b-xl overflow-hidden bg-muted/30">
            <div className="flex-1 flex items-center gap-1.5 px-3 py-2">
              <Clock className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span className="text-xs text-muted-foreground">Response</span>
              <span className="ml-auto text-xs font-medium tabular-nums">
                {fmtDuration(service.avgAcceptanceTime)}
              </span>
            </div>
            <div className="flex-1 flex items-center gap-1.5 px-3 py-2">
              <Timer className="w-3.5 h-3.5 text-purple-600 shrink-0" />
              <span className="text-xs text-muted-foreground">Fulfill</span>
              <span className="ml-auto text-xs font-medium tabular-nums">
                {fmtDuration(service.avgCompletionTime)}
              </span>
            </div>
          </div>

          {/* ── Timing warning ────────────────────────────────────────────── */}
          {hasTimingIssue && (
            <div className="px-3 pb-2 pt-0">
              <p className="text-[11px] text-rose-500">
                ⚠ Fulfillment time should exceed response time
              </p>
            </div>
          )}
        </div>
      );
    },
    [serviceAvailability, handleServiceClick, handleDeleteService, fmtDuration],
  );


  const EmptyState = () => {
    return (
      <Card className="p-8 mt-4 text-center">
        <div className="flex flex-col items-center justify-center space-y-3">
          <div className="p-4 rounded-full shadow-lg bg-gradient-to-br from-blue-400 to-blue-600">
            <Settings className="w-10 h-10 text-white drop-shadow-md" />
          </div>
          <h3 className="text-lg font-medium">No Services Available</h3>
          <p className="text-sm text-muted-foreground">
            No services have been configured for this hotel yet
          </p>
        </div>
      </Card>
    );
  };

  const NoResults = () => {
    return (
      <div className="py-10 text-center">
        <div className="p-4 mx-auto rounded-full bg-muted w-fit">
          <Search className="w-8 h-8 text-muted-foreground" />
        </div>
        <h3 className="mt-4 text-lg font-medium">
          No services match your search
        </h3>
        <p className="mt-2 text-sm text-muted-foreground">
          Try a different search term
        </p>
        <Button
          variant="outline"
          className="mt-4 bg-transparent"
          onClick={() => setSearchQuery("")}
        >
          Clear Search
        </Button>
      </div>
    );
  };

  return (
    <div className="space-y-3 mb-32">

      {/* ── Compact top bar ────────────────────────────────────────────────── */}
      <div className="flex items-center gap-2">
        {!isReorderMode ? (
          <div className="relative flex-1">
            <Search className="absolute w-4 h-4 -translate-y-1/2 left-3 top-1/2 text-muted-foreground pointer-events-none" />
            <Input
              placeholder="Search services..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-8 h-9 text-sm"
            />
            {searchQuery && (
              <button
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground text-lg leading-none"
                onClick={() => setSearchQuery("")}
              >
                ×
              </button>
            )}
          </div>
        ) : (
          <span className="flex-1 text-sm">
            {isDirty ? (
              <span className="text-amber-600 font-medium">● Unsaved changes</span>
            ) : (
              <span className="text-muted-foreground">Drag or tap ↑ ↓ to reorder</span>
            )}
          </span>
        )}

        {/* Reorder toggle — filled by default so it's always visible */}
        <Button
          size="sm"
          variant={isReorderMode ? "outline" : "default"}
          onClick={() => {
            if (isReorderMode && isDirty) {
              const ok = window.confirm("Discard unsaved order changes?");
              if (!ok) return;
              handleDiscardOrder();
            }
            setIsReorderMode((v) => !v);
          }}
          className="gap-1.5 shrink-0"
        >
          <ArrowUpDown className="w-3.5 h-3.5" />
          {isReorderMode ? "Done" : "Reorder"}
        </Button>

        <Badge variant="secondary" className="px-2 py-1 shrink-0 text-xs tabular-nums">
          {totalServices}
        </Badge>
      </div>

      {searchQuery && !isReorderMode && (
        <p className="text-xs text-muted-foreground px-0.5">
          {filteredServicesCount} result{filteredServicesCount !== 1 ? "s" : ""} for &quot;{searchQuery}&quot;
        </p>
      )}



      {categoriesLoading ? (
        <div className="flex justify-center py-10">
          <LoadingSpinner />
        </div>
      ) : localCategories && localCategories.length > 0 ? (
        <div className="space-y-8">
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEndCategory}
          >
            <SortableContext
              items={localCategories.map((c) => c._id)}
              strategy={verticalListSortingStrategy}
              disabled={!isReorderMode}
            >
              {localCategories
                .filter((category) => {
                  if (!searchQuery.trim() || isReorderMode) return true;
                  return category.serviceIds.some((s: any) =>
                    s.name.toLowerCase().includes(searchQuery.toLowerCase()),
                  );
                })
                .map((category, catIdx) => (
                  <SortableCategoryWrapper
                    key={category._id}
                    category={category}
                    catIdx={catIdx}
                    totalCategories={localCategories.length}
                    isReorderMode={isReorderMode}
                    onDragEndService={(e: DragEndEvent) =>
                      handleDragEndService(category._id, e)
                    }
                    onNudgeCategory={nudgeCategory}
                    onNudgeService={nudgeService}
                    sensors={sensors}
                    ServiceCard={ServiceCard}
                    searchQuery={isReorderMode ? "" : searchQuery}
                  />
                ))}
            </SortableContext>
          </DndContext>
          {/* Smart bottom bar */}
          {isReorderMode && isDirty ? (
            <AdvancedBottomButton
              fixed={true}
              maxWidth="30rem"
              buttons={[
                {
                  text: "Discard",
                  onClick: handleDiscardOrder,
                  className: "w-full rounded-md bg-muted text-foreground hover:bg-muted/80",
                },
                {
                  text: isSavingOrder ? "Saving…" : "Save Order",
                  onClick: handleSaveOrder,
                  className: "w-full rounded-md bg-green-600 hover:bg-green-700 text-white",
                },
              ]}
            />
          ) : !isReorderMode ? (
            <AdvancedBottomButton
              fixed={true}
              maxWidth="30rem"
              buttons={[
                {
                  text: "Add Services",
                  onClick: openServices,
                  className: "w-full pl-3 rounded-md",
                },
              ]}
            />
          ) : null}
        </div>
      ) : searchQuery ? (
        <NoResults />
      ) : (
        <EmptyState />
      )}

      {/* Edit Service Modal */}
      <PopUp
        width="w-[30rem] md:w-[40rem]"
        height="h-auto"
        show={showEditModal}
        onClose={handleCloseEditModal}
        rightTopBack
      >
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Edit Service</h3>
          </div>

          {editingService && (
            <>
              <div className="space-y-1">
                <Label htmlFor="service-name" className="text-sm font-medium">Service Name</Label>
                <Input
                  id="service-name"
                  value={editingService.name}
                  onChange={(e) =>
                    setEditingService((prev) =>
                      prev ? { ...prev, name: e.target.value } : null,
                    )
                  }
                  placeholder="Service name"
                  className="font-medium"
                />
                <p className="text-sm text-muted-foreground">
                  Category: {editingService.categoryName}
                </p>
              </div>
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <Label className="text-sm font-medium">Availability</Label>
                  <p className="text-xs text-muted-foreground">
                    Toggle service availability for customers
                  </p>
                </div>
                <Switch
                  checked={editingService.availability}
                  onCheckedChange={(checked) =>
                    setEditingService((prev) =>
                      prev ? { ...prev, availability: checked } : null,
                    )
                  }
                />
              </div>
              <div className="flex justify-between w-full gap-4">
                {/* Response Time */}
                <div className="w-[45%]">
                  <Label htmlFor="responseMin" className="text-sm font-medium">
                    Response Time (min)
                  </Label>
                  <div className="relative mt-1">
                    <Input
                      id="responseMin"
                      type="text"
                      inputMode="numeric"
                      placeholder="e.g., 2"
                      value={responseMin}
                      onChange={handleChange(setResponseMin)}
                      aria-invalid={!!cmpError}
                      className="pr-10"
                      maxLength={4}
                      onWheel={(e) => (e.target as HTMLInputElement).blur()}
                    />
                    <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
                      min
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Time to acknowledge the service request.
                  </p>
                </div>

                {/* Fulfillment Time */}
                <div className="w-[45%]">
                  <Label htmlFor="resolutionMin" className="text-sm font-medium">
                    Fulfillment Time (min)
                  </Label>
                  <div className="relative mt-1">
                    <Input
                      id="resolutionMin"
                      type="text"
                      inputMode="numeric"
                      placeholder="e.g., 60"
                      value={resolutionMin}
                      onChange={handleChange(setResolutionMin)}
                      aria-invalid={!!cmpError}
                      className="pr-10"
                      maxLength={4}
                      onWheel={(e) => (e.target as HTMLInputElement).blur()}
                    />
                    <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
                      min
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Time to complete after staff accepts.
                  </p>
                </div>
              </div>
              <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-muted-foreground">
                <div className="mb-1 font-semibold text-slate-700">SLA terms</div>
                <div className="grid gap-1 sm:grid-cols-3">
                  <span>Response: raised to accepted</span>
                  <span>Fulfillment: accepted to completed</span>
                  <span>Total SLA: response + fulfillment</span>
                </div>
              </div>
              <div className="space-y-3">
                <Label className="text-sm font-medium">Service Image</Label>
                <BirthdayImageUploader
                  image={newImageUrl || editingService.image || ""}
                  onUploadSuccess={handleImageUploadSuccess}
                />
                <p className="text-xs text-muted-foreground">
                  Upload a new image or keep the existing one. Images are
                  automatically uploaded to cloud storage.
                </p>
                {!canSave && (
                  <Label className="text-sm font-medium text-rose-500">
                    Note: Response Time should be less than Fulfillment Time.
                  </Label>
                )}
              </div>
              <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline" onClick={handleCloseEditModal}>
                  Cancel
                </Button>
                <Button
                  onClick={handleSaveService}
                  disabled={uploadingImage || !canSave}
                >
                  {uploadingImage ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    "Save Changes"
                  )}
                </Button>
              </div>
            </>
          )}
        </div>
      </PopUp>

      {/* Add Services Modal */}
      <PopUp
        width="w-[30rem] md:w-[48rem]"
        height="h-[100dvh] lg:h-[90dvh]"
        show={openService}
        onClose={openServices}
        rightTopBack
      >
        <Suspense fallback={<LoadingSpinner />}>
          <ServicesForm
            openServices={openServices}
            categories={categoriesData}
          />
        </Suspense>
      </PopUp>
    </div>
  );
};

// ── Sortable Category Wrapper ────────────────────────────────────────────────
const SortableCategoryWrapper = ({
  category,
  catIdx,
  totalCategories,
  isReorderMode,
  onDragEndService,
  onNudgeCategory,
  onNudgeService,
  sensors,
  ServiceCard,
  searchQuery,
}: any) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: category._id,
    disabled: !isReorderMode,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 10 : 1,
    opacity: isDragging ? 0.5 : 1,
  };

  const filteredServices = category.serviceIds.filter((s: any) =>
    s.name.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <div ref={setNodeRef} style={style} className="space-y-3">
      {/* Category header row */}
      <div
        className={`flex items-center justify-between rounded-lg px-3 py-2 transition-colors ${
          isReorderMode ? "bg-muted/60 border border-dashed border-muted-foreground/30" : ""
        }`}
      >
        <div className="flex items-center gap-3 flex-1 min-w-0">
          {/* Drag handle — visible and obvious in reorder mode */}
          {isReorderMode && (
            <div
              {...attributes}
              {...listeners}
              className="cursor-grab active:cursor-grabbing p-1.5 rounded hover:bg-muted-foreground/10 touch-none shrink-0"
              title="Drag to reorder"
            >
              <GripVertical className="w-5 h-5 text-muted-foreground" />
            </div>
          )}

          {/* Sequence number in reorder mode */}
          {isReorderMode && (
            <span className="text-xs font-mono font-bold text-muted-foreground w-5 shrink-0">
              {catIdx + 1}.
            </span>
          )}

          <div className="w-8 h-8 overflow-hidden rounded-md bg-primary/10 shrink-0">
            {category.image ? (
              <img
                src={category.image || "/placeholder.svg"}
                alt={category.name}
                className="object-cover w-full h-full"
              />
            ) : (
              <Settings className="w-5 h-5 m-1.5 text-primary" />
            )}
          </div>
          <h3 className="text-lg font-semibold truncate">{category.name}</h3>
        </div>

        {/* ↑ ↓ arrow buttons for keyboard/mobile reorder */}
        {isReorderMode && (
          <div className="flex gap-1 shrink-0">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 rounded-md hover:bg-muted"
              disabled={catIdx === 0}
              onClick={() => onNudgeCategory(category._id, "up")}
              title="Move up"
            >
              <ChevronUp className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 rounded-md hover:bg-muted"
              disabled={catIdx === totalCategories - 1}
              onClick={() => onNudgeCategory(category._id, "down")}
              title="Move down"
            >
              <ChevronDown className="w-4 h-4" />
            </Button>
          </div>
        )}
      </div>

      {/* Services inside category */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={onDragEndService}
      >
        <SortableContext
          items={category.serviceIds.map((s: any) => s._id)}
          strategy={verticalListSortingStrategy}
          disabled={!isReorderMode}
        >
          {filteredServices.length > 0 ? (
            isReorderMode ? (
              // ── Compact reorder list ────────────────────────────────────
              <div className="space-y-1.5 pl-4 border-l-2 border-primary/20">
                {filteredServices.map((service: any, svcIdx: number) => (
                  <SortableServiceWrapper
                    key={service._id}
                    service={service}
                    svcIdx={svcIdx}
                    totalServices={filteredServices.length}
                    categoryId={category._id}
                    categoryName={category.name}
                    isReorderMode={isReorderMode}
                    onNudgeService={onNudgeService}
                    ServiceCard={ServiceCard}
                  />
                ))}
              </div>
            ) : (
              // ── Normal card grid ───────────────────────────────────────
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {filteredServices.map((service: any) => (
                  <SortableServiceWrapper
                    key={service._id}
                    service={service}
                    svcIdx={0}
                    totalServices={filteredServices.length}
                    categoryId={category._id}
                    categoryName={category.name}
                    isReorderMode={false}
                    onNudgeService={onNudgeService}
                    ServiceCard={ServiceCard}
                  />
                ))}
              </div>
            )
          ) : (
            <Card className="p-4 text-center bg-muted/30">
              <p className="text-sm text-muted-foreground">
                No services in this category
              </p>
            </Card>
          )}
        </SortableContext>
      </DndContext>
    </div>
  );
};

// ── Sortable Service Wrapper ─────────────────────────────────────────────────
const SortableServiceWrapper = ({
  service,
  svcIdx,
  totalServices,
  categoryId,
  categoryName,
  isReorderMode,
  onNudgeService,
  ServiceCard,
}: any) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: service._id,
    disabled: !isReorderMode,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 10 : 1,
    opacity: isDragging ? 0.4 : 1,
  };

  if (!isReorderMode) {
    return (
      <div ref={setNodeRef} style={style}>
        <ServiceCard service={service} categoryName={categoryName} />
      </div>
    );
  }

  // ── Compact reorder row ────────────────────────────────────────────────────
  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex items-center gap-2 rounded-lg border bg-background px-3 py-2.5 transition-all ${
        isDragging ? "shadow-lg ring-2 ring-primary/30" : "hover:bg-muted/40"
      }`}
    >
      {/* Drag handle */}
      <div
        {...attributes}
        {...listeners}
        className="cursor-grab active:cursor-grabbing p-1 rounded hover:bg-muted touch-none shrink-0"
        title="Drag to reorder"
      >
        <GripVertical className="w-4 h-4 text-muted-foreground" />
      </div>

      {/* Sequence number */}
      <span className="text-xs font-mono text-muted-foreground w-5 shrink-0">
        {svcIdx + 1}.
      </span>

      {/* Thumbnail */}
      <div className="w-7 h-7 rounded overflow-hidden bg-primary/10 shrink-0">
        {service.image ? (
          <img
            src={service.image}
            alt={service.name}
            className="object-cover w-full h-full"
          />
        ) : (
          <div className="flex items-center justify-center w-full h-full">
            <span className="text-xs font-bold text-primary">
              {service.name.charAt(0)}
            </span>
          </div>
        )}
      </div>

      {/* Name */}
      <span className="text-sm font-medium flex-1 truncate">{service.name}</span>

      {/* ↑ ↓ arrow buttons */}
      <div className="flex gap-0.5 shrink-0">
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 rounded hover:bg-muted"
          disabled={svcIdx === 0}
          onClick={() => onNudgeService(categoryId, service._id, "up")}
          title="Move up"
        >
          <ChevronUp className="w-3.5 h-3.5" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 rounded hover:bg-muted"
          disabled={svcIdx === totalServices - 1}
          onClick={() => onNudgeService(categoryId, service._id, "down")}
          title="Move down"
        >
          <ChevronDown className="w-3.5 h-3.5" />
        </Button>
      </div>
    </div>
  );
};

export default HotelServices;
