import { useEffect, useState } from "react";
import { useMenuBuilderStore } from "@/lib/menu/store";
import { extractMenuFromFiles } from "@/lib/menu/ai-service";
import { createCategoriesAPI, createDishesAPI } from "@/lib/menu/api-client";
import { deduplicateCategories } from "@/lib/utils";
import { UploadStep } from "./upload-step";
import { ExtractionLoader } from "./extraction-loader";
import { FinalizeStep } from "./finalize-step";
import { SuccessModal } from "./success-modal";
import { ReviewStep } from "./review-step";
import { RefreshGuardModal } from "./refresh-gaurd-modal";
import { useParams } from "react-router-dom";

export default function AIMenuExtractor() {
  const {
    currentPhase,
    isLoading,
    error,
    hasUnsavedChanges,
    categoriesDraft,
    dishesDraft,
    setExtractResponse,
    setPhase,
    setLoading,
    setError,
    markUnsavedChanges,
    reset,
  } = useMenuBuilderStore();
  const { menuId, businessId } = useParams<{
    menuId: string;
    businessId: string;
  }>();

  const [showRefreshGuard, setShowRefreshGuard] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [finalizeStage, setFinalizeStage] = useState<
    "creating-categories" | "linking-dishes" | "complete"
  >("creating-categories");

  // Refresh guard
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges && currentPhase === "review") {
        e.preventDefault();
        e.returnValue = "";
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [hasUnsavedChanges, currentPhase]);

  const handleExtract = async (files: File[]) => {
    setLoading(true);
    setError(null);
    setPhase("extract");

    try {
      const response = await extractMenuFromFiles(files);
      setExtractResponse(response);
    } catch (err) {
      console.error("[v0] Extraction error:", err);
      setError(err instanceof Error ? err.message : "Failed to extract menu");
      setPhase("upload");
    } finally {
      setLoading(false);
    }
  };

  const handleProceed = async () => {
    setPhase("finalize");
    setFinalizeStage("creating-categories");

    try {
      // Step 1: Create categories
      const uniqueCategories = deduplicateCategories(categoriesDraft);
      const categoryPayloads = uniqueCategories.map((cat) => ({
        name: cat.name,
        hierarchy: "CHILD" as const,
        businessId,
        menuId,
      }));

      const {
        success: catSuccess,
        idMap,
        errors: catErrors,
      } = await createCategoriesAPI(categoryPayloads);

      if (!catSuccess) {
        throw new Error(`Category creation failed: ${catErrors.join(", ")}`);
      }

      // Step 2: Create dishes
      setFinalizeStage("linking-dishes");

      const dishPayloads = dishesDraft.map((dish) => {
        const categoryIds = dish.categoryRefs
          .map((tempId) => {
            const cat = categoriesDraft.find((c) => c.tempId === tempId);
            return cat ? idMap[cat.name] : null;
          })
          .filter(Boolean) as string[];

        return {
          name: dish.name,
          price: dish.price,
          visibility: dish.visibility,
          availability: dish.availability,
          dishTypes: dish.dishTypes,
          description: dish.description,
          categoryIds,
          portions: dish.portions,
        };
      });

      const { success: dishSuccess, errors: dishErrors } =
        await createDishesAPI(dishPayloads);

      if (!dishSuccess) {
        throw new Error(`Dish creation failed: ${dishErrors.join(", ")}`);
      }

      // Success!
      setFinalizeStage("complete");
      markUnsavedChanges(false);
      setTimeout(() => {
        setPhase("success");
        setShowSuccess(true);
      }, 1500);
    } catch (err) {
      console.error("[v0] Finalize error:", err);
      setError(err instanceof Error ? err.message : "Failed to save menu");
      setPhase("review");
    }
  };

  const handleGoToMenu = () => {
    // Navigate to menu page (implement your navigation logic)
    console.log("[v0] Navigate to menu");
    reset();
    setShowSuccess(false);
  };

  const handleAddMore = () => {
    reset();
    setShowSuccess(false);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-12">
        {/* Error Display */}
        {error && (
          <div className="max-w-3xl mx-auto mb-8 p-4 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive">
            <p className="font-semibold">Error</p>
            <p className="text-sm">{error}</p>
          </div>
        )}

        {/* Phase Rendering */}
        {currentPhase === "upload" && (
          <UploadStep onExtract={handleExtract} isLoading={isLoading} />
        )}

        {currentPhase === "extract" && isLoading && (
          <ExtractionLoader filesCount={1} />
        )}

        {currentPhase === "review" && <ReviewStep onProceed={handleProceed} />}

        {currentPhase === "finalize" && (
          <FinalizeStep
            stage={finalizeStage}
            categoriesCount={categoriesDraft.length}
            dishesCount={dishesDraft.length}
          />
        )}

        {/* Modals */}
        <RefreshGuardModal
          open={showRefreshGuard}
          onStay={() => setShowRefreshGuard(false)}
          onLeave={() => {
            reset();
            setShowRefreshGuard(false);
          }}
        />

        <SuccessModal
          open={showSuccess}
          categoriesCount={categoriesDraft.length}
          dishesCount={dishesDraft.length}
          onGoToMenu={handleGoToMenu}
          onAddMore={handleAddMore}
        />
      </div>
    </div>
  );
}
