import { useMemo, useState, useCallback } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Search as SearchIcon, Grid3x3 } from "lucide-react";
import PopUp from "../atoms/popUp/index.tsx";
import { useHotelStore } from "../store/useHotelStore.ts";

export interface IService {
  _id: string;
  name: string;
  image?: string;
  availability?: boolean;
  // optional meta you may have:
  avgCompletionTime?: number;
  avgAcceptanceTime?: number;
}

export interface IServiceCategory {
  _id: string;
  name: string;
  image?: string; // | StaticImageData also ok; cast to string when rendering
  description?: string;
  serviceIds: IService[];
}

type Props = {
  show: boolean;
  onClose: () => void;
  categories: IServiceCategory[];
  title?: string;
  placeholder?: string;
  onConfirm?: (serviceIds: string[]) => void;
};

const normalize = (s: string) => s.replace(/[_-]+/g, " ").toLowerCase();

export default function AllCategoriesServicesModal({
  show,
  onClose,
  categories,
  title = "All Services",
  placeholder = "Search categories or services…",
  onConfirm,
}: Props) {
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const roomData = useHotelStore((state) => state.roomData);
  console.log("roomData in CategorySearchModal:", roomData);

  // Build normalized model for search
  const modeled = useMemo(() => {
    return categories.map((c) => ({
      ...c,
      _normName: normalize(c.name || ""),
      _normDesc: normalize(c.description || ""),
      _services: (c.serviceIds || []).map((s) => ({
        ...s,
        _normName: normalize(s.name || ""),
      })),
    }));
  }, [categories]);

  // Filter by query: if category matches, include all its services; else include only matching services
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return modeled;

    return modeled
      .map((c) => {
        const catMatches = c._normName.includes(q) || c._normDesc.includes(q);
        const svc = c._services.filter((s) => s._normName.includes(q));
        const kept = catMatches ? c._services : svc;
        if (kept.length === 0) return null;
        return { ...c, _services: kept };
      })
      .filter(Boolean) as typeof modeled;
  }, [modeled, query]);

  const toggleService = useCallback((id: string, disabled: boolean) => {
    if (disabled) return;
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }, []);

  const isChecked = useCallback((id: string) => selected.has(id), [selected]);

  const selectAllInCategory = useCallback((services: IService[]) => {
    setSelected((prev) => {
      const next = new Set(prev);
      services.forEach((s) => {
        if (s.availability !== false) next.add(s._id);
      });
      return next;
    });
  }, []);

  const clearAllInCategory = useCallback((services: IService[]) => {
    setSelected((prev) => {
      const next = new Set(prev);
      services.forEach((s) => next.delete(s._id));
      return next;
    });
  }, []);

  const handleConfirm = useCallback(() => {
    onConfirm?.(Array.from(selected));
  }, [onConfirm, selected]);

  const handleClose = useCallback(() => {
    setQuery("");
    setSelected(new Set());
    onClose();
  }, [onClose]);

  return (
    <PopUp show={show} onClose={handleClose}>
      <div className="p-4 max-h-[90dvh] overflow-hidden flex flex-col bg-white">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xl font-bold text-primary">{title}</h2>
          <span className="text-xs text-gray-500">
            Selected: {selected.size}
          </span>
        </div>

        <div className="relative mb-3">
          <SearchIcon
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            size={18}
          />
          <Input
            placeholder={placeholder}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-9"
            autoFocus
          />
        </div>

        <div className="flex-1 overflow-auto hide-scrollbar pb-24 space-y-6">
          {modeled.length === 0 ? (
            <EmptyState
              icon={<Grid3x3 className="w-12 h-12 text-gray-300 mb-4" />}
              title="No Categories"
              subtitle="Categories will appear here once configured."
            />
          ) : filtered.length === 0 ? (
            <EmptyState
              icon={<SearchIcon className="w-12 h-12 text-gray-300 mb-4" />}
              title="No Results Found"
              subtitle="Try a different keyword or check spelling."
            />
          ) : (
            filtered.map((c) => {
              const prettyName = c.name.replace(/[_-]+/g, " ").trim();
              const total = c._services.length;
              const selectedCount = c._services.reduce(
                (acc, s) => (selected.has(s._id) ? acc + 1 : acc),
                0,
              );

              return (
                <section key={c._id} className="w-full">
                  {/* Category heading */}
                  <div className="flex items-center gap-3 mb-2">
                    {c.image ? (
                      <img
                        src={
                          typeof c.image === "string"
                            ? (c.image as string)
                            : (c.image as any)?.src
                        }
                        alt={prettyName}
                        width={40}
                        height={40}
                        className="w-10 h-10 object-contain"
                      />
                    ) : (
                      <Avatar className="w-10 h-10">
                        <AvatarFallback className="bg-primary text-white font-semibold">
                          {prettyName.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                    )}
                    <div className="min-w-0">
                      <h3 className="text-base font-semibold truncate">
                        {prettyName}
                      </h3>
                      <p className="text-[11px] text-gray-500 truncate">
                        {selectedCount}/{total} selected
                      </p>
                    </div>

                    {/* Cat controls */}
                    <div className="ml-auto flex items-center gap-2">
                      <Button
                        variant="outline"
                        className="p-2"
                        onClick={() => selectAllInCategory(c._services)}
                      >
                        Select All
                      </Button>
                      <Button
                        variant="ghost"
                        onClick={() => clearAllInCategory(c._services)}
                      >
                        Clear
                      </Button>
                    </div>
                  </div>

                  {/* Services grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {c._services.map((s) => {
                      const disabled = s.availability === false;
                      const checked = isChecked(s._id);
                      return (
                        <Card
                          key={s._id}
                          role="button"
                          aria-pressed={checked}
                          tabIndex={disabled ? -1 : 0}
                          onKeyDown={(e) => {
                            if (disabled) return;
                            if (e.key === "Enter" || e.key === " ") {
                              e.preventDefault();
                              toggleService(s._id, disabled);
                            }
                          }}
                          onClick={() => toggleService(s._id, disabled)}
                          className={`border cursor-pointer transition-all duration-200 hover:shadow-sm ${
                            disabled ? "opacity-50 cursor-not-allowed" : ""
                          } ${
                            checked
                              ? "border-primary bg-primary/5"
                              : "border-gray-200"
                          }`}
                        >
                          <CardContent className="p-3 flex items-center gap-3">
                            {/* Image / avatar */}
                            <div className="flex-shrink-0">
                              {s.image ? (
                                <img
                                  src={s.image}
                                  alt={s.name}
                                  width={40}
                                  height={40}
                                  className="w-10 h-10 rounded-md object-cover"
                                />
                              ) : (
                                <Avatar className="w-10 h-10">
                                  <AvatarFallback className="bg-primary text-white font-semibold">
                                    {(s.name?.[0] || "?").toUpperCase()}
                                  </AvatarFallback>
                                </Avatar>
                              )}
                            </div>

                            {/* Info */}
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center justify-between gap-2">
                                <h5 className="text-sm font-medium text-gray-900 truncate">
                                  {s.name}
                                </h5>
                                {disabled ? (
                                  <span className="text-[10px] font-medium text-red-600 bg-red-50 px-2 py-0.5 rounded">
                                    Unavailable
                                  </span>
                                ) : null}
                              </div>
                              {/* Optional SLA row if present */}
                              {(s as any).avgAcceptanceTime != null ||
                              (s as any).avgCompletionTime != null ? (
                                <p className="text-[11px] text-gray-500">
                                  {(s as any).avgAcceptanceTime != null && (
                                    <>
                                      Avg accept {(s as any).avgAcceptanceTime}m
                                      •{" "}
                                    </>
                                  )}
                                  {(s as any).avgCompletionTime != null && (
                                    <>
                                      Avg complete{" "}
                                      {(s as any).avgCompletionTime}m
                                    </>
                                  )}
                                </p>
                              ) : null}
                            </div>

                            {/* Checkbox */}
                            <input
                              type="checkbox"
                              className="w-4 h-4"
                              checked={checked}
                              onChange={() => toggleService(s._id, disabled)}
                              disabled={disabled}
                              aria-label={`Select ${s.name}`}
                              onClick={(e) => e.stopPropagation()}
                            />
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                </section>
              );
            })
          )}
        </div>

        {/* Bottom bar */}
        <div className="fixed left-0 right-0 bottom-0 bg-white border-t p-3 flex items-center gap-3 justify-end">
          <Button variant="ghost" onClick={handleClose}>
            Cancel
          </Button>
          <Button
            className="min-w-40"
            disabled={selected.size === 0}
            onClick={handleConfirm}
          >
            Request Services ({selected.size})
          </Button>
        </div>
      </div>
    </PopUp>
  );
}

function EmptyState({
  icon,
  title,
  subtitle,
}: {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      {icon}
      <h3 className="text-lg font-medium text-gray-500 mb-2">{title}</h3>
      <p className="text-sm text-gray-400">{subtitle}</p>
    </div>
  );
}
