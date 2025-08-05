import type { FC } from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
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
import { AddContentMenu } from "./add-content-menu";
import { ContentItemEditor } from "./config-item-editor";
import type { ButtonAction, ContentType, Screen } from "./types";
import { FieldWithCounter } from "./field-with-counter";

export const EditorPanel: FC<{
  activeScreen: Screen;
  screens: Screen[];
  activeScreenId: string;
  onUpdateScreen: (id: string, updates: Partial<Screen>) => void;
  onAddContent: (type: ContentType) => void;
  onDragEnd: (event: DragEndEvent) => void;
}> = ({
  activeScreen,
  screens,
  activeScreenId,
  onUpdateScreen,
  onAddContent,
  onDragEnd,
}) => {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  return (
    <div className="bg-gray-50 dark:bg-gray-900 p-6 overflow-y-auto">
      <div className="max-w-2xl mx-auto">
        <Accordion
          type="single"
          collapsible
          defaultValue="title"
          className="w-full space-y-4"
        >
          <AccordionItem
            value="title"
            className="bg-white dark:bg-gray-950 rounded-lg border"
          >
            <AccordionTrigger className="text-base font-semibold px-4">
              Screen title
            </AccordionTrigger>
            <AccordionContent className="px-4 pb-4">
              <Input
                value={activeScreen.title}
                onChange={(e) =>
                  onUpdateScreen(activeScreen.id, {
                    title: e.target.value,
                    name: e.target.value,
                  })
                }
              />
            </AccordionContent>
          </AccordionItem>
        </Accordion>
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={onDragEnd}
        >
          <SortableContext
            items={activeScreen.content}
            strategy={verticalListSortingStrategy}
          >
            <div className="space-y-4 mt-4">
              {activeScreen.content.map((item) => (
                <ContentItemEditor
                  key={item.id}
                  item={item}
                  screen={activeScreen}
                  onUpdate={onUpdateScreen}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
        <Accordion type="single" collapsible className="w-full space-y-4 mt-4">
          <AccordionItem
            value="button"
            className="bg-white dark:bg-gray-950 rounded-lg border"
          >
            <AccordionTrigger className="text-base font-semibold px-4">
              Button
            </AccordionTrigger>
            <AccordionContent className="px-4 pb-4 space-y-4">
              <FieldWithCounter
                id="button-text"
                label="Button text"
                value={activeScreen.button.text}
                maxLength={30}
                onChange={(e) =>
                  onUpdateScreen(activeScreen.id, {
                    button: { ...activeScreen.button, text: e.target.value },
                  })
                }
              />
              <div className="space-y-1">
                <Label htmlFor="button-action">Button action</Label>
                <Select
                  value={activeScreen.button.action}
                  onValueChange={(value: ButtonAction) =>
                    onUpdateScreen(activeScreen.id, {
                      button: { ...activeScreen.button, action: value },
                    })
                  }
                >
                  <SelectTrigger id="button-action">
                    <SelectValue placeholder="Select an action" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="next_screen">
                      Go to next screen
                    </SelectItem>
                    <SelectItem value="go_to_screen">
                      Go to a specific screen
                    </SelectItem>
                    <SelectItem value="submit">Submit form</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {activeScreen.button.action === "go_to_screen" && (
                <div className="space-y-1">
                  <Label htmlFor="target-screen">Target screen</Label>
                  <Select
                    value={activeScreen.button.targetScreenId}
                    onValueChange={(value) =>
                      onUpdateScreen(activeScreen.id, {
                        button: {
                          ...activeScreen.button,
                          targetScreenId: value,
                        },
                      })
                    }
                  >
                    <SelectTrigger id="target-screen">
                      <SelectValue placeholder="Select a screen" />
                    </SelectTrigger>
                    <SelectContent>
                      {screens
                        .filter((s) => s.id !== activeScreenId)
                        .map((s) => (
                          <SelectItem key={s.id} value={s.id}>
                            {s.name}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </AccordionContent>
          </AccordionItem>
        </Accordion>
        <AddContentMenu
          onAdd={onAddContent}
          contentCount={activeScreen.content.length}
        />
      </div>
    </div>
  );
};
