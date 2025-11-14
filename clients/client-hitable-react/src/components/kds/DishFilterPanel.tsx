import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { useMemo } from 'react';
import { useKdsStore } from '../store/useKdsStore';

interface DishFilterPanelProps {
  kitchenId: string;
  orders: any[];
  onRefresh: () => void;
  loading?: boolean;
}

export const DishFilterPanel = ({ kitchenId, orders, onRefresh, loading }: DishFilterPanelProps) => {
  const { searchDish, setSearchDish, selectedDishNames, toggleDishName, clearDishSelection, onlyActive, setOnlyActive } = useKdsStore();

  const allDishNames = useMemo(() => {
    const set = new Set<string>();
    for (const o of orders) for (const ci of o.cart) ci?.dish?.name && set.add(ci.dish.name);
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [orders]);

  const filteredDishNames = useMemo(() => {
    const q = searchDish.trim().toLowerCase();
    if (!q) return allDishNames;
    return allDishNames.filter((n) => n.toLowerCase().includes(q));
  }, [allDishNames, searchDish]);

  return (
    <Card className="h-full border-zinc-800 bg-zinc-950 text-zinc-100">
      <CardHeader className="pb-3">
        <CardTitle className="text-base">KDS Filters</CardTitle>
        <div className="text-xs text-zinc-400">
          Kitchen: <span className="text-zinc-200">{kitchenId}</span>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Checkbox id="onlyActive" checked={onlyActive} onChange={(e) => setOnlyActive(e.currentTarget.checked)} />
            <Label htmlFor="onlyActive" className="text-xs text-zinc-300">
              Show only active KOTs
            </Label>
          </div>
          <Button variant="outline" size="sm" onClick={onRefresh} className={cn(loading && 'opacity-70')}>
            Refresh
          </Button>
        </div>

        <Separator />

        <div className="space-y-2">
          <Label className="text-xs text-zinc-300">Search dishes</Label>
          <Command className="rounded-md border border-zinc-800 bg-zinc-950">
            <CommandInput placeholder="Type dish name..." value={searchDish} onValueChange={setSearchDish} />
            <CommandList className="max-h-56">
              <CommandEmpty>No dishes found.</CommandEmpty>
              <CommandGroup>
                {filteredDishNames.map((name) => {
                  const active = selectedDishNames.has(name);
                  return (
                    <CommandItem key={name} onClick={() => toggleDishName(name)} className="flex items-center justify-between">
                      <span className="truncate">{name}</span>
                      <Checkbox checked={active} onChange={() => toggleDishName(name)} />
                    </CommandItem>
                  );
                })}
              </CommandGroup>
            </CommandList>
          </Command>

          {!!selectedDishNames.size && (
            <div className="flex flex-wrap gap-2 pt-2">
              {Array.from(selectedDishNames).map((n) => (
                <Badge key={n} className="bg-zinc-800 text-zinc-100">
                  {n}
                </Badge>
              ))}
              <Button variant="ghost" size="sm" onClick={clearDishSelection} className="text-zinc-400 hover:text-zinc-100">
                Clear
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
