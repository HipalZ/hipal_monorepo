import type { BusinessDayConfig } from '@/components/types/business-day-config'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { useMemo } from 'react'
import { Coffee, Sun, Sunset, Moon, Calendar } from 'lucide-react'

interface SlotsPreviewModalProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  dayConfig: BusinessDayConfig
}

const INTERVAL = 30 // minutes

export default function SlotsPreviewModal({
  isOpen,
  onOpenChange,
  dayConfig,
}: SlotsPreviewModalProps) {
  // — Time helpers (inlined) —
  const toMins = (t: string) => {
    const [h, m] = t.split(':').map((x) => Number.parseInt(x, 10))
    return h * 60 + m
  }
  const fmt = (minsTotal: number) => {
    const dayMins = 24 * 60
    const nm = ((minsTotal % dayMins) + dayMins) % dayMins
    const h24 = Math.floor(nm / 60)
    const m = nm % 60
    const ampm = h24 >= 12 ? 'PM' : 'AM'
    const h12 = h24 % 12 === 0 ? 12 : h24 % 12
    return `${h12.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')} ${ampm}`
  }

  // — Business hours (allowing end past midnight) —
  const startMin = toMins(dayConfig.startTime)
  const rawEnd = toMins(dayConfig.endTime)
  const endMin = rawEnd < startMin ? rawEnd + 24 * 60 : rawEnd

  // — Closed-interval minute ranges —
  const closedRanges = dayConfig.closedIntervals.map(({ startTime, endTime }) => {
    let s = toMins(startTime),
      e = toMins(endTime)
    if (e < s) e += 24 * 60
    return [s, e] as const
  })

  // — Generate all 30-min slots once —
  const slots = useMemo(() => {
    const out: { start: number; end: number; open: boolean }[] = []
    for (let t = startMin; t < endMin; t += INTERVAL) {
      const tEnd = Math.min(t + INTERVAL, endMin)
      const isClosed = closedRanges.some(([cs, ce]) => t < ce && tEnd > cs)
      out.push({ start: t, end: tEnd, open: !isClosed })
    }
    return out
  }, [startMin, endMin, closedRanges])

  // — Define periods (with icons/colors) —
  const periodDefs = [
    { id: 0, name: 'Morning', start: 4 * 60, end: 12 * 60, icon: <Coffee />, color: 'bg-amber-100' },
    { id: 1, name: 'Afternoon', start: 12 * 60, end: 16 * 60, icon: <Sun />, color: 'bg-blue-100' },
    { id: 2, name: 'Evening', start: 16 * 60, end: 19 * 60, icon: <Sunset />, color: 'bg-orange-100' },
    { id: 3, name: 'Night', start: 19 * 60, end: 28 * 60, icon: <Moon />, color: 'bg-indigo-100' },
  ]

  // — Compute stats per period —
  const periodStats = useMemo(() => {
    return periodDefs.map((p) => {
      const ps = Math.max(p.start, startMin)
      const pe = Math.min(p.end, endMin)
      const total = pe > ps ? Math.floor((pe - ps) / INTERVAL) : 0
      const closedCount = slots.filter(
        (slot) =>
          slot.start < p.end &&
          slot.end > p.start &&
          !slot.open
      ).length
      return {
        ...p,
        total,
        open: total - closedCount,
        closed: closedCount,
        slotList: slots.filter(
          (slot) => slot.start < p.end && slot.end > p.start
        ),
      }
    })
  }, [periodDefs, startMin, endMin, slots])

  // — Grand totals —
  const grand = periodStats.reduce(
    (acc, p) => ({ total: acc.total + p.total, open: acc.open + p.open }),
    { total: 0, open: 0 }
  )

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="h-[100dvh] md:h-[85dvh] overflow-hidden w-full max-w-[45rem]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-purple-500" /> Slots Overview
          </DialogTitle>
          <DialogDescription>
            {`Business hours: ${fmt(startMin)} – ${fmt(endMin)}`}
          </DialogDescription>
        </DialogHeader>

        {/* Grand total */}
        <div className="p-4 mb-4 bg-gray-50 rounded flex items-center gap-4">
          <span className="font-medium">Total slots:</span>
          <span className="font-semibold">{grand.total}</span>
          <Badge>{grand.open} Open</Badge>
          <Badge variant="destructive">{grand.total - grand.open} Closed</Badge>
        </div>

        {/* Per-period section */}
        <div className="space-y-6 h-[80dvh] md:h-[60dvh] overflow-y-auto pb-[10rem] hide-scrollbar">
          {periodStats.map((p) => (
            <div key={p.id}>
              {/* Period header */}
              <div className="flex items-center gap-2 mb-2">
                <div className={`p-2 rounded ${p.color}`}>{p.icon}</div>
                <h4 className="text-lg font-medium">
                  {p.name}: {p.total} slots —{' '}
                  <span className="text-green-600">{p.open} Open</span>,{' '}
                  <span className="text-red-600">{p.closed} Closed</span>
                </h4>
              </div>

              {/* Period’s slot grid */}
                <div className="grid grid-cols-2 gap-2 md:grid-cols-3 lg:grid-cols-4">
                  {p.slotList.map((slot, i) => (
                    <div
                      key={i}
                      className={`flex flex-col items-center justify-center p-2 text-xs rounded border ${
                        slot.open
                          ? 'bg-green-50 border-green-200'
                          : 'bg-red-50 border-red-200'
                      }`}
                    >
                      <div className="truncate">
                        {fmt(slot.start)} – {fmt(slot.end)}
                      </div>
                      <Badge className="mt-1">
                        {slot.open ? 'Open' : 'Closed'}
                      </Badge>
                    </div>
                  ))}
                </div>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  )
}
