import { useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useLinkTemplate, useServiceNames } from "@/hooks/useTemplates";
import { Label } from "@/components/ui/label";
import { useWhatsappTempStore } from "@/components/store/useWhatsappTempStore";
import useBusinessData from "@/components/store/useBusinessData";
import PopUp from "@/components/atom/popUp";
import { X } from "lucide-react";

type Props = {
  openLinkTemplatePopup: boolean;
  setOpenLinkTemplatePopup: (open: boolean) => void;
};

export type LinkedTemplate = {
  serviceName: string;
  businessId: string;
  templateId: string;
  buttonMappings?: Array<{
    index: number;
    target: "none" | "roomLink" | "chatLink" | "reviewLink";
  }>;
};

type service = {
  serviceName: string;
  isActive: boolean;
};

const LinkTemplatePopup = (props: Props) => {
  const { openLinkTemplatePopup, setOpenLinkTemplatePopup } = props;
  const { serviceNames = [] } = useServiceNames();
  const [linkedTemplates, setLinkedTemplates] = useState<LinkedTemplate[]>([]);
  const { allTemplates } = useWhatsappTempStore((s) => ({
    allTemplates: s.allTemplates,
  }));
  const { linkTemplate } = useLinkTemplate();
  const businessId = useBusinessData((s) => s.businessData?._id) || "";

  const formatServiceName = (name: string) => {
    return name
      .replace(/_/g, " ")
      .replace(/\b\w/g, (char) => char.toUpperCase());
  };

  const getTemplateUrlButtons = (templateName: string) => {
    const template = allTemplates.find((item) => item.name === templateName);
    const buttonsComponent = template?.components?.find(
      (component) => component.type === "BUTTONS",
    );

    return (
      buttonsComponent?.buttons
        ?.map((button, index) => ({ ...button, index }))
        .filter((button) => button.type === "URL") || []
    );
  };

  const getSelectedTemplateName = (serviceName: string) => {
    const linkedTemplate = linkedTemplates.find(
      (item) => item.serviceName === serviceName,
    );
    return (
      allTemplates.find(
        (template) => String(template.id) === String(linkedTemplate?.templateId),
      )?.name || ""
    );
  };

  const handleTemplateChange = (serviceName: string, templateName: string) => {
    setLinkedTemplates((prev) => {
      const updatedTemplates = [...prev];
      const index = updatedTemplates.findIndex(
        (item) => item.serviceName === serviceName,
      );

      const templateId =
        allTemplates.find((template) => template.name === templateName)?.id ||
        "";
      const urlButtons = getTemplateUrlButtons(templateName);
      const buttonMappings = urlButtons.map((button, index) => ({
        index: button.index,
        target:
          serviceName === "welcome" && index === 0
            ? ("roomLink" as const)
            : ("none" as const),
      }));

      if (index >= 0) {
        updatedTemplates[index] = {
          serviceName,
          businessId,
          templateId,
          buttonMappings,
        };
      } else {
        updatedTemplates.push({
          serviceName,
          businessId,
          templateId,
          buttonMappings,
        });
      }

      return updatedTemplates;
    });
  };

  const handleButtonMappingChange = (
    serviceName: string,
    buttonIndex: number,
    target: "none" | "roomLink" | "chatLink" | "reviewLink",
  ) => {
    setLinkedTemplates((prev) =>
      prev.map((item) => {
        if (item.serviceName !== serviceName) return item;

        const mappings = item.buttonMappings || [];
        const existingIndex = mappings.findIndex(
          (mapping) => mapping.index === buttonIndex,
        );
        const nextMappings = [...mappings];

        if (existingIndex >= 0) {
          nextMappings[existingIndex] = { index: buttonIndex, target };
        } else {
          nextMappings.push({ index: buttonIndex, target });
        }

        return {
          ...item,
          buttonMappings: nextMappings,
        };
      }),
    );
  };

  const handleSave = async () => {
    await linkTemplate(linkedTemplates);
  };

  const handleCloseEditModal = () => {
    setOpenLinkTemplatePopup(!openLinkTemplatePopup);
  };

  if (!serviceNames) return null;

  return (
    <PopUp
      hide
      width="w-[30rem] md:w-[40rem]"
      height="h-auto"
      show={openLinkTemplatePopup}
      onClose={handleCloseEditModal}
    >
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader className="flex flex-row items-start justify-between pb-2 space-y-0">
          <div className="flex flex-col space-y-1">
            <CardTitle>Link Services to Templates</CardTitle>
            <CardDescription>
              Select a template from the dropdown for each service.
            </CardDescription>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleCloseEditModal}
            aria-label="Close Edit Modal"
          >
            <X className="w-4 h-4" />
          </Button>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6">
            {Array.isArray(serviceNames)
              ? serviceNames.map((service: service) => {
                  const selectedTemplateName = getSelectedTemplateName(
                    service.serviceName,
                  );
                  const urlButtons = selectedTemplateName
                    ? getTemplateUrlButtons(selectedTemplateName)
                    : [];
                  const linkedTemplate = linkedTemplates.find(
                    (item) => item.serviceName === service.serviceName,
                  );

                  return (
                    <div
                      key={service.serviceName}
                      className="space-y-3 rounded-lg border border-gray-100 p-3"
                    >
                      <div className="grid grid-cols-3 items-center gap-4">
                        <Label htmlFor={service.serviceName}>
                          {formatServiceName(service.serviceName)}
                        </Label>
                        <Select
                          onValueChange={(value) =>
                            handleTemplateChange(service.serviceName, value)
                          }
                        >
                          <SelectTrigger
                            id={service.serviceName}
                            className="col-span-2"
                          >
                            <SelectValue placeholder="Select a template..." />
                          </SelectTrigger>
                          <SelectContent className="max-h-60 overflow-y-auto">
                            {allTemplates?.map((template) => (
                              <SelectItem
                                key={template?.id}
                                value={template?.name}
                              >
                                {template?.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      {urlButtons.length > 0 && (
                        <div className="ml-[33%] space-y-2 rounded-md bg-gray-50 p-3">
                          <p className="text-xs font-medium text-gray-500">
                            Map template URL buttons
                          </p>
                          {urlButtons.map((button) => {
                            const currentTarget =
                              linkedTemplate?.buttonMappings?.find(
                                (mapping) => mapping.index === button.index,
                              )?.target || "none";

                            return (
                              <div
                                key={`${service.serviceName}-${button.index}`}
                                className="grid grid-cols-2 items-center gap-3"
                              >
                                <div className="min-w-0">
                                  <p className="truncate text-sm font-medium text-gray-800">
                                    {button.text || `Button ${button.index + 1}`}
                                  </p>
                                  <p className="truncate text-xs text-gray-500">
                                    {button.url}
                                  </p>
                                </div>
                                <Select
                                  value={currentTarget}
                                  onValueChange={(value) =>
                                    handleButtonMappingChange(
                                      service.serviceName,
                                      button.index,
                                      value as
                                        | "none"
                                        | "roomLink"
                                        | "chatLink"
                                        | "reviewLink",
                                    )
                                  }
                                >
                                  <SelectTrigger>
                                    <SelectValue placeholder="Choose link" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="none">None</SelectItem>
                                    <SelectItem value="roomLink">
                                      Room link
                                    </SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })
              : null}
          </div>
        </CardContent>
        <CardFooter>
          <Button onClick={handleSave} className="w-full">
            Save Links
          </Button>
        </CardFooter>
      </Card>
    </PopUp>
  );
};

export default LinkTemplatePopup;
