import LoadingSpinner from '@/components/atom/loadingSpinner';
import { DEFAULT_GROUP, serviceIdOf, useCheckoutGroup, useSaveCheckoutGroup, type CheckoutGroup } from '@/components/store/hotel/useCheckoutTasks';
import { useGetServiceCategories } from '@/components/store/hotel/useHotelServices';
import useBusinessData from '@/components/store/useBusinessData';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { AlertTriangle, ArrowRight, CheckCircle2, Clock, Search } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';

// Matches the Service Performance Report: rounded-2xl slate cards, Fraunces
// headings, indigo accent, uppercase tracked labels, text-[11px] supporting copy.
const card = 'rounded-2xl border border-slate-200/80 bg-white shadow-[0_1px_2px_rgba(15,23,42,0.03),0_2px_10px_-3px_rgba(15,23,42,0.06)]';
const sectionTitle = 'font-fraunces text-lg font-bold text-slate-900';
const sectionSub = 'text-[13px] text-slate-500';
const fieldLabel = 'text-xs font-semibold uppercase tracking-wider text-slate-400';
const numberInput = 'h-10 border-slate-200 text-sm focus:ring-2 focus:ring-indigo-500/30';
const chipBase = 'rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors';
const chipOn = 'border-indigo-600 bg-indigo-600 text-white';
const chipOff = 'border-slate-200 bg-white text-slate-600 hover:border-indigo-300 hover:text-slate-900';

type DurationUnit = 'min' | 'sec';

const durationToDisplay = (minutes: number, unit: DurationUnit) => {
  const value = unit === 'sec' ? minutes * 60 : minutes;
  return Number(value.toFixed(2)).toString();
};

const unitForDuration = (minutes: number): DurationUnit => (minutes > 0 && minutes < 1 ? 'sec' : 'min');

const toMinutes = (value: string, unit: DurationUnit) => {
  const numeric = Number(value);
  if (!Number.isFinite(numeric) || numeric <= 0) return null;
  return Number((unit === 'sec' ? numeric / 60 : numeric).toFixed(4));
};

const formatDuration = (minutes: number) => {
  const totalSeconds = Math.round(minutes * 60);
  if (totalSeconds < 60) return `${totalSeconds}s`;
  const mins = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return seconds ? `${mins}m ${seconds}s` : `${mins}m`;
};

const DurationInput = ({
  value,
  maxMins,
  className,
  onChange,
}: {
  value: number;
  maxMins: number;
  className: string;
  onChange: (minutes: number) => void;
}) => {
  const [unit, setUnit] = useState<DurationUnit>(() => unitForDuration(value));
  const displayValue = durationToDisplay(value, unit);

  const commit = (raw: string, selectedUnit = unit) => {
    const minutes = toMinutes(raw, selectedUnit);
    if (minutes == null) return;
    onChange(Math.min(maxMins, minutes));
  };

  return (
    <div className="flex items-center gap-2">
      <Input type="text" inputMode="decimal" className={className} value={displayValue} onChange={(e) => commit(e.target.value)} />
      <select
        value={unit}
        onChange={(e) => {
          const nextUnit = e.target.value as DurationUnit;
          setUnit(nextUnit);
        }}
        className="h-9 rounded-md border border-slate-200 bg-white px-2 text-sm text-slate-600"
      >
        <option value="min">min</option>
        <option value="sec">sec</option>
      </select>
    </div>
  );
};

/**
 * Room checkout automation.
 *
 * Picking a service here does NOT move it out of its category — the group only
 * references services, so a service stays orderable by guests exactly as before.
 */
const CheckoutAutomation = () => {
  const businessId = useBusinessData((s) => s.outletInfo?.businessId) ?? '';
  const { group, isLoading } = useCheckoutGroup(businessId);
  const { categoriesData = [], categoriesLoading } = useGetServiceCategories(businessId) as {
    categoriesData?: Array<{ _id: string; name: string; serviceIds: Array<{ _id: string; name: string }> }>;
    categoriesLoading?: boolean;
  };
  const save = useSaveCheckoutGroup();

  const [form, setForm] = useState<CheckoutGroup>({ businessId, ...DEFAULT_GROUP });
  const [search, setSearch] = useState('');

  // Server state is the source of truth; hydrate once it arrives.
  useEffect(() => {
    if (!group) return;
    setForm({
      ...DEFAULT_GROUP,
      ...group,
      businessId,
      services: (group.services ?? []).map((s) => ({ ...s, serviceId: serviceIdOf(s) })),
    });
  }, [group, businessId]);

  const selected = useMemo(() => new Map(form.services.map((s) => [serviceIdOf(s), s] as const)), [form.services]);

  const setField = <K extends keyof CheckoutGroup>(key: K, value: CheckoutGroup[K]) => setForm((prev) => ({ ...prev, [key]: value }));

  const toggleService = (serviceId: string) =>
    setForm((prev) => {
      const exists = prev.services.some((s) => serviceIdOf(s) === serviceId);
      return {
        ...prev,
        services: exists
          ? prev.services.filter((s) => serviceIdOf(s) !== serviceId)
          : [...prev.services, { serviceId, acceptMins: 2, completeMins: 45 }],
      };
    });

  const setSla = (serviceId: string, key: 'acceptMins' | 'completeMins', value: number) =>
    setForm((prev) => ({
      ...prev,
      services: prev.services.map((s) => (serviceIdOf(s) === serviceId ? { ...s, [key]: value } : s)),
    }));

  const needle = search.trim().toLowerCase();
  const categories = categoriesData
    .map((cat) => ({
      ...cat,
      serviceIds: (cat.serviceIds ?? []).filter((s) => !needle || s.name?.toLowerCase().includes(needle)),
    }))
    .filter((cat) => cat.serviceIds.length);

  const nameById = useMemo(() => {
    const map = new Map<string, string>();
    for (const cat of categoriesData) for (const s of cat.serviceIds ?? []) map.set(s._id, s.name);
    return map;
  }, [categoriesData]);

  if (isLoading || categoriesLoading) return <LoadingSpinner />;

  const ladder = form.widenToOtherFloors
    ? `floor staff ${formatDuration(form.floorWindowMins)} → all floors ${formatDuration(form.otherFloorsWindowMins)} → manager`
    : `floor staff ${formatDuration(form.floorWindowMins)} → manager`;

  return (
    <div className="font-inter space-y-4 pb-8 text-slate-800">
      {/* Header + primary action. Sticky so Save is reachable from anywhere on
          the page — the service list below is long enough to scroll. */}
      <div className={`${card} sticky top-0 z-20 flex flex-wrap items-center justify-between gap-4 p-4`}>
        <div className="flex items-start gap-3">
          <div className="rounded-xl bg-amber-50 p-2.5 text-amber-600 ring-1 ring-amber-200">
            <Clock className="h-5 w-5" />
          </div>
          <div>
            <h3 className={sectionTitle}>Room checkout automation</h3>
            <p className={`${sectionSub} mt-0.5`}>
              When reception checks a room out, these services are raised automatically for the staff assigned to that floor.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Label htmlFor="ca-active" className="text-sm font-semibold">
              {form.isActive ? 'Active' : 'Paused'}
            </Label>
            <Switch id="ca-active" checked={form.isActive} onCheckedChange={(v) => setField('isActive', v)} />
          </div>
          <Button
            onClick={() => save.mutate({ ...form, businessId, services: form.services.map((s) => ({ ...s, serviceId: serviceIdOf(s) })) })}
            disabled={save.isPending || !businessId}
            className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition-all hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-slate-300"
          >
            {save.isPending ? 'Saving…' : 'Save automation'}
          </Button>
        </div>
      </div>

      {/* Escalation ladder */}
      <div className={`${card} space-y-4 p-[18px]`}>
        <h3 className={sectionTitle}>If nobody accepts</h3>

        <div className="flex flex-wrap items-end gap-4">
          <div className="w-44">
            <Label className={fieldLabel}>Floor staff get</Label>
            <div className="mt-1 flex items-center gap-2">
              <DurationInput
                className={numberInput}
                value={form.floorWindowMins}
                maxMins={120}
                onChange={(minutes) => setField('floorWindowMins', minutes)}
              />
            </div>
          </div>

          <ArrowRight className="mb-2 h-4 w-4 text-slate-300" />

          <div className="flex items-center gap-2 pb-2">
            <Switch id="ca-widen" checked={form.widenToOtherFloors} onCheckedChange={(v) => setField('widenToOtherFloors', v)} />
            <Label htmlFor="ca-widen" className="text-sm font-semibold">
              Then offer it to other floors
            </Label>
          </div>

          {form.widenToOtherFloors ? (
            <div className="w-44">
              <Label className={fieldLabel}>Other floors get</Label>
              <div className="mt-1 flex items-center gap-2">
                <DurationInput
                  className={numberInput}
                  value={form.otherFloorsWindowMins}
                  maxMins={120}
                  onChange={(minutes) => setField('otherFloorsWindowMins', minutes)}
                />
              </div>
            </div>
          ) : null}

          <ArrowRight className="mb-2 h-4 w-4 text-slate-300" />

          <div className="flex items-center gap-2 pb-2">
            <Switch id="ca-mgr" checked={form.notifyManager} onCheckedChange={(v) => setField('notifyManager', v)} />
            <Label htmlFor="ca-mgr" className="text-sm font-semibold">
              WhatsApp the manager
            </Label>
          </div>
        </div>

        <p className="rounded-lg bg-slate-50 px-3 py-2.5 text-[13px] text-slate-600 ring-1 ring-slate-200">
          <b className="text-slate-900">Ladder:</b> {ladder}. Only staff assigned to rooms ever receive the task.
        </p>
      </div>

      {/* Service picker */}
      <div className={`${card} space-y-3 p-[18px]`}>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className={sectionTitle}>Services raised on checkout</h3>
            <p className={`${sectionSub} mt-0.5`}>
              Selecting a service here does not remove it from its category — guests can still order it as usual.
            </p>
          </div>
          <div className="relative w-64">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search services…"
              className="h-10 border-slate-200 pl-9 text-sm focus:ring-2 focus:ring-indigo-500/30"
            />
          </div>
        </div>

        {form.services.length ? (
          <div className="space-y-2 rounded-xl border border-slate-200 bg-slate-50 p-3">
            <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Selected · {form.services.length}</div>
            {form.services.map((s) => {
              const id = serviceIdOf(s);
              return (
                <div key={id} className="flex flex-wrap items-center gap-3 rounded-lg bg-white p-3 ring-1 ring-slate-200">
                  <CheckCircle2 className="h-[18px] w-[18px] shrink-0 text-emerald-600" />
                  <span className="min-w-[140px] flex-1 text-[15px] font-semibold text-slate-900">{nameById.get(id) || 'Service'}</span>
                  <div className="flex items-center gap-2">
                    <Label className={fieldLabel}>Accept in</Label>
                    <DurationInput
                      className="h-9 w-[70px] border-slate-200 text-sm focus:ring-2 focus:ring-indigo-500/30"
                      value={s.acceptMins}
                      maxMins={120}
                      onChange={(minutes) => setSla(id, 'acceptMins', minutes)}
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <Label className={fieldLabel}>Complete in</Label>
                    <DurationInput
                      className="h-9 w-[70px] border-slate-200 text-sm focus:ring-2 focus:ring-indigo-500/30"
                      value={s.completeMins}
                      maxMins={600}
                      onChange={(minutes) => setSla(id, 'completeMins', minutes)}
                    />
                  </div>
                  <Button size="sm" variant="ghost" className="text-sm font-semibold text-[#8a2f2f]" onClick={() => toggleService(id)}>
                    Remove
                  </Button>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="flex items-center gap-2 rounded-xl border border-dashed border-amber-300 bg-amber-50 p-3.5 text-[13px] text-amber-800">
            <AlertTriangle className="h-4 w-4 shrink-0" />
            No services selected — checkouts will not raise anything yet.
          </div>
        )}

        <div className="max-h-[340px] space-y-4 overflow-y-auto pt-1">
          {categories.map((cat) => (
            <div key={cat._id}>
              <div className="mb-2 text-[11px] font-bold uppercase tracking-wider text-slate-400">{cat.name}</div>
              <div className="flex flex-wrap gap-2">
                {cat.serviceIds.map((svc) => {
                  const on = selected.has(svc._id);
                  return (
                    <button key={svc._id} type="button" onClick={() => toggleService(svc._id)} className={`${chipBase} ${on ? chipOn : chipOff}`}>
                      {svc.name}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Preview — the Save button lives in the sticky header above. */}
      <div className={`${card} p-4`}>
        <p className="text-[13px] text-slate-600">
          <b className="text-slate-900">On checkout →</b>{' '}
          {form.services.length
            ? form.services
                .map((s) => `${nameById.get(serviceIdOf(s)) || 'Service'} (accept ${s.acceptMins}m · complete ${s.completeMins}m)`)
                .join(' · ')
            : 'nothing yet'}
        </p>
      </div>
    </div>
  );
};

export default CheckoutAutomation;
