import { usePeopleFiltersStore } from '@/components/store/useUserFilter.ts';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format } from 'date-fns';
import { CalendarIcon } from 'lucide-react';

export function FiltersPanel() {
  const filters = usePeopleFiltersStore((state) => state.filters);
  const setFilter = usePeopleFiltersStore((state) => state.setFilter);
  const clearFilters = usePeopleFiltersStore((state) => state.clearFilters);

  return (
    <aside className="bg-background w-full space-y-6 rounded-xl border p-5 shadow-sm">
      {/* Search */}
      {/* <div className="space-y-2">
        <Label>Search</Label>
        <Input
          placeholder="Name, phone…"
          value={filters.search}
          onChange={(e) => setFilter("search", e.target.value)}
        />
      </div> */}

      {/* Spend */}
      <div>
        <Label>Avg Spend</Label>
        <div className="grid grid-cols-2 gap-2">
          <Input
            placeholder="Min"
            type="number"
            value={filters.spendMin || ''}
            onChange={(e) => setFilter('spendMin', e.target.value ? Number(e.target.value) : undefined)}
          />
          <Input
            placeholder="Max"
            type="number"
            value={filters.spendMax || ''}
            onChange={(e) => setFilter('spendMax', e.target.value ? Number(e.target.value) : undefined)}
          />
        </div>
      </div>

      {/* Total Spend */}
      <div>
        <Label>Total Spend</Label>
        <div className="grid grid-cols-2 gap-2">
          <Input
            placeholder="Min"
            type="number"
            value={filters.totalSpendMin || ''}
            onChange={(e) => setFilter('totalSpendMin', e.target.value ? Number(e.target.value) : undefined)}
          />
          <Input
            placeholder="Max"
            type="number"
            value={filters.totalSpendMax || ''}
            onChange={(e) => setFilter('totalSpendMax', e.target.value ? Number(e.target.value) : undefined)}
          />
        </div>
      </div>

      {/* Visits */}
      <div>
        <Label>Visits</Label>
        <div className="grid grid-cols-2 gap-2">
          <Input
            placeholder="Min"
            type="number"
            value={filters.visitsMin || ''}
            onChange={(e) => setFilter('visitsMin', e.target.value ? Number(e.target.value) : undefined)}
          />
          <Input
            placeholder="Max"
            type="number"
            value={filters.visitsMax || ''}
            onChange={(e) => setFilter('visitsMax', e.target.value ? Number(e.target.value) : undefined)}
          />
        </div>
      </div>

      {/* Date of Joining */}
      <div>
        <Label>Date of Joining</Label>
        <div className="grid grid-cols-2 gap-2">
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="justify-start">
                <CalendarIcon className="mr-2 h-4 w-4" />
                {filters.dateFrom ? format(filters.dateFrom, 'dd-MM-yyyy') : 'From'}
              </Button>
            </PopoverTrigger>
            <PopoverContent align="start">
              <Calendar
                mode="single"
                selected={filters.dateFrom ? new Date(filters.dateFrom) : undefined}
                onSelect={(date) => setFilter('dateFrom', date ? date.getTime() : undefined)}
              />
            </PopoverContent>
          </Popover>

          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="justify-start">
                <CalendarIcon className="mr-2 h-4 w-4" />
                {filters.dateTo ? format(filters.dateTo, 'dd-MM-yyyy') : 'To'}
              </Button>
            </PopoverTrigger>
            <PopoverContent align="start">
              <Calendar
                mode="single"
                selected={filters.dateTo ? new Date(filters.dateTo) : undefined}
                onSelect={(date) => setFilter('dateTo', date ? date.getTime() : undefined)}
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>

      <Button variant="outline" onClick={clearFilters} className="w-full">
        Clear Filters
      </Button>
    </aside>
  );
}
