import SpinnerMemo from '@/components/atoms/loadingSpinner';
import { useOrderStore } from '@/components/store/useOrderData';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Switch } from '@/components/ui/switch';
import { cn } from '@/lib/utils';
import { ArrowLeft, CheckCircle2, Eye, LayoutGrid, List, Save, Search, XCircle } from 'lucide-react';
import { memo, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCategories } from '../hooks/useCategories';
import { useDishes, useUpdateDish } from '../hooks/useDishes';

const MemoDishBatchManager = () => {
  const { data, isLoading } = useDishes();
  const { refetch: categoryRefetch } = useCategories();
  const { mutateAsync } = useUpdateDish();
  const navigate = useNavigate();

  const allCategories = useOrderStore((s) => s.allCategories);
  const allDishes = useOrderStore((s) => s.allDishes);

  const [filter, setFilter] = useState<'all' | 'visible' | 'available'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [progress, setProgress] = useState(0);
  const [editedDishes, setEditedDishes] = useState<Record<string, Partial<any>>>({});
  const categoryRefs = useRef<Record<string, HTMLElement | null>>({});

  const filteredDishes = useMemo(() => {
    let dishes = allDishes;

    // Apply filter
    switch (filter) {
      case 'visible':
        dishes = dishes.filter((d) => d.visibility);
        break;
      case 'available':
        dishes = dishes.filter((d) => d.availability);
        break;
    }

    // Apply search
    if (searchTerm) {
      dishes = dishes.filter((d) => d.name.toLowerCase().includes(searchTerm.toLowerCase()));
    }

    return dishes;
  }, [allDishes, filter, searchTerm]);

  const groupedByCategory = useMemo(() => {
    const grouped: Record<string, any[]> = {};
    filteredDishes.forEach((dish) => {
      (dish.categoryIds || []).forEach((cid: string) => {
        if (!grouped[cid]) grouped[cid] = [];
        grouped[cid].push(dish);
      });
    });
    return grouped;
  }, [filteredDishes]);

  const stats = useMemo(() => {
    const total = allDishes.length;
    const visible = allDishes.filter((d) => d.visibility).length;
    const available = allDishes.filter((d) => d.availability).length;
    return { total, visible, available };
  }, [allDishes]);

  useEffect(() => {
    if (data && Array.isArray(data) && data.length > 0) {
      if (allDishes.length !== data.length) {
        useOrderStore.setState({ allDishes: data });
      }
    }
  }, [data, allDishes.length]);

  const handleLocalToggle = (dish: any, key: 'availability' | 'visibility') => {
    const newValue = !dish[key];

    setEditedDishes((prev) => ({
      ...prev,
      [dish._id]: { ...(prev[dish._id] || {}), _id: dish._id, [key]: newValue },
    }));

    // Optimistic UI update
    useOrderStore.setState((prev) => ({
      allDishes: prev.allDishes.map((d) => (d._id === dish._id ? { ...d, [key]: newValue } : d)),
    }));
  };

  const handleSaveChanges = async () => {
    const updates = Object.values(editedDishes);
    if (updates.length === 0) return;

    setIsSaving(true);
    setProgress(0);

    for (let i = 0; i < updates.length; i++) {
      try {
        await mutateAsync(updates[i]);
        setProgress(Math.round(((i + 1) / updates.length) * 100));
      } catch (err) {
        console.error('Error updating dish:', updates[i]?._id, err);
      }
    }

    setIsSaving(false);
    setEditedDishes({});
    setProgress(100);
    await categoryRefetch();
  };

  // Loading state
  const loadingState = useMemo(() => {
    return isLoading && allDishes.length === 0;
  }, [isLoading, allDishes.length]);

  if (loadingState) {
    return (
      <div className="flex h-[70vh] items-center justify-center">
        <SpinnerMemo />
      </div>
    );
  }

  return (
    <div className="bg-background min-h-screen">
      {/* Header */}
      <div className="bg-background/95 supports-[backdrop-filter]:bg-background/60 sticky top-0 z-10 border-b backdrop-blur">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div>
                <h1 className="text-2xl font-bold">Edit Menu</h1>
                <p className="text-muted-foreground text-sm">Manage dish visibility and availability</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto space-y-6 px-4 py-6">
        {/* Statistics Cards */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-muted-foreground text-sm font-medium">Total Dishes</p>
                  <p className="text-3xl font-bold">{stats.total}</p>
                </div>
                <LayoutGrid className="text-muted-foreground h-8 w-8" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-muted-foreground text-sm font-medium">Visible</p>
                  <p className="text-3xl font-bold text-green-600">{stats.visible}</p>
                </div>
                <Eye className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-muted-foreground text-sm font-medium">Available</p>
                  <p className="text-3xl font-bold text-blue-600">{stats.available}</p>
                </div>
                <CheckCircle2 className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col gap-3 sm:flex-row">
          <div className="relative flex-1">
            <Search className="text-muted-foreground absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2" />
            <Input placeholder="Search dishes..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-9" />
          </div>
          <div className="flex gap-2">
            {(['all', 'visible', 'available'] as const).map((f) => (
              <Button key={f} variant={filter === f ? 'default' : 'outline'} onClick={() => setFilter(f)} disabled={isSaving} size="sm">
                {f === 'all' && (
                  <>
                    <List className="mr-2 h-4 w-4" />
                    All
                  </>
                )}
                {f === 'visible' && (
                  <>
                    <Eye className="mr-2 h-4 w-4" />
                    Visible
                  </>
                )}
                {f === 'available' && (
                  <>
                    <CheckCircle2 className="mr-2 h-4 w-4" />
                    Available
                  </>
                )}
              </Button>
            ))}
          </div>
        </div>

        {/* Progress Bar */}
        {isSaving && (
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium">Saving changes...</span>
                  <span className="text-muted-foreground">{progress}%</span>
                </div>
                <Progress value={progress} className="h-2" />
                <p className="text-muted-foreground text-xs">
                  Updating {Object.keys(editedDishes).length} dish{Object.keys(editedDishes).length !== 1 ? 'es' : ''}
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Categories Accordion */}
        <Accordion type="multiple" className="space-y-3">
          {(allCategories || []).map((cat) => {
            const dishes = groupedByCategory[cat._id] || [];
            if (dishes.length === 0) return null;

            return (
              <AccordionItem key={cat._id} value={cat._id} ref={(el) => (categoryRefs.current[cat._id] = el)} className="bg-card rounded-lg border">
                <AccordionTrigger className="px-4 py-3 hover:no-underline">
                  <div className="flex w-full items-center justify-between pr-4">
                    <span className="text-lg font-semibold">{cat.name}</span>
                    <Badge variant="secondary">{dishes.length} dishes</Badge>
                  </div>
                </AccordionTrigger>

                <AccordionContent className="px-4 pb-4">
                  <div className="space-y-2">
                    {dishes.map((dish) => (
                      <div
                        key={dish._id}
                        className={cn(
                          'flex items-center justify-between rounded-lg border p-4 transition-all',
                          !dish.visibility && 'opacity-60',
                          editedDishes[dish._id] && 'border-primary bg-primary/5 shadow-sm',
                        )}
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <p className="font-medium">{dish.name}</p>
                            {editedDishes[dish._id] && (
                              <Badge variant="outline" className="text-xs">
                                Modified
                              </Badge>
                            )}
                          </div>
                          <p className="text-muted-foreground text-sm">₹{dish.price}</p>
                        </div>

                        <div className="flex items-center gap-6">
                          <div className="flex items-center gap-2">
                            <Eye className={cn('h-4 w-4', dish.visibility ? 'text-green-600' : 'text-muted-foreground')} />
                            <span className="min-w-[60px] text-xs font-medium">Visible</span>
                            <Switch checked={dish.visibility} onCheckedChange={() => handleLocalToggle(dish, 'visibility')} disabled={isSaving} />
                          </div>
                          <div className="flex items-center gap-2">
                            <CheckCircle2 className={cn('h-4 w-4', dish.availability ? 'text-blue-600' : 'text-muted-foreground')} />
                            <span className="min-w-[60px] text-xs font-medium">Available</span>
                            <Switch checked={dish.availability} onCheckedChange={() => handleLocalToggle(dish, 'availability')} disabled={isSaving} />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </AccordionContent>
              </AccordionItem>
            );
          })}
        </Accordion>

        {/* Empty State */}
        {filteredDishes.length === 0 && (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <XCircle className="text-muted-foreground mb-4 h-12 w-12" />
              <h3 className="mb-2 text-lg font-semibold">No dishes found</h3>
              <p className="text-muted-foreground text-center text-sm">
                {searchTerm ? 'Try adjusting your search term' : 'No dishes match the selected filter'}
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Floating Save Button */}
      {Object.keys(editedDishes).length > 0 && (
        <div className="fixed bottom-6 left-1/2 z-20 -translate-x-1/2">
          <Button onClick={handleSaveChanges} disabled={isSaving} size="lg" className="shadow-lg">
            <Save className="mr-2 h-5 w-5" />
            {isSaving ? 'Saving...' : `Save ${Object.keys(editedDishes).length} Change${Object.keys(editedDishes).length !== 1 ? 's' : ''}`}
          </Button>
        </div>
      )}
    </div>
  );
};

const DishBatchManager = memo(MemoDishBatchManager);
export default DishBatchManager;
