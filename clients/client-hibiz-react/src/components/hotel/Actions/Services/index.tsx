import AdvancedBottomButton from '@/components/atom/bottomButton/advancedBottomButton';
import LoadingSpinner from '@/components/atom/loadingSpinner';
import PopUp from '@/components/atom/popUp';
import {
  useBulkUpdateHotelServiceTimings,
  useDeleteHotelService,
  useGetServiceCategories,
  useUpdateCategorySequence,
  useUpdateHotelService,
  useUpdateServiceSequence,
  type IService,
} from '@/components/store/hotel/useHotelServices';
import useBusinessData from '@/components/store/useBusinessData';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { DndContext, KeyboardSensor, PointerSensor, closestCenter, useSensor, useSensors, type DragEndEvent } from '@dnd-kit/core';
import { SortableContext, arrayMove, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  ArrowUpDown,
  ChevronDown,
  ChevronUp,
  Clock,
  Download,
  Edit,
  FileUp,
  GripVertical,
  Loader2,
  Search,
  Settings,
  Timer,
  Trash,
} from 'lucide-react';
import { Suspense, lazy, useCallback, useEffect, useMemo, useState, type ChangeEvent } from 'react';
import { toast } from 'react-hot-toast';

const BirthdayImageUploader = lazy(() => import('@/components/templates/events/birthdayImage'));
const ServicesForm = lazy(() => import('./HotelServices'));

interface EditServiceData {
  _id: string;
  name: string;
  availability: boolean;
  image?: string;
  categoryName: string;
  avgAcceptanceTime?: number;
  avgCompletionTime?: number;
  avgDeliveryTime?: number;
}

type DurationUnit = 'min' | 'sec';

interface BulkTimingRow {
  lineNumber: number;
  serviceName: string;
  acceptanceInput: string;
  deliveryInput: string;
  avgAcceptanceTime: number;
  avgCompletionTime: number;
}

interface BulkTimingError {
  lineNumber: number;
  message: string;
}

const normalizeHeader = (value: string) =>
  value
    .trim()
    .toLowerCase()
    .replace(/[\s_-]+/g, '');

const parseCsvLine = (line: string) => {
  const cells: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let index = 0; index < line.length; index += 1) {
    const char = line[index];
    const nextChar = line[index + 1];

    if (char === '"' && inQuotes && nextChar === '"') {
      current += '"';
      index += 1;
      continue;
    }

    if (char === '"') {
      inQuotes = !inQuotes;
      continue;
    }

    if (char === ',' && !inQuotes) {
      cells.push(current.trim());
      current = '';
      continue;
    }

    current += char;
  }

  cells.push(current.trim());
  return cells;
};

const parseCsvRows = (csvText: string) =>
  csvText
    .replace(/^\uFEFF/, '')
    .split(/\r?\n/)
    .filter((line) => line.trim())
    .map(parseCsvLine);

const parseDurationText = (value: string, fallbackUnit: DurationUnit = 'min') => {
  const raw = value.trim().toLowerCase();
  const unitText = raw.replace(/[0-9.\s]/g, '');
  const unit = unitText ? (unitText.startsWith('s') || unitText.includes('sec') ? 'sec' : 'min') : fallbackUnit;
  const numeric = Number(raw.replace(/[^0-9.]/g, ''));

  if (!Number.isFinite(numeric) || numeric <= 0) return null;

  const minutes = unit === 'sec' ? numeric / 60 : numeric;
  return Number(minutes.toFixed(4));
};

const formatDuration = (time?: number | null) => {
  if (time == null) return '-';

  const totalSeconds = Math.round(time * 60);
  if (totalSeconds < 60) return `${totalSeconds} sec`;

  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  if (hours > 0) return minutes ? `${hours}h ${minutes}m` : `${hours}h`;
  if (seconds > 0) return `${minutes}m ${seconds}s`;
  return `${minutes} min`;
};

const durationToInput = (time?: number | null): { value: string; unit: DurationUnit } => {
  if (time == null) return { value: '', unit: 'min' };
  if (time > 0 && time < 1) {
    return { value: String(Number((time * 60).toFixed(2))), unit: 'sec' };
  }
  return { value: String(time), unit: 'min' };
};

const csvEscape = (value: string | number | undefined) => {
  const text = value == null ? '' : String(value);
  return /[",\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
};

const HotelServices = () => {
  const businessId = useBusinessData((s) => s.businessData?._id);
  const { categoriesData, categoriesLoading } = useGetServiceCategories(businessId as string);
  const { updateService } = useUpdateHotelService();
  const { bulkUpdateServiceTimings, bulkUpdateServiceTimingsLoading } = useBulkUpdateHotelServiceTimings();
  const { deleteService } = useDeleteHotelService();
  const { updateCategorySequence } = useUpdateCategorySequence();
  const { updateServiceSequence } = useUpdateServiceSequence();

  const [searchQuery, setSearchQuery] = useState('');
  const [isReorderMode, setIsReorderMode] = useState(false);
  const [localCategories, setLocalCategories] = useState<any[]>([]);
  // Track pending order changes — API is only called on explicit "Save Order"
  const [isDirty, setIsDirty] = useState(false);
  const [isSavingOrder, setIsSavingOrder] = useState(false);

  const [serviceAvailability, setServiceAvailability] = useState<Record<string, boolean>>({});

  const [openService, setOpenService] = useState(false);

  const [editingService, setEditingService] = useState<EditServiceData | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [newImageUrl, setNewImageUrl] = useState<string | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [requestMin, setRequestMin] = useState<string>('');
  const [responseMin, setResponseMin] = useState<string>('');
  const [requestUnit, setRequestUnit] = useState<DurationUnit>('min');
  const [responseUnit, setResponseUnit] = useState<DurationUnit>('min');
  const [showBulkTimingModal, setShowBulkTimingModal] = useState(false);
  const [bulkTimingRows, setBulkTimingRows] = useState<BulkTimingRow[]>([]);
  const [bulkTimingErrors, setBulkTimingErrors] = useState<BulkTimingError[]>([]);
  const [bulkTimingFileName, setBulkTimingFileName] = useState('');

  useEffect(() => {
    if (categoriesData) {
      const availabilityMap: Record<string, boolean> = {};

      for (const category of categoriesData) {
        for (const service of category.serviceIds) {
          availabilityMap[service._id] = service.availability !== undefined ? service.availability : true;
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
        const serviceSequences = category.serviceIds.map((svc: any, idx: number) => ({ id: svc._id, sequence: idx }));
        await updateServiceSequence({ sequences: serviceSequences, businessId });
      }

      setIsDirty(false);
      toast.success('Order saved!');
    } catch (e: any) {
      toast.error(e?.message ?? 'Failed to save order');
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
  const nudgeCategory = useCallback((categoryId: string, direction: 'up' | 'down') => {
    setLocalCategories((items) => {
      const idx = items.findIndex((c) => c._id === categoryId);
      const targetIdx = direction === 'up' ? idx - 1 : idx + 1;
      if (targetIdx < 0 || targetIdx >= items.length) return items;
      return arrayMove(items, idx, targetIdx);
    });
    setIsDirty(true);
  }, []);

  // ── Arrow-button nudge for services (local only — no API) ──────────────────
  const nudgeService = useCallback((categoryId: string, serviceId: string, direction: 'up' | 'down') => {
    setLocalCategories((items) => {
      const catIdx = items.findIndex((c) => c._id === categoryId);
      if (catIdx === -1) return items;
      const services = [...items[catIdx].serviceIds];
      const svcIdx = services.findIndex((s) => s._id === serviceId);
      const targetIdx = direction === 'up' ? svcIdx - 1 : svcIdx + 1;
      if (targetIdx < 0 || targetIdx >= services.length) return items;
      const newServices = arrayMove(services, svcIdx, targetIdx);
      const newItems = [...items];
      newItems[catIdx] = { ...newItems[catIdx], serviceIds: newServices };
      return newItems;
    });
    setIsDirty(true);
  }, []);

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
        avgDeliveryTime: service.avgDeliveryTime,
      });
      const requestInput = durationToInput(service.avgAcceptanceTime);
      const responseInput = durationToInput(service.avgDeliveryTime ?? service.avgCompletionTime);
      setRequestMin(requestInput.value);
      setRequestUnit(requestInput.unit);
      setResponseMin(responseInput.value);
      setResponseUnit(responseInput.unit);
      setNewImageUrl(null);
      setShowEditModal(true);
    },
    [serviceAvailability],
  );

  const handleImageUploadSuccess = useCallback(
    (url: string) => {
      if (editingService?.image === url) {
        toast.error('This image is already uploaded');
        return;
      }
      setNewImageUrl(url);
      toast.success('Image uploaded successfully');
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
      const avgAcceptanceTime = parseDurationText(requestMin, requestUnit);
      const avgCompletionTime = parseDurationText(responseMin, responseUnit);
      if (avgAcceptanceTime != null) payload.avgAcceptanceTime = avgAcceptanceTime;
      if (avgCompletionTime != null) {
        payload.avgCompletionTime = avgCompletionTime;
        payload.avgDeliveryTime = avgCompletionTime;
      }
      await updateService(payload);

      setServiceAvailability((prev) => ({
        ...prev,
        [editingService._id]: editingService.availability,
      }));

      toast.success('Service updated successfully');
      setShowEditModal(false);
      setEditingService(null);
      setNewImageUrl(null);
    } catch (error: any) {
      const message = error?.response?.data?.message || error?.data?.message || error?.message || 'Failed to update service';
      toast.error(message);
    } finally {
      setUploadingImage(false);
    }
  }, [editingService, businessId, newImageUrl, updateService, requestMin, responseMin, requestUnit, responseUnit]);

  const handleCloseEditModal = useCallback(() => {
    setShowEditModal(false);
    setEditingService(null);
    setNewImageUrl(null);
    setRequestMin('');
    setResponseMin('');
    setRequestUnit('min');
    setResponseUnit('min');
  }, []);

  const filteredCategories = useMemo(() => {
    if (!categoriesData || !searchQuery.trim()) return categoriesData;

    return categoriesData
      .map((category) => {
        const filteredServices = category.serviceIds.filter((service) => service.name.toLowerCase().includes(searchQuery.toLowerCase()));
        return { ...category, serviceIds: filteredServices };
      })
      .filter((category) => category.serviceIds.length > 0);
  }, [categoriesData, searchQuery]);

  const totalServices = useMemo(() => {
    return categoriesData?.reduce((count, category) => count + category.serviceIds.length, 0) || 0;
  }, [categoriesData]);

  const filteredServicesCount = useMemo(() => {
    return filteredCategories?.reduce((count, category) => count + category.serviceIds.length, 0) || 0;
  }, [filteredCategories]);

  const openServices = useCallback(() => {
    setOpenService(!openService);
  }, [openService]);

  const handleChange = (setter: (v: string) => void) => (e: ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/[^0-9.]/g, '').replace(/(\..*)\./g, '$1');
    setter(raw);
  };

  const requestSla = parseDurationText(requestMin, requestUnit);
  const responseSla = parseDurationText(responseMin, responseUnit);

  const cmpError =
    requestSla !== null && responseSla !== null && responseSla <= requestSla ? 'Response time must be greater than request time' : '';

  const bothEmpty = requestSla === null && responseSla === null;
  const canSave = bothEmpty || (requestSla !== null && responseSla !== null && responseSla > requestSla);

  const handleDeleteService = useCallback(
    async (service: IService) => {
      if (!businessId) {
        toast.error('Missing business id');
        return;
      }
      const ok = window.confirm(`Delete "${service.name}"? This action cannot be undone.`);
      if (!ok) return;
      try {
        await deleteService({ serviceId: service._id, businessId });
        toast.success('Service deleted');
      } catch (e: any) {
        toast.error(e?.message ?? 'Failed to delete service');
      }
    },
    [businessId, deleteService],
  );

  const handleDownloadBulkTemplate = useCallback(() => {
    const services =
      categoriesData?.flatMap((category) =>
        category.serviceIds.map((service) => ({
          serviceName: service.name,
          acceptanceTime: formatDuration(service.avgAcceptanceTime),
          deliveryTime: formatDuration(service.avgDeliveryTime ?? service.avgCompletionTime),
        })),
      ) || [];

    const rows = [
      ['serviceName', 'requestTime', 'responseTime'],
      ...services.map((service) => [service.serviceName, service.acceptanceTime, service.deliveryTime]),
    ];
    const csv = rows.map((row) => row.map(csvEscape).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'hotel-service-timings.csv';
    link.click();
    URL.revokeObjectURL(link.href);
  }, [categoriesData]);

  const parseBulkTimingCsv = useCallback((text: string) => {
    const rows = parseCsvRows(text);
    if (rows.length < 2) {
      setBulkTimingRows([]);
      setBulkTimingErrors([{ lineNumber: 1, message: 'CSV has no data rows' }]);
      return;
    }

    const headers = rows[0].map(normalizeHeader);
    const serviceNameIndex = headers.findIndex((header) => ['servicename', 'service', 'name'].includes(header));
    const acceptanceIndex = headers.findIndex((header) => ['requesttime', 'acceptancetime', 'request', 'acceptance'].includes(header));
    const deliveryIndex = headers.findIndex((header) =>
      ['responsetime', 'deliverytime', 'fulfillmenttime', 'completiontime', 'response', 'delivery'].includes(header),
    );
    const unitIndex = headers.findIndex((header) => header === 'unit');

    if (serviceNameIndex < 0 || acceptanceIndex < 0 || deliveryIndex < 0) {
      setBulkTimingRows([]);
      setBulkTimingErrors([
        {
          lineNumber: 1,
          message: 'Headers must include serviceName, requestTime, responseTime',
        },
      ]);
      return;
    }

    const nextRows: BulkTimingRow[] = [];
    const nextErrors: BulkTimingError[] = [];

    rows.slice(1).forEach((row, index) => {
      const lineNumber = index + 2;
      const serviceName = row[serviceNameIndex]?.trim() || '';
      const acceptanceInput = row[acceptanceIndex]?.trim() || '';
      const deliveryInput = row[deliveryIndex]?.trim() || '';
      const normalizedUnit = normalizeHeader(row[unitIndex] || '');
      const fallbackUnit = ['s', 'sec', 'secs', 'second', 'seconds'].includes(normalizedUnit) ? 'sec' : 'min';
      const avgAcceptanceTime = parseDurationText(acceptanceInput, fallbackUnit);
      const avgCompletionTime = parseDurationText(deliveryInput, fallbackUnit);

      if (!serviceName) {
        nextErrors.push({ lineNumber, message: 'Service name is required' });
        return;
      }

      if (avgAcceptanceTime == null) {
        nextErrors.push({
          lineNumber,
          message: 'Request time must be greater than 0',
        });
        return;
      }

      if (avgCompletionTime == null) {
        nextErrors.push({
          lineNumber,
          message: 'Response time must be greater than 0',
        });
        return;
      }

      if (avgCompletionTime <= avgAcceptanceTime) {
        nextErrors.push({
          lineNumber,
          message: 'Response time must be greater than request time',
        });
        return;
      }

      nextRows.push({
        lineNumber,
        serviceName,
        acceptanceInput,
        deliveryInput,
        avgAcceptanceTime,
        avgCompletionTime,
      });
    });

    setBulkTimingRows(nextRows);
    setBulkTimingErrors(nextErrors);
  }, []);

  const handleBulkTimingFileChange = useCallback(
    async (event: ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      event.target.value = '';
      if (!file) return;

      if (!file.name.toLowerCase().endsWith('.csv')) {
        toast.error('Please upload a CSV file');
        return;
      }

      setBulkTimingFileName(file.name);
      parseBulkTimingCsv(await file.text());
    },
    [parseBulkTimingCsv],
  );

  const handleSaveBulkTimings = useCallback(async () => {
    if (!businessId) {
      toast.error('Missing business id');
      return;
    }

    if (bulkTimingErrors.length > 0) {
      toast.error('Please fix CSV errors before saving');
      return;
    }

    if (!bulkTimingRows.length) {
      toast.error('Upload a CSV with service timings first');
      return;
    }

    try {
      const result = await bulkUpdateServiceTimings({
        businessId,
        services: bulkTimingRows.map((row) => ({
          serviceName: row.serviceName,
          avgAcceptanceTime: row.avgAcceptanceTime,
          avgCompletionTime: row.avgCompletionTime,
          avgDeliveryTime: row.avgCompletionTime,
        })),
      });

      const updated = result?.updated ?? 0;
      const skipped = result?.skippedActive?.length ?? 0;
      const notFound = result?.notFound?.length ?? 0;
      toast.success(`Updated ${updated} service${updated === 1 ? '' : 's'}${skipped || notFound ? `, skipped ${skipped + notFound}` : ''}`);
      setShowBulkTimingModal(false);
      setBulkTimingRows([]);
      setBulkTimingErrors([]);
      setBulkTimingFileName('');
    } catch (error: any) {
      toast.error(error?.message || 'Failed to update service timings');
    }
  }, [businessId, bulkTimingErrors.length, bulkTimingRows, bulkUpdateServiceTimings]);

  // ── Service card (normal view) ─────────────────────────────────────────────
  const ServiceCard = useCallback(
    ({ service, categoryName }: { service: IService; categoryName: string }) => {
      const isAvailable = serviceAvailability[service._id] ?? true;
      const serviceResponseTime = service.avgDeliveryTime ?? service.avgCompletionTime;
      const hasTimingIssue =
        typeof service.avgAcceptanceTime === 'number' &&
        typeof serviceResponseTime === 'number' &&
        serviceResponseTime <= service.avgAcceptanceTime;

      return (
        <div
          className={`bg-card hover:border-primary/30 group relative flex flex-col rounded-xl border transition-all hover:shadow-sm ${
            !isAvailable ? 'opacity-70' : ''
          }`}
        >
          {/* ── Main row: avatar + name + status + actions ── */}
          <div className="flex items-center gap-3 px-3 py-3">
            {/* Avatar */}
            <div className="relative shrink-0">
              <div className="bg-primary/8 h-10 w-10 overflow-hidden rounded-lg">
                {service.image ? (
                  <img src={service.image} alt={service.name} className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center">
                    <span className="text-primary text-base font-bold">{service.name.charAt(0).toUpperCase()}</span>
                  </div>
                )}
              </div>
              {/* Availability dot on avatar */}
              <span
                className={`border-card absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 ${
                  isAvailable ? 'bg-green-500' : 'bg-gray-400'
                }`}
              />
            </div>

            {/* Name + category */}
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold leading-tight">{service.name}</p>
              <p className="text-muted-foreground mt-0.5 truncate text-xs">
                {isAvailable ? <span className="text-green-600">Available</span> : <span className="text-muted-foreground">Unavailable</span>}
              </p>
            </div>

            {/* Actions — always visible on mobile, hover on desktop */}
            <div className="flex shrink-0 items-center gap-0.5">
              <Button
                variant="ghost"
                size="icon"
                className="hover:bg-primary/8 hover:text-primary h-8 w-8 rounded-lg opacity-60 hover:opacity-100"
                onClick={() => handleServiceClick(service, categoryName)}
                title="Edit"
              >
                <Edit className="h-3.5 w-3.5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="hover:bg-destructive/10 hover:text-destructive h-8 w-8 rounded-lg opacity-60 hover:opacity-100"
                onClick={() => handleDeleteService(service)}
                title="Delete"
              >
                <Trash className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>

          {/* ── Time strip ────────────────────────────────────────────────── */}
          <div className="bg-muted/30 flex divide-x overflow-hidden rounded-b-xl border-t">
            <div className="flex flex-1 items-center gap-1.5 px-3 py-2">
              <Clock className="h-3.5 w-3.5 shrink-0 text-emerald-600" />
              <span className="text-muted-foreground text-xs">Request</span>
              <span className="ml-auto text-xs font-medium tabular-nums">{formatDuration(service.avgAcceptanceTime)}</span>
            </div>
            <div className="flex flex-1 items-center gap-1.5 px-3 py-2">
              <Timer className="h-3.5 w-3.5 shrink-0 text-purple-600" />
              <span className="text-muted-foreground text-xs">Response</span>
              <span className="ml-auto text-xs font-medium tabular-nums">{formatDuration(service.avgDeliveryTime ?? service.avgCompletionTime)}</span>
            </div>
          </div>

          {/* ── Timing warning ────────────────────────────────────────────── */}
          {hasTimingIssue && (
            <div className="px-3 pb-2 pt-0">
              <p className="text-[11px] text-rose-500">Request time should be less than response time</p>
            </div>
          )}
        </div>
      );
    },
    [serviceAvailability, handleServiceClick, handleDeleteService],
  );

  const EmptyState = () => {
    return (
      <Card className="mt-4 p-8 text-center">
        <div className="flex flex-col items-center justify-center space-y-3">
          <div className="rounded-full bg-gradient-to-br from-blue-400 to-blue-600 p-4 shadow-lg">
            <Settings className="h-10 w-10 text-white drop-shadow-md" />
          </div>
          <h3 className="text-lg font-medium">No Services Available</h3>
          <p className="text-muted-foreground text-sm">No services have been configured for this hotel yet</p>
        </div>
      </Card>
    );
  };

  const NoResults = () => {
    return (
      <div className="py-10 text-center">
        <div className="bg-muted mx-auto w-fit rounded-full p-4">
          <Search className="text-muted-foreground h-8 w-8" />
        </div>
        <h3 className="mt-4 text-lg font-medium">No services match your search</h3>
        <p className="text-muted-foreground mt-2 text-sm">Try a different search term</p>
        <Button variant="outline" className="mt-4 bg-transparent" onClick={() => setSearchQuery('')}>
          Clear Search
        </Button>
      </div>
    );
  };

  return (
    <div className="mb-32 space-y-3">
      {/* ── Compact top bar ────────────────────────────────────────────────── */}
      <div className="flex items-center gap-2">
        {!isReorderMode ? (
          <div className="relative flex-1">
            <Search className="text-muted-foreground pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2" />
            <Input
              placeholder="Search services..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-9 pl-9 pr-8 text-sm"
            />
            {searchQuery && (
              <button
                className="text-muted-foreground hover:text-foreground absolute right-2.5 top-1/2 -translate-y-1/2 text-lg leading-none"
                onClick={() => setSearchQuery('')}
              >
                ×
              </button>
            )}
          </div>
        ) : (
          <span className="flex-1 text-sm">
            {isDirty ? (
              <span className="font-medium text-amber-600">● Unsaved changes</span>
            ) : (
              <span className="text-muted-foreground">Drag or tap ↑ ↓ to reorder</span>
            )}
          </span>
        )}

        {/* Reorder toggle — filled by default so it's always visible */}
        {!isReorderMode && (
          <Button size="sm" variant="outline" onClick={() => setShowBulkTimingModal(true)} className="shrink-0 gap-1.5">
            <FileUp className="h-3.5 w-3.5" />
            Bulk Timings
          </Button>
        )}

        <Button
          size="sm"
          variant={isReorderMode ? 'outline' : 'default'}
          onClick={() => {
            if (isReorderMode && isDirty) {
              const ok = window.confirm('Discard unsaved order changes?');
              if (!ok) return;
              handleDiscardOrder();
            }
            setIsReorderMode((v) => !v);
          }}
          className="shrink-0 gap-1.5"
        >
          <ArrowUpDown className="h-3.5 w-3.5" />
          {isReorderMode ? 'Done' : 'Reorder'}
        </Button>

        <Badge variant="secondary" className="shrink-0 px-2 py-1 text-xs tabular-nums">
          {totalServices}
        </Badge>
      </div>

      {searchQuery && !isReorderMode && (
        <p className="text-muted-foreground px-0.5 text-xs">
          {filteredServicesCount} result{filteredServicesCount !== 1 ? 's' : ''} for &quot;{searchQuery}&quot;
        </p>
      )}

      {categoriesLoading ? (
        <div className="flex justify-center py-10">
          <LoadingSpinner />
        </div>
      ) : localCategories && localCategories.length > 0 ? (
        <div className="space-y-8">
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEndCategory}>
            <SortableContext items={localCategories.map((c) => c._id)} strategy={verticalListSortingStrategy} disabled={!isReorderMode}>
              {localCategories
                .filter((category) => {
                  if (!searchQuery.trim() || isReorderMode) return true;
                  return category.serviceIds.some((s: any) => s.name.toLowerCase().includes(searchQuery.toLowerCase()));
                })
                .map((category, catIdx) => (
                  <SortableCategoryWrapper
                    key={category._id}
                    category={category}
                    catIdx={catIdx}
                    totalCategories={localCategories.length}
                    isReorderMode={isReorderMode}
                    onDragEndService={(e: DragEndEvent) => handleDragEndService(category._id, e)}
                    onNudgeCategory={nudgeCategory}
                    onNudgeService={nudgeService}
                    sensors={sensors}
                    ServiceCard={ServiceCard}
                    searchQuery={isReorderMode ? '' : searchQuery}
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
                  text: 'Discard',
                  onClick: handleDiscardOrder,
                  className: 'w-full rounded-md bg-muted text-foreground hover:bg-muted/80',
                },
                {
                  text: isSavingOrder ? 'Saving…' : 'Save Order',
                  onClick: handleSaveOrder,
                  className: 'w-full rounded-md bg-green-600 hover:bg-green-700 text-white',
                },
              ]}
            />
          ) : !isReorderMode ? (
            <AdvancedBottomButton
              fixed={true}
              maxWidth="30rem"
              buttons={[
                {
                  text: 'Add Services',
                  onClick: openServices,
                  className: 'w-full pl-3 rounded-md',
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

      {/* Bulk Service Timing Modal */}
      <PopUp width="w-[30rem] md:w-[44rem]" height="h-auto" show={showBulkTimingModal} onClose={() => setShowBulkTimingModal(false)} rightTopBack>
        <div className="space-y-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h3 className="text-lg font-semibold">Bulk Upload Timings</h3>
              <p className="text-muted-foreground text-sm">Upload CSV columns: serviceName, requestTime, responseTime.</p>
            </div>
            <Button variant="outline" size="sm" className="gap-2" onClick={handleDownloadBulkTemplate}>
              <Download className="h-4 w-4" />
              Template
            </Button>
          </div>

          <div className="rounded-lg border border-dashed p-4">
            <Label htmlFor="bulk-timing-file" className="flex cursor-pointer flex-col items-center justify-center gap-2 text-center">
              <FileUp className="text-muted-foreground h-8 w-8" />
              <span className="text-sm font-medium">{bulkTimingFileName || 'Choose CSV file'}</span>
              <span className="text-muted-foreground text-xs">Values without a unit are minutes. You can also use 30s, 45 sec, 0.5m, or 2 min.</span>
            </Label>
            <input id="bulk-timing-file" type="file" accept=".csv" className="hidden" onChange={handleBulkTimingFileChange} />
          </div>

          {bulkTimingErrors.length > 0 && (
            <div className="max-h-36 overflow-auto rounded-lg border border-rose-200 bg-rose-50 p-3 text-xs text-rose-700">
              {bulkTimingErrors.slice(0, 8).map((error) => (
                <p key={`${error.lineNumber}-${error.message}`}>
                  Line {error.lineNumber}: {error.message}
                </p>
              ))}
              {bulkTimingErrors.length > 8 && <p>...and {bulkTimingErrors.length - 8} more</p>}
            </div>
          )}

          {bulkTimingRows.length > 0 && (
            <div className="max-h-64 overflow-auto rounded-lg border">
              <table className="w-full text-left text-xs">
                <thead className="bg-muted sticky top-0">
                  <tr>
                    <th className="px-3 py-2 font-medium">Service</th>
                    <th className="px-3 py-2 font-medium">Request</th>
                    <th className="px-3 py-2 font-medium">Response</th>
                  </tr>
                </thead>
                <tbody>
                  {bulkTimingRows.slice(0, 20).map((row) => (
                    <tr key={`${row.lineNumber}-${row.serviceName}`} className="border-t">
                      <td className="px-3 py-2 font-medium">{row.serviceName}</td>
                      <td className="px-3 py-2">{formatDuration(row.avgAcceptanceTime)}</td>
                      <td className="px-3 py-2">{formatDuration(row.avgCompletionTime)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {bulkTimingRows.length > 20 && (
                <p className="text-muted-foreground border-t px-3 py-2 text-xs">Previewing 20 of {bulkTimingRows.length} rows.</p>
              )}
            </div>
          )}

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => setShowBulkTimingModal(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleSaveBulkTimings}
              disabled={bulkUpdateServiceTimingsLoading || bulkTimingRows.length === 0 || bulkTimingErrors.length > 0}
            >
              {bulkUpdateServiceTimingsLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                'Update Timings'
              )}
            </Button>
          </div>
        </div>
      </PopUp>

      {/* Edit Service Modal */}
      <PopUp width="w-[30rem] md:w-[40rem]" height="h-auto" show={showEditModal} onClose={handleCloseEditModal} rightTopBack>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Edit Service</h3>
          </div>

          {editingService && (
            <>
              <div className="space-y-1">
                <Label htmlFor="service-name" className="text-sm font-medium">
                  Service Name
                </Label>
                <Input
                  id="service-name"
                  value={editingService.name}
                  onChange={(e) => setEditingService((prev) => (prev ? { ...prev, name: e.target.value } : null))}
                  placeholder="Service name"
                  className="font-medium"
                />
                <p className="text-muted-foreground text-sm">Category: {editingService.categoryName}</p>
              </div>
              <div className="flex items-center justify-between rounded-lg border p-4">
                <div>
                  <Label className="text-sm font-medium">Availability</Label>
                  <p className="text-muted-foreground text-xs">Toggle service availability for customers</p>
                </div>
                <Switch
                  checked={editingService.availability}
                  onCheckedChange={(checked) => setEditingService((prev) => (prev ? { ...prev, availability: checked } : null))}
                />
              </div>
              <div className="flex w-full justify-between gap-4">
                {/* Request Time */}
                <div className="w-[45%]">
                  <Label htmlFor="requestMin" className="text-sm font-medium">
                    Request Time
                  </Label>
                  <div className="relative mt-1 flex gap-2">
                    <Input
                      id="requestMin"
                      type="text"
                      inputMode="decimal"
                      placeholder={requestUnit === 'sec' ? 'e.g., 30' : 'e.g., 2'}
                      value={requestMin}
                      onChange={handleChange(setRequestMin)}
                      aria-invalid={!!cmpError}
                      className="flex-1"
                      maxLength={6}
                      onWheel={(e) => (e.target as HTMLInputElement).blur()}
                    />
                    <select
                      value={requestUnit}
                      onChange={(e) => setRequestUnit(e.target.value as DurationUnit)}
                      className="bg-background h-10 rounded-md border px-2 text-sm"
                    >
                      <option value="min">min</option>
                      <option value="sec">sec</option>
                    </select>
                  </div>
                  <p className="text-muted-foreground mt-1 text-xs">Time to accept the guest request.</p>
                </div>

                {/* Response Time */}
                <div className="w-[45%]">
                  <Label htmlFor="responseMin" className="text-sm font-medium">
                    Response Time
                  </Label>
                  <div className="relative mt-1 flex gap-2">
                    <Input
                      id="responseMin"
                      type="text"
                      inputMode="decimal"
                      placeholder={responseUnit === 'sec' ? 'e.g., 90' : 'e.g., 60'}
                      value={responseMin}
                      onChange={handleChange(setResponseMin)}
                      aria-invalid={!!cmpError}
                      className="flex-1"
                      maxLength={6}
                      onWheel={(e) => (e.target as HTMLInputElement).blur()}
                    />
                    <select
                      value={responseUnit}
                      onChange={(e) => setResponseUnit(e.target.value as DurationUnit)}
                      className="bg-background h-10 rounded-md border px-2 text-sm"
                    >
                      <option value="min">min</option>
                      <option value="sec">sec</option>
                    </select>
                  </div>
                  <p className="text-muted-foreground mt-1 text-xs">Time to fulfill after staff accepts.</p>
                </div>
              </div>
              <div className="text-muted-foreground rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs">
                <div className="mb-1 font-semibold text-slate-700">SLA terms</div>
                <div className="grid gap-1 sm:grid-cols-3">
                  <span>Request: raised to accepted</span>
                  <span>Response: accepted to completed</span>
                  <span>Total SLA: request + response</span>
                </div>
              </div>
              <div className="space-y-3">
                <Label className="text-sm font-medium">Service Image</Label>
                <BirthdayImageUploader image={newImageUrl || editingService.image || ''} onUploadSuccess={handleImageUploadSuccess} />
                <p className="text-muted-foreground text-xs">
                  Upload a new image or keep the existing one. Images are automatically uploaded to cloud storage.
                </p>
                {!canSave && <Label className="text-sm font-medium text-rose-500">Note: Request Time should be less than Response Time.</Label>}
              </div>
              <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline" onClick={handleCloseEditModal}>
                  Cancel
                </Button>
                <Button onClick={handleSaveService} disabled={uploadingImage || !canSave}>
                  {uploadingImage ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    'Save Changes'
                  )}
                </Button>
              </div>
            </>
          )}
        </div>
      </PopUp>

      {/* Add Services Modal */}
      <PopUp width="w-[30rem] md:w-[48rem]" height="h-[100dvh] lg:h-[90dvh]" show={openService} onClose={openServices} rightTopBack>
        <Suspense fallback={<LoadingSpinner />}>
          <ServicesForm openServices={openServices} categories={categoriesData ?? []} />
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
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: category._id,
    disabled: !isReorderMode,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 10 : 1,
    opacity: isDragging ? 0.5 : 1,
  };

  const filteredServices = category.serviceIds.filter((s: any) => s.name.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <div ref={setNodeRef} style={style} className="space-y-3">
      {/* Category header row */}
      <div
        className={`flex items-center justify-between rounded-lg px-3 py-2 transition-colors ${
          isReorderMode ? 'bg-muted/60 border-muted-foreground/30 border border-dashed' : ''
        }`}
      >
        <div className="flex min-w-0 flex-1 items-center gap-3">
          {/* Drag handle — visible and obvious in reorder mode */}
          {isReorderMode && (
            <div
              {...attributes}
              {...listeners}
              className="hover:bg-muted-foreground/10 shrink-0 cursor-grab touch-none rounded p-1.5 active:cursor-grabbing"
              title="Drag to reorder"
            >
              <GripVertical className="text-muted-foreground h-5 w-5" />
            </div>
          )}

          {/* Sequence number in reorder mode */}
          {isReorderMode && <span className="text-muted-foreground w-5 shrink-0 font-mono text-xs font-bold">{catIdx + 1}.</span>}

          <div className="bg-primary/10 h-8 w-8 shrink-0 overflow-hidden rounded-md">
            {category.image ? (
              <img src={category.image || '/placeholder.svg'} alt={category.name} className="h-full w-full object-cover" />
            ) : (
              <Settings className="text-primary m-1.5 h-5 w-5" />
            )}
          </div>
          <h3 className="truncate text-lg font-semibold">{category.name}</h3>
        </div>

        {/* ↑ ↓ arrow buttons for keyboard/mobile reorder */}
        {isReorderMode && (
          <div className="flex shrink-0 gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="hover:bg-muted h-8 w-8 rounded-md"
              disabled={catIdx === 0}
              onClick={() => onNudgeCategory(category._id, 'up')}
              title="Move up"
            >
              <ChevronUp className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="hover:bg-muted h-8 w-8 rounded-md"
              disabled={catIdx === totalCategories - 1}
              onClick={() => onNudgeCategory(category._id, 'down')}
              title="Move down"
            >
              <ChevronDown className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>

      {/* Services inside category */}
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEndService}>
        <SortableContext items={category.serviceIds.map((s: any) => s._id)} strategy={verticalListSortingStrategy} disabled={!isReorderMode}>
          {filteredServices.length > 0 ? (
            isReorderMode ? (
              // ── Compact reorder list ────────────────────────────────────
              <div className="border-primary/20 space-y-1.5 border-l-2 pl-4">
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
            <Card className="bg-muted/30 p-4 text-center">
              <p className="text-muted-foreground text-sm">No services in this category</p>
            </Card>
          )}
        </SortableContext>
      </DndContext>
    </div>
  );
};

// ── Sortable Service Wrapper ─────────────────────────────────────────────────
const SortableServiceWrapper = ({ service, svcIdx, totalServices, categoryId, categoryName, isReorderMode, onNudgeService, ServiceCard }: any) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
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
      className={`bg-background flex items-center gap-2 rounded-lg border px-3 py-2.5 transition-all ${
        isDragging ? 'ring-primary/30 shadow-lg ring-2' : 'hover:bg-muted/40'
      }`}
    >
      {/* Drag handle */}
      <div
        {...attributes}
        {...listeners}
        className="hover:bg-muted shrink-0 cursor-grab touch-none rounded p-1 active:cursor-grabbing"
        title="Drag to reorder"
      >
        <GripVertical className="text-muted-foreground h-4 w-4" />
      </div>

      {/* Sequence number */}
      <span className="text-muted-foreground w-5 shrink-0 font-mono text-xs">{svcIdx + 1}.</span>

      {/* Thumbnail */}
      <div className="bg-primary/10 h-7 w-7 shrink-0 overflow-hidden rounded">
        {service.image ? (
          <img src={service.image} alt={service.name} className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <span className="text-primary text-xs font-bold">{service.name.charAt(0)}</span>
          </div>
        )}
      </div>

      {/* Name */}
      <span className="flex-1 truncate text-sm font-medium">{service.name}</span>

      {/* ↑ ↓ arrow buttons */}
      <div className="flex shrink-0 gap-0.5">
        <Button
          variant="ghost"
          size="icon"
          className="hover:bg-muted h-7 w-7 rounded"
          disabled={svcIdx === 0}
          onClick={() => onNudgeService(categoryId, service._id, 'up')}
          title="Move up"
        >
          <ChevronUp className="h-3.5 w-3.5" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="hover:bg-muted h-7 w-7 rounded"
          disabled={svcIdx === totalServices - 1}
          onClick={() => onNudgeService(categoryId, service._id, 'down')}
          title="Move down"
        >
          <ChevronDown className="h-3.5 w-3.5" />
        </Button>
      </div>
    </div>
  );
};

export default HotelServices;
