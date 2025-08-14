import { type ReactNode, useState, type FC } from "react";
import {
  X,
  GripVertical,
  ImageIcon,
  KeyRound,
  Mail,
  Hash,
  Smartphone,
  Asterisk,
  Check,
  ChevronDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import type { Screen, ShortAnswerSubType } from "./types";

export const PreviewPanel: FC<{ screen: Screen }> = ({ screen }) => {
  const [previewState, setPreviewState] = useState<Record<string, any>>({});

  const handleSingleChoice = (itemId: string, optionIndex: number) => {
    setPreviewState((prev) => ({ ...prev, [itemId]: optionIndex }));
  };

  const handleMultipleChoice = (itemId: string, optionIndex: number) => {
    setPreviewState((prev) => {
      const currentSelection = prev[itemId] || [];
      const newSelection = currentSelection.includes(optionIndex)
        ? currentSelection.filter((i: number) => i !== optionIndex)
        : [...currentSelection, optionIndex];
      return { ...prev, [itemId]: newSelection };
    });
  };

  const handleOptIn = (itemId: string) => {
    setPreviewState((prev) => ({ ...prev, [itemId]: !prev[itemId] }));
  };

  const handleDropdownToggle = (itemId: string) => {
    setPreviewState((prev) => ({
      ...prev,
      [itemId]: { ...prev[itemId], isOpen: !prev[itemId]?.isOpen },
    }));
  };

  const handleDropdownSelect = (itemId: string, optionIndex: number) => {
    setPreviewState((prev) => ({
      ...prev,
      [itemId]: { selected: optionIndex, isOpen: false },
    }));
  };

  const previewIcons: Record<ShortAnswerSubType, ReactNode> = {
    text: null,
    password: <KeyRound className="w-4 h-4 text-gray-400" />,
    email: <Mail className="w-4 h-4 text-gray-400" />,
    number: <Hash className="w-4 h-4 text-gray-400" />,
    passcode: <Asterisk className="w-4 h-4 text-gray-400" />,
    phone: <Smartphone className="w-4 h-4 text-gray-400" />,
  };

  return (
    <div className="w-full max-w-sm bg-white dark:bg-black rounded-3xl border-[10px] border-gray-800 dark:border-gray-600 shadow-2xl overflow-hidden">
      <div className="h-[600px] flex flex-col">
        <div className="flex items-center justify-between px-4 py-3 bg-gray-50 dark:bg-gray-900 shrink-0">
          <X className="w-5 h-5" />
          <p className="font-semibold text-sm truncate px-2">{screen.title}</p>
          <GripVertical className="w-5 h-5" />
        </div>
        <div className="flex-1 p-4 space-y-4 overflow-y-auto">
          {screen.content.map((item) => (
            <div key={item.id} className="relative">
              {item.type === "large-heading" && (
                <h1 className="text-2xl font-bold">{item.data.text}</h1>
              )}
              {item.type === "small-heading" && (
                <h2 className="text-lg font-semibold">{item.data.text}</h2>
              )}
              {item.type === "body-text" && (
                <p className="text-sm">{item.data.body}</p>
              )}
              {item.type === "caption" && (
                <p className="text-xs text-gray-500">{item.data.text}</p>
              )}
              {item.type === "image" &&
                (item.data.src ? (
                  <img
                    src={item.data.src || "/placeholder.svg"}
                    alt="Flow content"
                    className="w-full rounded-lg border dark:border-gray-700 object-cover"
                    style={{
                      height: item.data.height
                        ? `${item.data.height}px`
                        : "auto",
                    }}
                  />
                ) : (
                  <div className="bg-gray-200 dark:bg-gray-800 aspect-video rounded-lg flex items-center justify-center">
                    <ImageIcon className="w-10 h-10 text-gray-400" />
                  </div>
                ))}
              {item.type === "paragraph" && (
                <div>
                  <Label className="text-sm font-normal">
                    {item.data.label}
                    {item.data.required && (
                      <span className="text-red-500 ml-1">*</span>
                    )}
                  </Label>
                  {item.data.instructions && (
                    <p className="text-xs text-gray-500 mt-1">
                      {item.data.instructions}
                    </p>
                  )}
                  <div className="w-full h-20 mt-1 border-b-2 border-gray-200 dark:border-gray-700" />
                </div>
              )}
              {item.type === "short-answer" && (
                <div>
                  <Label className="text-sm font-normal">
                    {item.data.label}
                    {item.data.required && (
                      <span className="text-red-500 ml-1">*</span>
                    )}
                  </Label>
                  {item.data.instructions && (
                    <p className="text-xs text-gray-500 mt-1">
                      {item.data.instructions}
                    </p>
                  )}
                  <div className="w-full h-8 mt-1 border-b-2 border-gray-200 dark:border-gray-700 flex items-center gap-2">
                    {previewIcons[item.data.subtype as ShortAnswerSubType]}
                    {item.data.subtype === "password" && (
                      <span className="text-2xl -mt-2">••••••••</span>
                    )}
                  </div>
                </div>
              )}
              {item.type === "single-choice" && (
                <div className="space-y-2">
                  <Label className="text-sm font-bold">{item.data.label}</Label>
                  <div className="mt-2 space-y-2">
                    {(item.data.options || []).map((opt: string, i: number) => (
                      <article
                        key={i}
                        className="flex items-center justify-between p-2 border rounded-md cursor-pointer"
                        onClick={() => handleSingleChoice(item.id, i)}
                      >
                        <span className="text-sm">{opt}</span>
                        <div className="w-5 h-5 rounded-full border-2 border-gray-400 flex items-center justify-center">
                          {previewState[item.id] === i && (
                            <div className="w-3 h-3 rounded-full bg-green-600" />
                          )}
                        </div>
                      </article>
                    ))}
                  </div>
                </div>
              )}
              {item.type === "multiple-choice" && (
                <div className="space-y-2">
                  <Label className="text-sm font-bold">{item.data.label}</Label>
                  <div className="mt-2 space-y-2">
                    {(item.data.options || []).map((opt: string, i: number) => (
                      <article
                        key={i}
                        className="flex items-center justify-between p-2 border rounded-md cursor-pointer"
                        onClick={() => handleMultipleChoice(item.id, i)}
                      >
                        <span className="text-sm">{opt}</span>
                        <div className="w-5 h-5 rounded border-2 border-gray-400 flex items-center justify-center">
                          {(previewState[item.id] || []).includes(i) && (
                            <Check className="w-4 h-4 text-green-600" />
                          )}
                        </div>
                      </article>
                    ))}
                  </div>
                </div>
              )}
              {item.type === "dropdown" && (
                <div className="space-y-2">
                  <Label className="text-sm font-bold">{item.data.label}</Label>
                  <button
                    type="button"
                    className="mt-2 w-full flex items-center justify-between p-2 border rounded-md bg-gray-50 dark:bg-gray-800"
                    onClick={() => handleDropdownToggle(item.id)}
                  >
                    <span className="text-sm text-gray-500">
                      {(item.data.options || [])[
                        previewState[item.id]?.selected
                      ] ||
                        (item.data.options || [])[0] ||
                        "Select..."}
                    </span>
                    <ChevronDown
                      className={cn(
                        "w-4 h-4 transition-transform",
                        previewState[item.id]?.isOpen && "rotate-180",
                      )}
                    />
                  </button>
                  {previewState[item.id]?.isOpen && (
                    <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-gray-800 border rounded-md shadow-lg z-10">
                      {(item.data.options || []).map(
                        (opt: string, i: number) => (
                          <article
                            key={i}
                            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer text-sm"
                            onClick={() => handleDropdownSelect(item.id, i)}
                          >
                            {opt}
                          </article>
                        ),
                      )}
                    </div>
                  )}
                </div>
              )}
              {item.type === "opt-in" && (
                <article
                  className="flex items-center gap-3 p-2 border rounded-md cursor-pointer"
                  onClick={() => handleOptIn(item.id)}
                >
                  <div className="w-5 h-5 border-2 border-gray-400 rounded flex items-center justify-center">
                    {previewState[item.id] && (
                      <Check className="w-4 h-4 text-green-600" />
                    )}
                  </div>
                  <span className="text-sm">{item.data.label}</span>
                </article>
              )}
            </div>
          ))}
        </div>
        <div className="px-4 py-3 border-t dark:border-gray-800 shrink-0">
          <Button className="w-full bg-green-600 hover:bg-green-700 text-white">
            {screen.button.text}
          </Button>
          <p className="text-xs text-center text-gray-400 mt-2">
            Managed by the business.{" "}
            <span className="text-blue-500">Learn more</span>
          </p>
        </div>
      </div>
    </div>
  );
};
