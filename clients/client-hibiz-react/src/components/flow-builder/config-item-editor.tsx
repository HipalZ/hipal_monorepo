import { type ChangeEvent, useRef, type FC } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, Trash2, Plus, ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Switch } from "@/components/ui/switch";
import { contentConfig, shortAnswerSubTypes } from "./config";
import type { ContentComponent, Screen, ShortAnswerSubType } from "./types";
import { FieldWithCounter } from "./field-with-counter";

export const ContentItemEditor: FC<{
  item: ContentComponent;
  screen: Screen;
  onUpdate: (id: string, data: Partial<Screen>) => void;
}> = ({ item, screen, onUpdate }) => {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: item.id });
  const style = { transform: CSS.Transform.toString(transform), transition };

  const handleUpdateContent = (
    contentId: string,
    newData: Record<string, any>,
  ) => {
    const newContent = screen.content.map((c) =>
      c.id === contentId ? { ...c, data: { ...c.data, ...newData } } : c,
    );
    onUpdate(screen.id, { content: newContent });
  };

  const handleDeleteContent = (contentId: string) => {
    const newContent = screen.content.filter((c) => c.id !== contentId);
    onUpdate(screen.id, { content: newContent });
  };

  const config = contentConfig[item.type];
  const imageInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 300 * 1024) {
        alert("File is too large. Maximum size is 300kb.");
        e.target.value = "";
        return;
      }
      if (!["image/jpeg", "image/png"].includes(file.type)) {
        alert("Invalid file type. Please upload a JPEG or PNG image.");
        e.target.value = "";
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        handleUpdateContent(item.id, {
          src: reader.result as string,
          height: item.data.height || 400,
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleOptionChange = (index: number, value: string) => {
    const newOptions = [...(item.data.options || [])];
    newOptions[index] = value;
    handleUpdateContent(item.id, { options: newOptions });
  };

  const addOption = () => {
    const newOptions = [
      ...(item.data.options || []),
      `Option ${item.data.options.length + 1}`,
    ];
    handleUpdateContent(item.id, { options: newOptions });
  };

  const removeOption = (index: number) => {
    const newOptions = (item.data.options || []).filter(
      (_: any, i: number) => i !== index,
    );
    handleUpdateContent(item.id, { options: newOptions });
  };

  return (
    <div ref={setNodeRef} style={style}>
      <Accordion type="single" collapsible className="w-full">
        <AccordionItem
          value={item.id}
          className="bg-white dark:bg-gray-950 rounded-lg border"
        >
          <AccordionTrigger className="text-base font-semibold px-4">
            <div className="flex items-center gap-2">
              <button {...attributes} {...listeners} className="cursor-grab">
                <GripVertical className="w-5 h-5 text-gray-400" />
              </button>
              {config.label}
            </div>
          </AccordionTrigger>
          <AccordionContent className="px-4 pb-4 space-y-4">
            {[
              "large-heading",
              "small-heading",
              "body-text",
              "caption",
            ].includes(item.type) && (
              <FieldWithCounter
                id={`text-${item.id}`}
                label="Text"
                value={item.data.text}
                maxLength={80}
                isTextarea
                onChange={(e) =>
                  handleUpdateContent(item.id, { text: e.target.value })
                }
              />
            )}
            {item.type === "paragraph" && (
              <>
                <FieldWithCounter
                  id={`label-${item.id}`}
                  label=""
                  value={item.data.label}
                  maxLength={20}
                  onChange={(e) =>
                    handleUpdateContent(item.id, { label: e.target.value })
                  }
                />
                <FieldWithCounter
                  id={`instructions-${item.id}`}
                  label="Instructions · Optional"
                  value={item.data.instructions}
                  maxLength={80}
                  isTextarea
                  onChange={(e) =>
                    handleUpdateContent(item.id, {
                      instructions: e.target.value,
                    })
                  }
                />
              </>
            )}
            {item.type === "short-answer" && (
              <>
                <div className="space-y-1">
                  <Label>Type</Label>
                  <Select
                    value={item.data.subtype}
                    onValueChange={(value: ShortAnswerSubType) =>
                      handleUpdateContent(item.id, { subtype: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select input type" />
                    </SelectTrigger>
                    <SelectContent>
                      {shortAnswerSubTypes.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <FieldWithCounter
                  id={`label-${item.id}`}
                  label="Label"
                  value={item.data.label}
                  maxLength={20}
                  onChange={(e) =>
                    handleUpdateContent(item.id, { label: e.target.value })
                  }
                />
                <FieldWithCounter
                  id={`instructions-${item.id}`}
                  label="Instructions (Optional)"
                  value={item.data.instructions}
                  maxLength={80}
                  onChange={(e) =>
                    handleUpdateContent(item.id, {
                      instructions: e.target.value,
                    })
                  }
                />
              </>
            )}
            {["single-choice", "multiple-choice", "dropdown"].includes(
              item.type,
            ) && (
              <>
                <FieldWithCounter
                  id={`label-${item.id}`}
                  label="Label"
                  value={item.data.label}
                  maxLength={30}
                  onChange={(e) =>
                    handleUpdateContent(item.id, { label: e.target.value })
                  }
                />
                <div className="space-y-2">
                  <Label>Options</Label>
                  {(item.data.options || []).map(
                    (option: string, index: number) => (
                      <div
                        key={index?.toString()}
                        className="flex items-center gap-2"
                      >
                        <FieldWithCounter
                          id={`option-${item.id}-${index}`}
                          label=""
                          value={option}
                          maxLength={30}
                          onChange={(e) =>
                            handleOptionChange(index, e.target.value)
                          }
                        />
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-gray-500 hover:text-red-500"
                          onClick={() => removeOption(index)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    ),
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    className="bg-transparent"
                    onClick={addOption}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add option
                  </Button>
                </div>
              </>
            )}
            {item.type === "opt-in" && (
              <>
                <FieldWithCounter
                  id={`label-${item.id}`}
                  label="Label"
                  value={item.data.label}
                  maxLength={300}
                  isTextarea
                  onChange={(e) =>
                    handleUpdateContent(item.id, { label: e.target.value })
                  }
                />
                <div className="space-y-1">
                  <Label>Read more link · Optional</Label>
                  <Button variant="outline" className="w-full bg-transparent">
                    Add "Read more" screen
                  </Button>
                </div>
              </>
            )}
            {item.type === "image" && (
              <div className="space-y-4">
                {item.data.src ? (
                  <div className="space-y-4">
                    <div className="flex items-start gap-4">
                      <img
                        src={item.data.src || "/placeholder.svg"}
                        alt="Preview"
                        className="w-16 h-16 object-cover rounded-md border"
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        className="bg-transparent"
                        onClick={() =>
                          handleUpdateContent(item.id, { src: null })
                        }
                      >
                        Remove
                      </Button>
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor={`image-height-${item.id}`}>
                        Image height
                      </Label>
                      <Input
                        id={`image-height-${item.id}`}
                        type="number"
                        value={item.data.height || 400}
                        onChange={(e) =>
                          handleUpdateContent(item.id, {
                            height: Number.parseInt(e.target.value, 10) || 0,
                          })
                        }
                        className="max-w-[120px]"
                      />
                    </div>
                  </div>
                ) : (
                  <>
                    <input
                      type="file"
                      ref={imageInputRef}
                      className="hidden"
                      accept="image/jpeg, image/png"
                      onChange={handleImageUpload}
                    />
                    <Button
                      variant="outline"
                      className="w-full bg-transparent"
                      onClick={() => imageInputRef.current?.click()}
                    >
                      <ImageIcon className="w-4 h-4 mr-2" />
                      Upload Image
                    </Button>
                  </>
                )}
              </div>
            )}
            <div className="flex items-end justify-between pt-4 border-t dark:border-gray-800">
              {item.type === "image" ? (
                <div>
                  <p className="text-xs text-gray-500">
                    Maximum file size: 300kb
                  </p>
                  <p className="text-xs text-gray-500">
                    Acceptable file types: JPEG, PNG
                  </p>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Label htmlFor={`required-${item.id}`}>Required</Label>
                  <Switch
                    id={`required-${item.id}`}
                    checked={item.data.required}
                    onCheckedChange={(checked) =>
                      handleUpdateContent(item.id, { required: checked })
                    }
                  />
                </div>
              )}
              <Button
                variant="ghost"
                size="icon"
                className="text-gray-500 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"
                onClick={() => handleDeleteContent(item.id)}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
};
