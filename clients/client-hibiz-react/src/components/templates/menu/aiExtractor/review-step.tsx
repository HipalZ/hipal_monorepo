import { useState } from "react";
import { useMenuBuilderStore } from "@/lib/menu/store";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Pencil, Check, ArrowRight, Info } from "lucide-react";
import type { DishType } from "@/lib/menu/types";

interface ReviewStepProps {
  onProceed: () => void;
}

export function ReviewStep({ onProceed }: ReviewStepProps) {
  const {
    categoriesDraft,
    dishesDraft,
    extractResponse,
    updateCategoryDraft,
    updateDishDraft,
  } = useMenuBuilderStore();
  const [editingCat, setEditingCat] = useState<string | null>(null);
  const [editingDish, setEditingDish] = useState<string | null>(null);

  const stats = extractResponse?.review.stats;
  const notes = extractResponse?.review.notes || [];

  const dishTypeColors: Record<DishType, string> = {
    VEG: "bg-green-500/10 text-green-500 border-green-500/20",
    NON_VEG: "bg-red-500/10 text-red-500 border-red-500/20",
    EGG: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
    VEGAN: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
    ALCOHOL: "bg-purple-500/10 text-purple-500 border-purple-500/20",
    NON_ALCOHOL: "bg-blue-500/10 text-blue-500 border-blue-500/20",
    GLUTEN_FREE: "bg-orange-500/10 text-orange-500 border-orange-500/20",
    MIX: "bg-gray-500/10 text-gray-500 border-gray-500/20",
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-foreground mb-2">
          Review & Edit Your Menu
        </h2>
        <p className="text-muted-foreground">
          Make any changes before saving to your database
        </p>
      </div>

      {stats && (
        <div className="grid grid-cols-4 gap-4 mb-8">
          <Card className="p-4 bg-card border-border">
            <p className="text-sm text-muted-foreground mb-1">Categories</p>
            <p className="text-3xl font-bold text-foreground">
              {stats.categories}
            </p>
          </Card>
          <Card className="p-4 bg-card border-border">
            <p className="text-sm text-muted-foreground mb-1">Dishes</p>
            <p className="text-3xl font-bold text-foreground">{stats.dishes}</p>
          </Card>
          <Card className="p-4 bg-card border-border">
            <p className="text-sm text-muted-foreground mb-1">With Portions</p>
            <p className="text-3xl font-bold text-foreground">
              {stats.dishesWithPortions}
            </p>
          </Card>
          <Card className="p-4 bg-card border-border">
            <p className="text-sm text-muted-foreground mb-1">Missing Prices</p>
            <p className="text-3xl font-bold text-destructive">
              {stats.missingPrices}
            </p>
          </Card>
        </div>
      )}

      {notes.length > 0 && (
        <Card className="p-4 mb-8 bg-primary/5 border-primary/20">
          <div className="flex items-start gap-3">
            <Info className="w-5 h-5 text-primary mt-0.5" />
            <div>
              <p className="font-semibold text-foreground mb-2">Review Notes</p>
              <ul className="space-y-1 text-sm text-muted-foreground">
                {notes.map((note, i) => (
                  <li key={i}>• {note}</li>
                ))}
              </ul>
            </div>
          </div>
        </Card>
      )}

      <Tabs defaultValue="categories" className="mb-8">
        <TabsList className="bg-muted">
          <TabsTrigger value="categories">
            Categories ({categoriesDraft.length})
          </TabsTrigger>
          <TabsTrigger value="dishes">
            Dishes ({dishesDraft.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="categories" className="mt-6">
          <div className="grid gap-3">
            {categoriesDraft.map((cat) => (
              <Card key={cat.tempId} className="p-4 bg-card border-border">
                <div className="flex items-center gap-3">
                  {editingCat === cat.tempId ? (
                    <>
                      <Input
                        value={cat.name}
                        onChange={(e) =>
                          updateCategoryDraft(cat.tempId, {
                            name: e.target.value,
                          })
                        }
                        className="flex-1 bg-background"
                        autoFocus
                      />
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setEditingCat(null)}
                      >
                        <Check className="w-4 h-4" />
                      </Button>
                    </>
                  ) : (
                    <>
                      <p className="flex-1 font-semibold text-foreground">
                        {cat.name}
                      </p>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setEditingCat(cat.tempId)}
                      >
                        <Pencil className="w-4 h-4" />
                      </Button>
                    </>
                  )}
                </div>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="dishes" className="mt-6">
          <div className="grid gap-4">
            {dishesDraft.map((dish) => (
              <Card key={dish.tempId} className="p-5 bg-card border-border">
                {editingDish === dish.tempId ? (
                  <div className="space-y-4">
                    <Input
                      value={dish.name}
                      onChange={(e) =>
                        updateDishDraft(dish.tempId, { name: e.target.value })
                      }
                      className="bg-background font-semibold"
                      placeholder="Dish name"
                    />
                    <Input
                      type="number"
                      value={dish.price}
                      onChange={(e) =>
                        updateDishDraft(dish.tempId, {
                          price: Number.parseFloat(e.target.value),
                        })
                      }
                      className="bg-background"
                      placeholder="Price"
                    />
                    <Input
                      value={dish.description}
                      onChange={(e) =>
                        updateDishDraft(dish.tempId, {
                          description: e.target.value,
                        })
                      }
                      className="bg-background"
                      placeholder="Description (50-100 chars)"
                    />
                    <Button size="sm" onClick={() => setEditingDish(null)}>
                      <Check className="w-4 h-4 mr-2" />
                      Done
                    </Button>
                  </div>
                ) : (
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h4 className="font-semibold text-lg text-foreground">
                          {dish.name}
                        </h4>
                        <span className="text-lg font-bold text-secondary">
                          ₹{dish.price}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground mb-3">
                        {dish.description}
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {dish.dishTypes.map((type) => (
                          <Badge
                            key={type}
                            variant="outline"
                            className={dishTypeColors[type]}
                          >
                            {type}
                          </Badge>
                        ))}
                      </div>
                      {dish.portions.length > 1 && (
                        <div className="mt-3 flex gap-2">
                          {dish.portions.map((portion, i) => (
                            <Badge
                              key={i}
                              variant="secondary"
                              className="bg-muted"
                            >
                              {portion.name}: ₹{portion.price}
                              {portion.default && " (default)"}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setEditingDish(dish.tempId)}
                    >
                      <Pencil className="w-4 h-4" />
                    </Button>
                  </div>
                )}
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      <div className="flex justify-end">
        <Button
          onClick={onProceed}
          size="lg"
          className="px-8 bg-secondary hover:bg-secondary/90"
        >
          Proceed to Save
          <ArrowRight className="w-5 h-5 ml-2" />
        </Button>
      </div>
    </div>
  );
}
