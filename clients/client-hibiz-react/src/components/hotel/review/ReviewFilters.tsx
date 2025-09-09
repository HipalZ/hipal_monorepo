// components/reviews/ReviewsFilters.tsx
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Filter } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Sheet,
  SheetContent, SheetHeader,
  SheetTitle,
  SheetTrigger
} from "@/components/ui/sheet";
import AdvancedBottomButton from "@/components/atom/bottomButton/advancedBottomButton.tsx";
import type { IService } from "@/components/store/hotel/useHotelServices.ts";
import type { IHotelStaff } from "@/hooks/useHotelStaff.ts";
import type { ratingType } from "@/hooks/hotel/useReviewHook.ts";
import { useReviewsFilterStore } from "@/components/store/hotel/useReview.ts";


interface ReviewsFiltersProps {
  services: IService[];
  staff: IHotelStaff[];
  onApply: () => void;
  busy?: boolean;
}

const RatingButtons = ({
  value,
  onChange,
}: {
  value?: ratingType;
  onChange: (v?: ratingType) => void;
}) => (
  <div className="flex flex-wrap gap-2">
    {(["GOOD", "AVG", "BAD"] as ratingType[]).map((r) => (
      <Button
        key={r}
        type="button"
        size="sm"
        variant={value === r ? "default" : "outline"}
        onClick={() => onChange(value === r ? undefined : r)}
        className={cn(value === r && "ring-2 ring-primary")}
      >
        {r}
      </Button>
    ))}
  </div>
);

const ReadButtons = ({
  value,
  onChange,
}: {
  value: "all" | "read" | "unread";
  onChange: (v: "all" | "read" | "unread") => void;
}) => (
  <div className="flex flex-wrap gap-2">
    {(["all", "read", "unread"] as const).map((m) => (
      <Button
        key={m}
        type="button"
        size="sm"
        variant={value === m ? "default" : "outline"}
        onClick={() => onChange(m)}
        className={cn(value === m && "ring-2 ring-primary text-white")}
      >
        {m === "all" ? "All" : m === "read" ? "Read" : "Unread"}
      </Button>
    ))}
  </div>
);

function FiltersBody({
  services,
  staff,
  compact = false,
}: {
  services: IService[];
  staff: IHotelStaff[];
  compact?: boolean;
}) {

const rating = useReviewsFilterStore((s) => s.rating);
const readMode = useReviewsFilterStore((s) => s.readMode);
const fromDate = useReviewsFilterStore((s) => s.fromDate);
const toDate = useReviewsFilterStore((s) => s.toDate);
const serviceIds = useReviewsFilterStore((s) => s.serviceIds);
const staffIds = useReviewsFilterStore((s) => s.staffIds);
const setRating = useReviewsFilterStore((s) => s.setRating);
const setReadMode = useReviewsFilterStore((s) => s.setReadMode);
const setFromDate = useReviewsFilterStore((s) => s.setFromDate);
const setToDate = useReviewsFilterStore((s) => s.setToDate);
const toggleService = useReviewsFilterStore((s) => s.toggleService);
const toggleStaff = useReviewsFilterStore((s) => s.toggleStaff);

  return (
    <div
      className={cn("grid gap-4", compact ? "" : "grid-cols-1 lg:grid-cols-4")}
    >
      {/* Rating */}
      <div>
        <Label className="text-xs">Rating</Label>
        <div className="mt-2">
          <RatingButtons value={rating} onChange={setRating} />
        </div>
      </div>

      {/* Read */}
      <div>
        <Label className="text-xs">Read</Label>
        <div className="mt-2">
          <ReadButtons value={readMode} onChange={setReadMode} />
        </div>
      </div>

      <section className="flex gap-4">
        <div>
          <Label className="text-xs">From</Label>
          <Input
            type="date"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
            className="mt-2"
          />
        </div>

        {/* To */}
        <div>
          <Label className="text-xs">To</Label>
          <Input
            type="date"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
            className="mt-2"
          />
        </div>
      </section>

      <Separator className="lg:col-span-4" />

      {/* Services */}
      <div className="lg:col-span-2">
        <Label className="text-xs">Services</Label>
        <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-auto pr-1">
          {services.map((svc) => {
            const checked = serviceIds.has(svc._id);
            return (
              <label
                key={svc._id}
                className={cn(
                  "flex items-center gap-2 rounded-md border p-2 cursor-pointer",
                  checked
                    ? "border-primary ring-2 ring-primary/30"
                    : "hover:bg-muted/40",
                )}
              >
                <input
                  type="checkbox"
                  className="h-4 w-4"
                  checked={checked}
                  onChange={() => toggleService(svc._id)}
                />
                <span className="text-sm">{svc.name}</span>
                {svc.availability === false && (
                  <Badge variant="secondary" className="ml-auto text-xs">
                    Unavailable
                  </Badge>
                )}
              </label>
            );
          })}
          {services.length === 0 && (
            <div className="text-xs text-muted-foreground">No services</div>
          )}
        </div>
      </div>

      {/* Staff */}
      <div className="lg:col-span-2">
        <Label className="text-xs">Staff</Label>
        <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-auto pr-1">
          {staff.map((st) => {
            const checked = staffIds.has(st._id);
            return (
              <label
                key={st._id}
                className={cn(
                  "flex items-center gap-2 rounded-md border p-2 cursor-pointer",
                  checked
                    ? "border-primary ring-2 ring-primary/30"
                    : "hover:bg-muted/40",
                )}
              >
                <input
                  type="checkbox"
                  className="h-4 w-4"
                  checked={checked}
                  onChange={() => toggleStaff(st._id)}
                />
                <span className="text-sm">{st.name}</span>
              </label>
            );
          })}
          {staff.length === 0 && (
            <div className="text-xs text-muted-foreground">No staff</div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function ReviewsFilters({
  services,
  staff,
  onApply,
  busy,
}: ReviewsFiltersProps) {
  const { clear, isFiltered } = useReviewsFilterStore();
  const filtered = isFiltered();

  // mobile sheet open
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Desktop sticky accordion */}
      <div className="hidden lg:block sticky top-0 z-30 border-b bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <Accordion type="single" collapsible className="px-4">
          <AccordionItem value="filters">
            <AccordionTrigger className="py-3">
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4" />
                Filters
                {filtered && (
                  <span className="relative ml-1">
                    <span className="absolute inline-flex h-2.5 w-2.5 rounded-full bg-red-500 opacity-75 animate-ping" />
                    <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-red-600" />
                  </span>
                )}
              </div>
            </AccordionTrigger>
            <AccordionContent className="pb-4">
              <FiltersBody services={services} staff={staff} />
              <div className="mt-4 flex items-center gap-3">
                <Button className="text-white" onClick={onApply} disabled={busy}>
                  {busy ? "Applying..." : "Apply Filters"}
                </Button>
                <Button variant="outline" onClick={clear} disabled={busy}>
                  Clear
                </Button>
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>

      {/* Mobile button + sheet */}
      <div className="lg:hidden px-4 pt-2 ">
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button variant="outline" className="relative">
              <Filter className="w-4 h-4 mr-2" />
              Filters
              {filtered && (
                <span className="absolute -top-1 -right-1">
                  <span className="absolute inline-flex h-2.5 w-2.5 rounded-full bg-red-500 opacity-75 animate-ping" />
                  <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-red-600" />
                </span>
              )}
            </Button>
          </SheetTrigger>
          <SheetContent side="bottom" className="h-[90vh] overflow-y-auto">
            <SheetHeader>
              <SheetTitle>Filters</SheetTitle>
            </SheetHeader>
            <div className="py-4 pb-[10rem]">
              <FiltersBody services={services} staff={staff} compact />
            </div>
            <section className="-ml-6 md:mx-auto">
              <AdvancedBottomButton
                fixed={true}
                maxWidth="30rem"
                buttons={[
                  {
                    text: "",
                    isBackButton: true,
                    onClick: () => setOpen(false),
                    className: "pl-2.5 !w-12 rounded-md",
                  },
                  {
                    text: "Clear",
                    onClick: (e) => {
                      e.preventDefault();
                      const { clear } = useReviewsFilterStore.getState();
                      clear();
                    },
                  },
                  {
                    text: "Apply Filters",
                    onClick: (e) => {
                      e.preventDefault();
                      const { apply } = useReviewsFilterStore.getState();
                      apply();
                      setOpen(false)
                    },
                  },
                ]}
              />
            </section>
          </SheetContent>
        </Sheet>
      </div>
    </>
  );
}
