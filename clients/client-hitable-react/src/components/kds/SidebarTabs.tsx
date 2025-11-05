// src/components/kds/SidebarTabs.tsx
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { useMemo, useState } from 'react';
import { cn } from '../../lib/utils';
import { useKdsStore } from '../store/useKdsStore';
import type { KotOrderDoc } from '../types/kds';

interface SidebarTabsProps {
  kitchenId: string;
  openOrders: KotOrderDoc[];
  historyOrders?: KotOrderDoc[];
  onRefreshOpen: () => void;
  onRefreshHistory?: () => void;
  loadingOpen?: boolean;
  loadingHistory?: boolean;
}

const waiterLabel = (o: KotOrderDoc) => ((o as any).acceptedByName || (o as any).acceptedBy || o.name || '').toString().trim();

export const SidebarTabs = ({
  kitchenId,
  openOrders,
  historyOrders = [],
  onRefreshOpen,
  onRefreshHistory,
  loadingOpen,
  loadingHistory,
}: SidebarTabsProps) => {
  const activeTab = useKdsStore((s) => s.activeTab);
  const setActiveTab = useKdsStore((s) => s.setActiveTab);

  const searchDish = useKdsStore((s) => s.searchDish);
  const setSearchDish = useKdsStore((s) => s.setSearchDish);
  const selectedDishNames = useKdsStore((s) => s.selectedDishNames);
  const toggleDishName = useKdsStore((s) => s.toggleDishName);
  const clearDishSelection = useKdsStore((s) => s.clearDishSelection);
  const getDishSummary = useKdsStore((s) => s.getDishSummary);

  const onlyActive = useKdsStore((s) => s.onlyActive);
  const setOnlyActive = useKdsStore((s) => s.setOnlyActive);

  const waiterFilter = useKdsStore((s) => s.waiterFilter);
  const toggleWaiter = useKdsStore((s) => s.toggleWaiter);
  const clearWaiterFilter = useKdsStore((s) => s.clearWaiterFilter);

  const tableFilter = useKdsStore((s) => s.tableFilter);
  const toggleTable = useKdsStore((s) => s.toggleTable);
  const clearTableFilter = useKdsStore((s) => s.clearTableFilter);

  const srcOrders = activeTab === 'OPEN' ? openOrders : historyOrders;

  // Dishes
  const openSummary = useMemo(() => (activeTab === 'OPEN' ? getDishSummary(openOrders) : []), [activeTab, openOrders, getDishSummary]);
  const allDishNames = useMemo(() => {
    if (activeTab === 'OPEN') return openSummary.map((r) => r.name);
    const s = new Set<string>();
    for (const o of srcOrders) for (const ci of o.cart) if (ci?.dish?.name) s.add(ci.dish.name);
    return Array.from(s).sort();
  }, [activeTab, openSummary, srcOrders]);

  // Waiters & Tables
  const allWaiters = useMemo(() => {
    const s = new Set<string>();
    for (const o of srcOrders) {
      const w = waiterLabel(o);
      if (w) s.add(w);
    }
    return Array.from(s).sort();
  }, [srcOrders]);

  const allTables = useMemo(() => {
    const s = new Set<string>();
    for (const o of srcOrders) if (o.tableName) s.add(o.tableName);
    return Array.from(s).sort();
  }, [srcOrders]);

  // Local search queries for lists
  const [waiterQuery, setWaiterQuery] = useState('');
  const [tableQuery, setTableQuery] = useState('');

  const filteredDishNames = useMemo(() => {
    const q = searchDish.trim().toLowerCase();
    return q ? allDishNames.filter((n) => n.toLowerCase().includes(q)) : allDishNames;
  }, [allDishNames, searchDish]);

  const filteredWaiters = useMemo(() => {
    const q = waiterQuery.trim().toLowerCase();
    return q ? allWaiters.filter((n) => n.toLowerCase().includes(q)) : allWaiters;
  }, [allWaiters, waiterQuery]);

  const filteredTables = useMemo(() => {
    const q = tableQuery.trim().toLowerCase();
    return q ? allTables.filter((n) => n.toLowerCase().includes(q)) : allTables;
  }, [allTables, tableQuery]);

  const hasAnyFilter = selectedDishNames.size || waiterFilter.size || tableFilter.size;

  const Pill: React.FC<{ label: string; onClick: () => void }> = ({ label, onClick }) => (
    <Badge onClick={onClick} className="cursor-pointer bg-zinc-100 text-base text-zinc-900 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-100">
      {label} ×
    </Badge>
  );

  return (
    <Card className="hide-scrollbar h-[calc(100vh-60px)] overflow-auto border-transparent bg-white text-black dark:bg-zinc-950 dark:text-zinc-100">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between text-base">
          KDS
          <Button
            variant="outline"
            size="sm"
            onClick={activeTab === 'OPEN' ? onRefreshOpen : (onRefreshHistory ?? onRefreshOpen)}
            className={(activeTab === 'OPEN' ? loadingOpen : loadingHistory) ? 'opacity-70' : ''}
          >
            Refresh
          </Button>
        </CardTitle>
        <div className="text-xs text-zinc-500">
          Kitchen: <span className="text-zinc-800 dark:text-zinc-200">{kitchenId}</span>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Tabs */}
        <div className="flex gap-2">
          <Button variant={activeTab === 'OPEN' ? 'default' : 'outline'} size="sm" onClick={() => setActiveTab('OPEN')}>
            Open
          </Button>
          <Button variant={activeTab === 'COMPLETED' ? 'default' : 'outline'} size="sm" onClick={() => setActiveTab('COMPLETED')}>
            History
          </Button>
          {hasAnyFilter ? (
            <Button
              variant="secondary"
              size="sm"
              onClick={() => {
                clearDishSelection();
                clearWaiterFilter();
                clearTableFilter();
                setSearchDish('');
                setWaiterQuery('');
                setTableQuery('');
              }}
            >
              Clear all
            </Button>
          ) : null}
        </div>

        <Separator />
        {/* Dish filter */}
        <div className="space-y-2">
          <Label className="text-secondary text-base font-semibold">Filter by dish</Label>
          <Command className="rounded-md border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950">
            <CommandInput placeholder="Type dish name…" value={searchDish} onValueChange={setSearchDish} />
            <CommandList className="max-h-56">
              <CommandEmpty>No dishes found.</CommandEmpty>
              <CommandGroup>
                {filteredDishNames.map((name) => {
                  const active = selectedDishNames.has(name);
                  const count =
                    activeTab === 'OPEN'
                      ? (openSummary.find((r) => r.name === name)?.inProgress ?? 0)
                      : srcOrders.reduce((acc, o) => acc + o.cart.filter((ci) => ci.dish?.name === name).length, 0);

                  return (
                    <CommandItem
                      key={name}
                      onSelect={() => useKdsStore.getState().toggleDishName(name)}
                      className={cn(
                        'flex items-center justify-between rounded-md px-2 py-1.5',
                        active && 'bg-purple-50 text-purple-700 dark:bg-purple-900/30',
                      )}
                    >
                      <span className="truncate text-base">{name}</span>
                      <Badge variant="secondary" className="text-base">
                        ×{count}
                      </Badge>
                    </CommandItem>
                  );
                })}
              </CommandGroup>
            </CommandList>
          </Command>

          {!!selectedDishNames.size && (
            <div className="flex flex-wrap gap-2 pt-1">
              {Array.from(selectedDishNames).map((n) => (
                <Pill key={n} label={n} onClick={() => toggleDishName(n)} />
              ))}
            </div>
          )}
        </div>

        {/* Waiter filter */}
        <div className="space-y-2">
          <Label className="text-secondary text-base font-semibold">Filter by captain</Label>
          <Command className="rounded-md border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950">
            <CommandInput placeholder="Type waiter name…" value={waiterQuery} onValueChange={setWaiterQuery} />
            <CommandList className="max-h-56">
              <CommandEmpty>No waiters found.</CommandEmpty>
              <CommandGroup>
                {filteredWaiters.map((name) => {
                  const active = waiterFilter.has(name);
                  const count = srcOrders.filter((o) => waiterLabel(o) === name).length;
                  return (
                    <CommandItem
                      key={name}
                      onSelect={() => toggleWaiter(name)}
                      className={cn(
                        'flex items-center justify-between rounded-md px-2 py-1.5',
                        active && 'bg-purple-50 text-purple-700 dark:bg-purple-900/30',
                      )}
                    >
                      <span className="truncate text-base">{name}</span>
                      <Badge variant="secondary" className="text-base">
                        ×{count}
                      </Badge>
                    </CommandItem>
                  );
                })}
              </CommandGroup>
            </CommandList>
          </Command>

          {!!waiterFilter.size && (
            <div className="flex flex-wrap gap-2 pt-1">
              {Array.from(waiterFilter).map((w) => (
                <Pill key={w} label={w} onClick={() => toggleWaiter(w)} />
              ))}
            </div>
          )}
        </div>

        {/* Table filter */}
        <div className="space-y-2">
          <Label className="text-secondary text-base font-semibold">Filter by table</Label>
          <Command className="rounded-md border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950">
            <CommandInput placeholder="Type table…" value={tableQuery} onValueChange={setTableQuery} />
            <CommandList className="max-h-56">
              <CommandEmpty>No tables found.</CommandEmpty>
              <CommandGroup>
                {filteredTables.map((name) => {
                  const active = tableFilter.has(name);
                  const count = srcOrders.filter((o) => o.tableName === name).length;
                  return (
                    <CommandItem
                      key={name}
                      onSelect={() => toggleTable(name)}
                      className={cn(
                        'flex items-center justify-between rounded-md px-2 py-1.5',
                        active && 'bg-purple-50 text-purple-700 dark:bg-purple-900/30',
                      )}
                    >
                      <span className="truncate text-base">{name}</span>
                      <Badge variant="secondary" className="text-base">
                        ×{count}
                      </Badge>
                    </CommandItem>
                  );
                })}
              </CommandGroup>
            </CommandList>
          </Command>

          {!!tableFilter.size && (
            <div className="flex flex-wrap gap-2 pt-1">
              {Array.from(tableFilter).map((t) => (
                <Pill key={t} label={t} onClick={() => toggleTable(t)} />
              ))}
            </div>
          )}
        </div>

        <Separator className="my-3" />
      </CardContent>
    </Card>
  );
};
