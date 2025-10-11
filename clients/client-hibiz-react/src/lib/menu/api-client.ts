import { apiRpc } from "@hi/common";

export interface ApiResponse<T = any> {
  data?: T;
  err?: boolean;
  message?: string;
}

/**
 * Create a category using the real API
 * Based on the useSaveCategory hook pattern
 */
export async function createCategory(payload: any): Promise<ApiResponse> {
  try {
    const res = await apiRpc.categories.$post({
      json: payload,
    });
    const data = await res.json();
    return data;
  } catch (error) {
    console.error("[v0] Category creation error:", error);
    return {
      err: true,
      message:
        error instanceof Error ? error.message : "Failed to create category",
    };
  }
}

/**
 * Create a dish using the real API
 * Based on the postDishData function pattern
 */
export async function createDish(filteredPayload: any): Promise<ApiResponse> {
  try {
    const dishResponse = await apiRpc.dishes.$post({
      json: filteredPayload,
    });
    const data = await dishResponse.json();
    return { data, dishResponse };
  } catch (error) {
    console.error("[v0] Dish creation error:", error);
    return {
      err: true,
      message: error instanceof Error ? error.message : "Failed to create dish",
    };
  }
}

/**
 * Create multiple categories and return their IDs
 */
export async function createCategoriesAPI(categories: any[]): Promise<{
  success: boolean;
  idMap: Record<string, string>;
  errors: string[];
}> {
  const idMap: Record<string, string> = {};
  const errors: string[] = [];

  for (const category of categories) {
    const result = await createCategory(category);

    if (result.err) {
      errors.push(
        `Failed to create category "${category.name}": ${result.message}`,
      );
    } else if (result.data?.id) {
      // Map the category name to its DB ID
      idMap[category.name] = result.data.id;
    }
  }

  return {
    success: errors.length === 0,
    idMap,
    errors,
  };
}

/**
 * Create multiple dishes
 */
export async function createDishesAPI(
  dishes: any[],
): Promise<{ success: boolean; dishIds: string[]; errors: string[] }> {
  const dishIds: string[] = [];
  const errors: string[] = [];

  for (const dish of dishes) {
    const result = await createDish(dish);

    if (result.err) {
      errors.push(`Failed to create dish "${dish.name}": ${result.message}`);
    } else if (result.data?.id) {
      dishIds.push(result.data.id);
    }
  }

  return {
    success: errors.length === 0,
    dishIds,
    errors,
  };
}
