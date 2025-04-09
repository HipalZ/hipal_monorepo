import { useState, useEffect, useMemo } from "react"
import LoadingSpinner from "@/components/atom/loadingSpinner"
import BottomButton from "@/components/atom/bottomButton"

import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { Button } from "@/components/ui/button"
import { ChevronDown, ChevronUp } from "lucide-react"

import { useEditDishesStore } from "@/components/store/useQuickMenu"
import { useDishesStore } from "@/components/store/useDishesStore"

import { useDishes, useLinkedDishes, useUpdateDish } from "@/hooks/useDish"

const QuickMenu = () => {
  const { dishes } = useDishesStore((s) => ({ dishes: s.dishes }))
  const { isLoading, refetch } = useDishes()
  const { data: linkedCategories, refetchLinked } = useLinkedDishes()
  const { isPending, mutateAsync } = useUpdateDish()

  const allDishes = useMemo(() => {
    const linkedDishes = linkedCategories?.flatMap((cat) => cat.dishIds) || []
    return [...dishes, ...linkedDishes]
  }, [dishes, linkedCategories])

  const { unlinkedDishes } = useMemo(() => {
    const unlinked = allDishes.filter((dish) => !dish?.categoryIds || dish?.categoryIds.length === 0)
    return { unlinkedDishes: unlinked }
  }, [allDishes])

  const filteredLinkedCategories = useMemo(() => {
    return (
      linkedCategories
        ?.map((category) => ({
          ...category,
          dishIds: category.dishIds.filter((dish) => allDishes.some((ad) => ad._id === dish._id)),
        }))
        .filter((category) => category.dishIds.length > 0) || []
    )
  }, [linkedCategories, allDishes])

  const { editedDishes, addEditedDish, clearEditedDishes } = useEditDishesStore()
  const [expandedDishes, setExpandedDishes] = useState<Set<string>>(new Set())

  const [duplicateDishIds, setDuplicateDishIds] = useState<Set<string>>(new Set())
  useEffect(() => {
    const nameMap: Record<string, string[]> = {}
    for (const dish of unlinkedDishes) {
      const edit = editedDishes.find((ed) => ed._id === dish._id)
      const finalName = edit?.name ?? dish.name
      if (!nameMap[finalName]) {
        nameMap[finalName] = []
      }
      nameMap[finalName].push(dish._id)
    }

    for (const cat of filteredLinkedCategories) {
      for (const dish of cat.dishIds) {
        const edit = editedDishes.find((ed) => ed._id === dish._id)
        const finalName = edit?.name ?? dish.name
        if (!nameMap[finalName]) {
          nameMap[finalName] = []
        }
        nameMap[finalName].push(dish._id)
      }
    }

    const duplicates = new Set<string>()
    Object.keys(nameMap).forEach((dishName) => {
      const dishIds = nameMap[dishName]
      if (dishIds.length > 1) {
        dishIds.forEach((id) => duplicates.add(id))
      }
    })

    setDuplicateDishIds(duplicates)
  }, [unlinkedDishes, filteredLinkedCategories, editedDishes])

  const handleEditField = (
    dishId: string,
    fieldName: "name" | "price" | "availability",
    value: string | number | boolean,
  ) => {
    addEditedDish({ _id: dishId, [fieldName]: value })
  }

  const handleEditPortion = (dishId: string, portionId: string, field: "name" | "price", value: string | number) => {
    // Find the dish in edited dishes or original dishes
    const editedDish = editedDishes.find((dish) => dish._id === dishId)
    const originalDish = allDishes.find((dish) => dish._id === dishId)

    if (!originalDish) return

    // Get current portions (either from edited dish or original dish)
    const currentPortions = editedDish?.portions || originalDish.portions || []

    // Create a new array of portions with the updated value
    const updatedPortions = currentPortions.map((portion) => {
      if (portion._id === portionId) {
        return {
          ...portion,
          [field]: field === "price" ? Number(value) : value,
        }
      }
      return portion
    })

    // Add the updated dish with new portions to edited dishes
    addEditedDish({
      _id: dishId,
      portions: updatedPortions,
    })
  }

  const toggleDishExpand = (dishId: string) => {
    setExpandedDishes((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(dishId)) {
        newSet.delete(dishId)
      } else {
        newSet.add(dishId)
      }
      return newSet
    })
  }

  const handleSaveChoice = async () => {
    try {
      for (const dishPayload of editedDishes) {
        await mutateAsync(dishPayload)
      }
      refetch()
      refetchLinked()
      clearEditedDishes()
      console.log("All updated dishes have been processed.")
    } catch (err) {
      console.error("Error updating dishes:", err)
    }
  }

  if (isLoading || isPending) {
    return <LoadingSpinner />
  }

  const renderDishRow = (dish: any, isDuplicate: boolean) => {
    const edit = editedDishes.find((ed) => ed._id === dish._id)
    const finalName = edit?.name ?? dish.name
    const finalPrice = edit?.price ?? dish.price
    const finalAvail = edit?.availability ?? dish.availability
    const isExpanded = expandedDishes.has(dish._id)
    const portions = edit?.portions || dish.portions || []

    return (
      <>
        <tr key={`${dish._id}-main`} className="border-b">
          <td className="p-2">
            <div className="flex items-center">
              <Input
                type="text"
                value={finalName}
                onChange={(e) => handleEditField(dish._id, "name", e.target.value)}
                className={"w-full " + (isDuplicate ? "border-red-500 text-red-500 focus-visible:ring-red-500" : "")}
              />
              {portions && portions.length > 0 && (
                <Button variant="ghost" size="sm" className="ml-2" onClick={() => toggleDishExpand(dish._id)}>
                  {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </Button>
              )}
            </div>
          </td>
          <td className="p-2">
            <Input
              type="number"
              value={finalPrice}
              onChange={(e) => handleEditField(dish._id, "price", Number(e.target.value))}
              className="w-full"
            />
          </td>
          <td className="p-2">
            <Switch
              checked={finalAvail}
              onCheckedChange={(checked) => handleEditField(dish._id, "availability", checked)}
              className={finalAvail ? "data-[state=checked]:bg-green-500" : "data-[state=unchecked]:bg-red-500"}
            />
          </td>
        </tr>
        {isExpanded && portions && portions.length > 0 && (
          <>
            <tr className="bg-gray-50">
              <td colSpan={3} className="p-2 text-xs font-medium text-gray-500">
                Portions
              </td>
            </tr>
            {portions.map((portion: any) => (
              <tr key={`${dish._id}-${portion._id}`} className="border-b bg-gray-50 last:border-0">
                <td className="p-2 pl-6">
                  <Input
                    type="text"
                    value={portion.name}
                    onChange={(e) => handleEditPortion(dish._id, portion._id, "name", e.target.value)}
                    className="w-full text-sm"
                  />
                </td>
                <td className="p-2">
                  <Input
                    type="number"
                    value={portion.price}
                    onChange={(e) => handleEditPortion(dish._id, portion._id, "price", Number(e.target.value))}
                    className="w-full text-sm"
                  />
                </td>
                <td className="p-2 text-xs">
                  {portion.default ? (
                    <span className="px-2 py-1 text-blue-800 bg-blue-100 rounded-full">Default</span>
                  ) : null}
                </td>
              </tr>
            ))}
          </>
        )}
      </>
    )
  }

  return (
    <div className=" space-y-6 pb-[7rem]">
      <h1 className="text-xl font-bold">Quick Menu Edit</h1>

      {/* Unlinked Dishes (if any) */}
      {unlinkedDishes && unlinkedDishes.length > 0 && (
        <div className="space-y-2">
          <h2 className="ml-4 text-lg font-semibold opacity-50">Unlinked Dishes</h2>

          {/* Table for Unlinked Dishes */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm border border-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="w-[70%] p-3 text-left">Dish Name</th>
                  <th className="w-[20%] p-3 text-left">Price</th>
                  <th className="w-[10%] p-3 text-left">Availability</th>
                </tr>
              </thead>
              <tbody>
                {unlinkedDishes.map((dish) => {
                  const isDuplicate = duplicateDishIds.has(dish._id)
                  return renderDishRow(dish, isDuplicate)
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Linked Dishes by Category */}
      <section className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {filteredLinkedCategories.map((category) => {
          if (!category.dishIds || category.dishIds.length === 0) return null

          return (
            <div key={category._id} className="space-y-2">
              <h2 className="text-lg font-semibold opacity-50">{category.name}</h2>
              <div className="overflow-x-auto">
                <table className="w-full text-sm border border-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="w-[70%] p-3 text-left">Dish Name</th>
                      <th className="w-[20%] p-3 text-left">Price</th>
                      <th className="w-[10%] p-3 text-left">Availability</th>
                    </tr>
                  </thead>
                  <tbody>
                    {category.dishIds.map((dish: any) => {
                      const isDuplicate = duplicateDishIds.has(dish._id)
                      return renderDishRow(dish, isDuplicate)
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )
        })}
      </section>

      {editedDishes.length > 0 && (
        <BottomButton
          fixed
          buttons={[
            {
              text: "Save",
              onClick: handleSaveChoice,
              type: "button",
            },
          ]}
        />
      )}
    </div>
  )
}

export default QuickMenu

