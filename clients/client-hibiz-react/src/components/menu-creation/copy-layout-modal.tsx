import { memo, useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { useGetAllLayouts } from "@/hooks/useMenuLayout";
import useBusinessData from "@/components/store/useBusinessData";
import { Loader2, Copy } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { FaLayerGroup, FaThList } from "react-icons/fa";
import { cn } from "@/lib/utils";

interface CopyLayoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (layoutId: string) => void;
}

const CopyLayoutModal = memo(
  ({ isOpen, onClose, onSelect }: CopyLayoutModalProps) => {
    const businessId = useBusinessData((s) => s.businessData?._id) || "";
    const { allMenuLayouts, isLoading } = useGetAllLayouts(businessId);
    const [selectedLayoutId, setSelectedLayoutId] = useState<string>("");

    // Reset selection when modal opens
    useEffect(() => {
      if (isOpen) {
        setSelectedLayoutId("");
      }
    }, [isOpen]);

    const handleSelect = () => {
      if (selectedLayoutId) {
        onSelect(selectedLayoutId);
        onClose();
      }
    };

    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-[500px] max-h-[80vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Copy className="w-5 h-5" />
              Copy Menu Layout
            </DialogTitle>
          </DialogHeader>

          {isLoading ? (
            <div className="flex items-center justify-center p-8">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
              <span className="ml-2">Loading menu layouts...</span>
            </div>
          ) : !allMenuLayouts?.data || allMenuLayouts.data.length === 0 ? (
            <div className="p-8 text-center">
              <p>No menu layouts found to copy from.</p>
            </div>
          ) : (
            <>
              <div className="py-4">
                <p className="mb-4 text-sm text-gray-500">
                  Select a menu layout to copy. This will copy the menu
                  structure, layouts, and colors.
                </p>

                <ScrollArea className="h-[300px] pr-4">
                  <RadioGroup
                    value={selectedLayoutId}
                    onValueChange={setSelectedLayoutId}
                  >
                    {allMenuLayouts.data.map((layout) => {
                      const primaryColor = layout.primaryColor || "#641626";
                      return (
                        <div
                          key={layout._id}
                          className={cn(
                            "mb-3 p-3 rounded-lg border transition-all",
                            selectedLayoutId === layout._id
                              ? `border-${primaryColor} bg-${primaryColor}/5`
                              : "border-gray-200 hover:border-gray-300",
                          )}
                        >
                          <div className="flex items-start">
                            <RadioGroupItem
                              value={layout._id}
                              id={layout._id}
                              className="mt-1"
                            />
                            <div className="flex-1 ml-3">
                              <Label
                                htmlFor={layout._id}
                                className="flex items-center cursor-pointer"
                              >
                                <div
                                  className="flex items-center justify-center w-8 h-8 mr-3 rounded-lg"
                                  style={{
                                    background: `linear-gradient(135deg, ${primaryColor}, ${primaryColor}80)`,
                                  }}
                                >
                                  {layout.menuType === 1 ? (
                                    <FaLayerGroup className="text-sm text-white" />
                                  ) : (
                                    <FaThList className="text-sm text-white" />
                                  )}
                                </div>
                                <span
                                  className="font-medium"
                                  style={{ color: primaryColor }}
                                >
                                  {layout.name}
                                </span>
                              </Label>

                              <div className="mt-2 pl-11">
                                <div className="grid grid-cols-2 gap-2 text-xs">
                                  <div className="flex items-center">
                                    <span className="text-gray-500">
                                      Menu Type:
                                    </span>
                                    <span className="ml-1 font-medium">
                                      {layout.menuType === 1
                                        ? "Main → Sub → Dishes"
                                        : "Sub → Dishes"}
                                    </span>
                                  </div>
                                  <div className="flex items-center">
                                    <span className="text-gray-500">
                                      Category Layout:
                                    </span>
                                    <span className="ml-1 font-medium">
                                      {layout.categoryLayout === 1
                                        ? "Edge"
                                        : "Classic"}
                                    </span>
                                  </div>
                                  <div className="flex items-center">
                                    <span className="text-gray-500">
                                      Card Layout:
                                    </span>
                                    <span className="ml-1 font-medium">
                                      {layout.cardLayout === 1
                                        ? "Grid"
                                        : "Horizontal"}
                                    </span>
                                  </div>
                                  <div className="flex items-center">
                                    <span className="text-gray-500">
                                      Status:
                                    </span>
                                    <span
                                      className={cn(
                                        "ml-1 font-medium",
                                        layout.isActive
                                          ? "text-green-600"
                                          : "text-gray-500",
                                      )}
                                    >
                                      {layout.isActive ? "Active" : "Inactive"}
                                    </span>
                                  </div>
                                </div>
                                <div className="flex items-center mt-2">
                                  <span className="text-xs text-gray-500">
                                    Colors:
                                  </span>
                                  <div className="flex gap-2 ml-2">
                                    <div
                                      className="w-4 h-4 rounded-full"
                                      style={{
                                        backgroundColor: layout.primaryColor,
                                      }}
                                    ></div>
                                    <div
                                      className="w-4 h-4 rounded-full"
                                      style={{
                                        backgroundColor: layout.secondaryColor,
                                      }}
                                    ></div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </RadioGroup>
                </ScrollArea>
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={onClose}>
                  Cancel
                </Button>
                <Button
                  onClick={handleSelect}
                  disabled={!selectedLayoutId}
                  className="gap-2"
                >
                  <Copy className="w-4 h-4" />
                  Copy Selected Layout
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    );
  },
);

CopyLayoutModal.displayName = "CopyLayoutModal";
export default CopyLayoutModal;
