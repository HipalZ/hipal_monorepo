import { useState, useEffect, useMemo } from "react";
import LoadingSpinner from "@/components/atom/loadingSpinner";
import BottomButton from "@/components/atom/bottomButton";

import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";

import { useEditDishesStore } from "@/components/store/useQuickMenu";
import { useDishesStore } from "@/components/store/useDishesStore";

import { putDishData, useDishes, useLinkedDishes, useUpdateDish } from "@/hooks/useDish";

const QuickMenu = () => {
    const { dishes } = useDishesStore((s) => ({ dishes: s.dishes }));
    const { isLoading, refetch } = useDishes();
    const { data: linkedCategories, refetchLinked } = useLinkedDishes();
    const { isPending, mutateAsync } = useUpdateDish();

    const allDishes = useMemo(() => {
        const linkedDishes = linkedCategories?.flatMap((cat) => cat.dishIds) || [];
        return [...dishes, ...linkedDishes];
    }, [dishes, linkedCategories]);

    const { unlinkedDishes } = useMemo(() => {
        const unlinked = allDishes.filter(
            (dish) => !dish?.categoryIds || dish?.categoryIds.length === 0
        );
        return { unlinkedDishes: unlinked };
    }, [allDishes]);

    const filteredLinkedCategories = useMemo(() => {
        return (
            linkedCategories
                ?.map((category) => ({
                    ...category,
                    dishIds: category.dishIds.filter((dish) =>
                        allDishes.some((ad) => ad._id === dish._id)
                    ),
                }))
                .filter((category) => category.dishIds.length > 0) || []
        );
    }, [linkedCategories, allDishes]);

    const { editedDishes, addEditedDish, clearEditedDishes } = useEditDishesStore();

    const [duplicateDishIds, setDuplicateDishIds] = useState<Set<string>>(new Set());
    useEffect(() => {
        const nameMap: Record<string, string[]> = {};
        for (const dish of unlinkedDishes) {
            const edit = editedDishes.find((ed) => ed._id === dish._id);
            const finalName = edit?.name ?? dish.name;
            if (!nameMap[finalName]) {
                nameMap[finalName] = [];
            }
            nameMap[finalName].push(dish._id);
        }

        for (const cat of filteredLinkedCategories) {
            for (const dish of cat.dishIds) {
                const edit = editedDishes.find((ed) => ed._id === dish._id);
                const finalName = edit?.name ?? dish.name;
                if (!nameMap[finalName]) {
                    nameMap[finalName] = [];
                }
                nameMap[finalName].push(dish._id);
            }
        }

        const duplicates = new Set<string>();
        Object.keys(nameMap).forEach((dishName) => {
            const dishIds = nameMap[dishName];
            if (dishIds.length > 1) {
                dishIds.forEach((id) => duplicates.add(id));
            }
        });

        setDuplicateDishIds(duplicates);
    }, [unlinkedDishes, filteredLinkedCategories, editedDishes]);

    const handleEditField = (
        dishId: string,
        fieldName: "name" | "price" | "availability",
        value: string | number | boolean
    ) => {
        addEditedDish({ _id: dishId, [fieldName]: value });
    };

    const handleSaveChoice = async () => {
        try {
            // Iterate over each dish edit in `editedDishes`
            for (const dishPayload of editedDishes) {
                // Send one-by-one payload to your API
                await mutateAsync(dishPayload);
            }
            refetch();
            refetchLinked();
            clearEditedDishes();
            console.log("All updated dishes have been processed.");
        } catch (err) {
            console.error("Error updating dishes:", err);
        }
    };

    if (isLoading || isPending) {
        return <LoadingSpinner />;
    }

    return (
        <div className="p-4 space-y-6 pb-[7rem]">
            <h1 className="text-xl font-bold">Quick Menu Edit</h1>

            {/* Unlinked Dishes (if any) */}
            {unlinkedDishes && unlinkedDishes.length > 0 && (
                <div className="space-y-2">
                    <h2 className="text-lg font-semibold opacity-50">Unlinked Dishes</h2>

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
                                    const edit = editedDishes.find((ed) => ed._id === dish._id);
                                    const finalName = edit?.name ?? dish.name;
                                    const finalPrice = edit?.price ?? dish.price;
                                    const finalAvail = edit?.availability ?? dish.availability;
                                    const isDuplicate = duplicateDishIds.has(dish._id);

                                    return (
                                        <tr key={dish._id} className="border-b last:border-0">
                                            <td className="p-2">
                                                <Input
                                                    type="text"
                                                    value={finalName}
                                                    onChange={(e) =>
                                                        handleEditField(dish._id, "name", e.target.value)
                                                    }
                                                    className={
                                                        "w-full " +
                                                        (isDuplicate
                                                            ? "border-red-500 text-red-500 focus-visible:ring-red-500"
                                                            : "")
                                                    }
                                                />
                                            </td>
                                            <td className="p-2">
                                                <Input
                                                    type="number"
                                                    value={finalPrice}
                                                    onChange={(e) =>
                                                        handleEditField(
                                                            dish._id,
                                                            "price",
                                                            Number(e.target.value)
                                                        )
                                                    }
                                                    className="w-full"
                                                />
                                            </td>
                                            <td className="p-2">
                                                <Switch
                                                    checked={finalAvail}
                                                    onCheckedChange={(checked) =>
                                                        handleEditField(dish._id, "availability", checked)
                                                    }
                                                    className={
                                                        finalAvail
                                                            ? "data-[state=checked]:bg-green-500"
                                                            : "data-[state=unchecked]:bg-red-500"
                                                    }
                                                />
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Linked Dishes by Category */}
            <section className="grid grid-cols-1 gap-4 lg:grid-cols-2">

                {filteredLinkedCategories.map((category) => {
                    if (!category.dishIds || category.dishIds.length === 0) return null;

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
                                            const edit = editedDishes.find((ed) => ed._id === dish._id);
                                            const finalName = edit?.name ?? dish.name;
                                            const finalPrice = edit?.price ?? dish.price;
                                            const finalAvail = edit?.availability ?? dish.availability;
                                            const isDuplicate = duplicateDishIds.has(dish._id);

                                            return (
                                                <tr key={dish._id} className="border-b last:border-0">
                                                    <td className="p-2">
                                                        <Input
                                                            type="text"
                                                            value={finalName}
                                                            onChange={(e) =>
                                                                handleEditField(dish._id, "name", e.target.value)
                                                            }
                                                            className={
                                                                "w-full " +
                                                                (isDuplicate
                                                                    ? "border-red-500 text-red-500 focus-visible:ring-red-500"
                                                                    : "")
                                                            }
                                                        />
                                                    </td>
                                                    <td className="p-2">
                                                        <Input
                                                            type="number"
                                                            value={finalPrice}
                                                            onChange={(e) =>
                                                                handleEditField(
                                                                    dish._id,
                                                                    "price",
                                                                    Number(e.target.value)
                                                                )
                                                            }
                                                            className="w-full"
                                                        />
                                                    </td>
                                                    <td className="p-2">
                                                        <Switch
                                                            checked={finalAvail}
                                                            onCheckedChange={(checked) =>
                                                                handleEditField(dish._id, "availability", checked)
                                                            }
                                                            className={
                                                                finalAvail
                                                                    ? "data-[state=checked]:bg-green-500"
                                                                    : "data-[state=unchecked]:bg-red-500"
                                                            }
                                                        />
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    );
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
    );
};

export default QuickMenu;
