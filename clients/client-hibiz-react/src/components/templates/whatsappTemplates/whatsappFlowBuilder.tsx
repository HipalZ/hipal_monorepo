import { useState, useMemo } from "react";
import { arrayMove } from "@dnd-kit/sortable";
import type { DragEndEvent } from "@dnd-kit/core";
import { X } from "lucide-react";
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
      {
        id: "content_dd",
        type: "dropdown",
        data: {
          label: "Select your country",
          options: ["USA", "Canada", "Mexico"],
          required: true,
        },
      },
      {
        id: "content_opt",
        type: "opt-in",
        data: { label: "I agree to the terms and conditions.", required: true },
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
    <div className="bg-gray-100 dark:bg-gray-900 h-screen flex flex-col">
      <header className="flex items-center justify-between px-6 py-3 border-b bg-white dark:bg-gray-950 dark:border-gray-800 shrink-0">
        <h1 className="text-lg font-semibold">Create flow</h1>
        <Button variant="ghost" size="icon">
          <X className="w-5 h-5" />
        </Button>
      </header>
      <section className="flex-1 grid grid-cols-1 md:grid-cols-[300px_1fr] lg:grid-cols-[300px_1fr_400px] overflow-hidden">
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
      <footer className="flex items-center justify-between px-6 py-3 border-t bg-white dark:bg-gray-950 dark:border-gray-800 shrink-0">
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
