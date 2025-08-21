import { useState, useMemo } from "react";
import { arrayMove } from "@dnd-kit/sortable";
import type { DragEndEvent } from "@dnd-kit/core";
import { Button } from "@/components/ui/button";
import toast from "react-hot-toast";
import type {
  ContentType,
  ContentComponent,
  Screen,
} from "@/components/flow-builder/types";
import { ScreensPanel } from "@/components/flow-builder/screens-panel";
import { EditorPanel } from "@/components/flow-builder/editor-panel";
import { PreviewPanel } from "@/components/flow-builder/preview-panel";
import { generateJsonPayload } from "@/lib/whatsapp-payload-generator";
import { publishWhatsAppFlow } from "@/components/helpers/whatzAppHelpers";
import { BiLeftArrow } from "react-icons/bi";
import { useWhatsappTempStore } from "@/components/store/useWhatsappTempStore";

const initialScreens: Screen[] = [
  {
    id: "screen_1",
    name: "User Details",
    title: "User Details",
    content: [
      {
        id: "content_1",
        type: "large-heading",
        data: { text: "Create Your Account" },
      },
      {
        id: "content_para",
        type: "paragraph",
        data: {
          label: "Leave a comment",
          instructions: "Tell us what you think.",
          required: false,
        },
      },
    ],
    button: { text: "Sign Up", action: "submit" },
  },
];

export default function FlowBuilderPage() {
  const [screens, setScreens] = useState<Screen[]>(initialScreens);
  const [activeScreenId, setActiveScreenId] = useState<string>(
    initialScreens[0].id,
  );
  const [isSaving, setIsSaving] = useState(false);
  const setFlowBuilderOpen = useWhatsappTempStore((s) => s.setFlowBuilderOpen);
  const activeScreen = useMemo(
    () => screens.find((s) => s.id === activeScreenId)!,
    [screens, activeScreenId],
  );

  const handleUpdateScreen = (screenId: string, updates: Partial<Screen>) => {
    setScreens((prev) =>
      prev.map((s) => (s.id === screenId ? { ...s, ...updates } : s)),
    );
  };

  const handleAddContent = (type: ContentType) => {
    if (activeScreen.content.length >= 8) {
      toast.error(
        "You can only add a maximum of 8 content components per screen.",
      );
      return;
    }
    const newContentComponent: ContentComponent = {
      id: `content_${Date.now()}`,
      type,
      data: {
        text: "New Item",
        label: "New Label",
        body: "New Body Text",
        options: ["Option 1", "Option 2"],
        required: false,
        subtype: "text",
      },
    };
    handleUpdateScreen(activeScreen.id, {
      content: [...activeScreen.content, newContentComponent],
    });
  };

  const handleAddNewScreen = () => {
    if (screens.length >= 8) {
      toast.error("You can only add a maximum of 8 screens.");
      return;
    }
    const newScreen: Screen = {
      id: `screen_${Date.now()}`,
      name: "New Screen",
      title: "New Screen",
      content: [],
      button: { text: "Next", action: "next_screen" },
    };
    setScreens([...screens, newScreen]);
    setActiveScreenId(newScreen.id);
  };

  const handleDeleteScreen = (screenIdToDelete: string) => {
    if (screens.length <= 1) {
      toast.error("You must have at least one screen.");
      return;
    }
    const confirmation = window.confirm(
      "Are you sure you want to delete this screen?",
    );
    if (!confirmation) return;

    const remainingScreens = screens.filter((s) => s.id !== screenIdToDelete);
    setScreens(remainingScreens);
    if (activeScreenId === screenIdToDelete) {
      setActiveScreenId(remainingScreens[0].id);
    }
    toast.success("Screen deleted.");
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = activeScreen.content.findIndex(
        (item) => item.id === active.id,
      );
      const newIndex = activeScreen.content.findIndex(
        (item) => item.id === over.id,
      );
      const newContentOrder = arrayMove(
        activeScreen.content,
        oldIndex,
        newIndex,
      );
      handleUpdateScreen(activeScreen.id, { content: newContentOrder });
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    const toastId = toast.loading("Publishing flow...");
    const payload = generateJsonPayload(screens);
    const flowName = activeScreen.name || "My New Flow";
    const result = await publishWhatsAppFlow(payload, flowName);
    toast.dismiss(toastId);
    setIsSaving(false);

    if (result.success) {
      toast.success(`Flow published successfully! Flow ID: ${result.data.id}`);
      console.log("--- PUBLISH SUCCESS ---", result.data);
    } else {
      toast.error(`Failed to publish flow: ${result.error}`);
      console.error("--- PUBLISH FAILED ---", result.error);
    }
  };

  if (!activeScreen) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-[calc(85dvh-50rem)] bg-gray-100 dark:bg-gray-900 flex flex-col relative pb-20">
      <header className="flex items-center justify-between px-6 border-b bg-white dark:bg-gray-950 dark:border-gray-800 shrink-0">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            aria-label="Back"
            onClick={() => setFlowBuilderOpen(false)}
          >
            <BiLeftArrow className="w-5 h-5" />
          </Button>
          <h1 className="text-lg font-semibold">Create flow</h1>
        </div>
      </header>
      <section className="flex-1 grid grid-cols-1 md:grid-cols-[300px_1fr] lg:grid-cols-[200px_2fr_350px] overflow-hidden">
        <ScreensPanel
          screens={screens}
          activeScreenId={activeScreenId}
          onScreenSelect={setActiveScreenId}
          onScreenAdd={handleAddNewScreen}
          onScreenDelete={handleDeleteScreen}
        />
        <EditorPanel
          activeScreen={activeScreen}
          screens={screens}
          activeScreenId={activeScreenId}
          onUpdateScreen={handleUpdateScreen}
          onAddContent={handleAddContent}
          onDragEnd={handleDragEnd}
        />
        <PreviewPanel screen={activeScreen} />
      </section>
      <footer className="fixed bottom-0 w-full max-w-[80%] flex items-center justify-between px-6 py-3 border-t bg-white dark:bg-gray-950 dark:border-gray-800 shrink-0">
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Once your message template has been created, this flow cannot be
          edited.
        </p>
        <div className="flex items-center gap-2">
          <Button variant="outline">Cancel</Button>
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? "Publishing..." : "Save & Publish"}
          </Button>
        </div>
      </footer>
    </div>
  );
}
