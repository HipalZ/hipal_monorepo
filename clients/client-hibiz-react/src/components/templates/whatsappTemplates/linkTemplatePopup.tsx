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

  const handleTemplateChange = (serviceName: string, templateName: string) => {
    setLinkedTemplates((prev) => {
      const updatedTemplates = [...prev];
      const index = updatedTemplates.findIndex(
        (item) => item.serviceName === serviceName,
      );

      const templateId =
        allTemplates.find((template) => template.name === templateName)?.id ||
        "";

      if (index >= 0) {
        updatedTemplates[index] = {
          serviceName,
          businessId,
          templateId,
        };
      } else {
        updatedTemplates.push({
          serviceName,
          businessId,
          templateId,
        });
      }

      return updatedTemplates;
    });
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
              ? serviceNames.map((service: service) => (
                  <div
                    key={service.serviceName}
                    className="grid grid-cols-3 items-center gap-4"
                  >
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
                          <SelectItem key={template?.id} value={template?.name}>
                            {template?.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                ))
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
