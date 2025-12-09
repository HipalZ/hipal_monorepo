import { memo, useCallback } from "react";
import MemoizedHeader from "@/components/molecules/header";
import useMenuPageStore from "@/components/store/useMenuStorage";
import CreateAddon from "./createAddon";
import CreateChoice from "./addChoice";
import LinkItems from "../dish/[editDish]/linkItems";
import EditAddon from "./editAddon";
import { Button } from "@/components/ui/button";
import BulkAddonCsvUpload from "@/components/templates/menu/addonPage/BulkAddonUpload";

const MemoAddonForm = () => {
  const addOnToggle = useMenuPageStore((s) => s.addOnToggle);
  const addOnName = useMenuPageStore((s) => s.addOnName);
  const setAddOnToggle = useMenuPageStore((s) => s.setAddOnToggle);
  const setOpenMenu = useMenuPageStore((s) => s.setOpenMenu);
  const addOnId = useMenuPageStore((s) => s.addOnId);

  const goBack = useCallback(() => {
    if (addOnId !== "") {
      setAddOnToggle("EDIT_ADDON");
      return;
    }
    switch (addOnToggle) {
      case "ADD_ON":
        setOpenMenu(false);
        break;
      case "ADD_CHOICE":
        setAddOnToggle("ADD_ON");
        break;
      case "LINK_DISHES":
        setAddOnToggle("ADD_ON");
        break;
      case "EDIT_ADDON":
        setOpenMenu(false);
        break;
      case "BULK_UPLOAD":
        setAddOnToggle("ADD_ON");
        break;
      default:
        break;
    }
  }, [addOnToggle, addOnId, setAddOnToggle, setOpenMenu]);

  return (
    <>
      <header className="sticky top-0 z-10 w-full rounded-t-2xl bg-base-100">
        <MemoizedHeader
          title={addOnId !== "" ? `${addOnName}` : "Create Addon"}
          onBack={goBack}
        />
      </header>

      {addOnToggle === "ADD_ON" && (
        <>
          <CreateAddon />

          {/* Bulk upload entry point */}
          <section className="px-6 mt-6 mb-4">
            <div className="flex flex-col gap-2 rounded-2xl bg-muted/40 p-3">
              <p className="text-sm font-bold opacity-80">
                Want to add many add-ons at once?
              </p>
              <p className="text-xs text-muted-foreground">
                Use bulk upload to create multiple add-ons with choices from a
                CSV file.
              </p>
              <div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setAddOnToggle("BULK_UPLOAD" as any)}
                >
                  Bulk upload add-ons
                </Button>
              </div>
            </div>
          </section>
        </>
      )}

      {addOnToggle === "ADD_CHOICE" && <CreateChoice />}
      {addOnToggle === "LINK_DISHES" && <LinkItems />}
      {addOnToggle === "EDIT_ADDON" && <EditAddon />}
      {addOnToggle === "BULK_UPLOAD" && <BulkAddonCsvUpload />}
    </>
  );
};

const AddOnForm = memo(MemoAddonForm);
export default AddOnForm;
