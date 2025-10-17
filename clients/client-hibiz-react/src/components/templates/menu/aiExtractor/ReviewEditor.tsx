import type {
  CanonicalDishType,
  CategoryDraft,
  DishDraft,
} from "../../../../lib/menu/types";
import { useExtractionStore } from "../../../store/useExtractionStore";

const DISH_TYPES: CanonicalDishType[] = [
  "VEG",
  "NON_VEG",
  "EGG",
  "VEGAN",
  "ALCOHOL",
  "NON_ALCOHOL",
  "GLUTEN_FREE",
  "MIX",
];

export function ReviewEditor() {
  const { draft, setDraft } = useExtractionStore((s) => ({
    draft: s.draft,
    setDraft: s.setDraft,
  }));
  const { categoriesDraft, dishesDraft } = draft;

  function updateCategoryName(tempId: string, name: string) {
    const next: CategoryDraft[] = categoriesDraft.map((c) =>
      c.tempId === tempId ? { ...c, name } : c,
    );
    setDraft({ categoriesDraft: next, dishesDraft });
  }

  function updateDish(tempId: string, patch: Partial<DishDraft>) {
    const next: DishDraft[] = dishesDraft.map((d) =>
      d.tempId === tempId ? { ...d, ...patch } : d,
    );
    setDraft({ categoriesDraft, dishesDraft: next });
  }

  return (
    <div className="grid grid-2">
      {/* Categories (rename only) */}
      <section className="card">
        <h3 className="title" style={{ fontSize: 16, marginBottom: 12 }}>
          Categories (rename only)
        </h3>
        <div className="scroll col">
          {categoriesDraft.map((cat) => (
            <div key={cat.tempId} className="row">
              <input
                className="input"
                style={{ flex: 1 }}
                value={cat.name}
                onChange={(e) => updateCategoryName(cat.tempId, e.target.value)}
              />
              <span className="small badge">{cat.tempId}</span>
            </div>
          ))}
          {categoriesDraft.length === 0 && (
            <p className="small">No categories detected.</p>
          )}
        </div>
      </section>

      {/* Dishes */}
      <section className="card">
        <h3 className="title" style={{ fontSize: 16, marginBottom: 12 }}>
          Dishes (name, price, types, portions, linking)
        </h3>

        <div className="scroll col">
          {dishesDraft.map((dish) => (
            <div
              key={dish.tempId}
              className="col"
              style={{
                border: "1px solid #e5e7eb",
                borderRadius: 8,
                padding: 12,
              }}
            >
              {/* Top row */}
              <div className="row" style={{ alignItems: "center" }}>
                <input
                  className="input"
                  style={{ flex: 3 }}
                  value={dish.name}
                  onChange={(e) =>
                    updateDish(dish.tempId, { name: e.target.value })
                  }
                />
                <input
                  className="input"
                  style={{ flex: 2 }}
                  type="number"
                  placeholder="Price"
                  value={dish.price ?? ""}
                  onChange={(e) =>
                    updateDish(dish.tempId, {
                      price: e.target.value ? Number(e.target.value) : null,
                    })
                  }
                />
                <select
                  className="input"
                  style={{ flex: 1 }}
                  value={dish.dishTypes[0] ?? "MIX"}
                  onChange={(e) =>
                    updateDish(dish.tempId, {
                      dishTypes: [e.target.value as CanonicalDishType],
                    })
                  }
                >
                  {DISH_TYPES.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>

              {/* Portions */}
              <div className="col">
                <div className="small" style={{ fontWeight: 600 }}>
                  Portions
                </div>
                {dish.portions.map((p, idx) => (
                  <div key={idx} className="row">
                    <input
                      className="input"
                      style={{ flex: 2 }}
                      value={p.name}
                      onChange={(e) => {
                        const portions = [...dish.portions];
                        portions[idx] = { ...p, name: e.target.value };
                        updateDish(dish.tempId, { portions });
                      }}
                    />
                    <input
                      className="input"
                      style={{ flex: 2 }}
                      type="number"
                      value={p.price}
                      onChange={(e) => {
                        const portions = [...dish.portions];
                        portions[idx] = { ...p, price: Number(e.target.value) };
                        updateDish(dish.tempId, { portions });
                      }}
                    />
                    <label className="row small" style={{ gap: 6 }}>
                      <input
                        type="checkbox"
                        checked={p.default}
                        onChange={(e) => {
                          const portions = dish.portions.map((pp, i) => ({
                            ...pp,
                            default: i === idx ? e.target.checked : false,
                          }));
                          updateDish(dish.tempId, { portions });
                        }}
                      />
                      Default
                    </label>
                  </div>
                ))}
                <div>
                  <button
                    className="btn small"
                    onClick={() =>
                      updateDish(dish.tempId, {
                        portions: [
                          ...dish.portions,
                          {
                            name: "Regular",
                            price: Number(dish.price ?? 0),
                            default: dish.portions.length === 0,
                            portionTypes: dish.dishTypes,
                          },
                        ],
                      })
                    }
                  >
                    + Add portion
                  </button>
                </div>
              </div>

              {/* Category linking */}
              <div className="col">
                <div
                  className="small"
                  style={{ fontWeight: 600, marginTop: 4 }}
                >
                  Linked Categories
                </div>
                <div className="row" style={{ flexWrap: "wrap", gap: 8 }}>
                  {dish.categoryRefs.map((ref, i) => (
                    <span key={ref + i} className="badge">
                      {ref}
                    </span>
                  ))}
                </div>
                <div className="row">
                  <input
                    className="input"
                    placeholder="Add category tempId (e.g., cat_xxx)"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        const val = (e.target as HTMLInputElement).value.trim();
                        if (!val) return;
                        const unique = Array.from(
                          new Set([...dish.categoryRefs, val]),
                        );
                        updateDish(dish.tempId, { categoryRefs: unique });
                        (e.target as HTMLInputElement).value = "";
                      }
                    }}
                  />
                  <button
                    className="btn"
                    onClick={() =>
                      updateDish(dish.tempId, { categoryRefs: [] })
                    }
                  >
                    Clear
                  </button>
                </div>
              </div>
            </div>
          ))}
          {dishesDraft.length === 0 && (
            <p className="small">No dishes detected.</p>
          )}
        </div>
      </section>
    </div>
  );
}
