import type { FC } from "react";
import {
  Plus,
  ChevronDown,
  Type,
  ImageIcon,
  MessageSquare,
  List,
  Heading1,
  Heading2,
  Baseline,
  Pilcrow,
  Calendar,
  CheckCircle,
  CheckSquare,
  ChevronDownSquare,
  ToggleRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuPortal,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { ContentType } from "./types";

export const AddContentMenu: FC<{
  onAdd: (type: ContentType) => void;
  contentCount: number;
}> = ({ onAdd, contentCount }) => {
  const isAddDisabled = contentCount >= 8;
  const menuItems = {
    Text: {
      icon: Type,
      items: {
        "large-heading": { icon: Heading1, label: "Large heading" },
        "small-heading": { icon: Heading2, label: "Small heading" },
        "body-text": { icon: Pilcrow, label: "Body" },
        caption: { icon: Baseline, label: "Caption" },
      },
    },
    Media: {
      icon: ImageIcon,
      items: { image: { icon: ImageIcon, label: "Image" } },
    },
    "Text answer": {
      icon: MessageSquare,
      items: {
        "short-answer": { icon: MessageSquare, label: "Short answer" },
        paragraph: { icon: Pilcrow, label: "Paragraph" },
        datepicker: { icon: Calendar, label: "Date picker" },
      },
    },
    Selection: {
      icon: List,
      items: {
        "single-choice": { icon: CheckCircle, label: "Single choice" },
        "multiple-choice": { icon: CheckSquare, label: "Multiple choice" },
        dropdown: { icon: ChevronDownSquare, label: "Drop-down" },
        "opt-in": { icon: ToggleRight, label: "Opt-in" },
      },
    },
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          className="mt-6 bg-white dark:bg-gray-950"
          disabled={isAddDisabled}
        >
          <Plus className="w-4 h-4 mr-2" />
          Add content
          <ChevronDown className="w-4 h-4 ml-2" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56">
        {Object.entries(menuItems).map(
          ([category, { icon: CategoryIcon, items }]) => (
            <DropdownMenuSub key={category}>
              <DropdownMenuSubTrigger>
                <CategoryIcon className="w-4 h-4 mr-2" />
                <span>{category}</span>
              </DropdownMenuSubTrigger>
              <DropdownMenuPortal>
                <DropdownMenuSubContent>
                  {Object.entries(items).map(
                    ([type, { icon: ItemIcon, label }]) => (
                      <DropdownMenuItem
                        key={type}
                        onSelect={() => onAdd(type as ContentType)}
                      >
                        <ItemIcon className="w-4 h-4 mr-2" />
                        {label}
                      </DropdownMenuItem>
                    ),
                  )}
                </DropdownMenuSubContent>
              </DropdownMenuPortal>
            </DropdownMenuSub>
          ),
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
