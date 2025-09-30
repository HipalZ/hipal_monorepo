import { useState } from "react";
import { useTranslate } from "@/hooks/useTemplates";
const languages = [
  { code: "en", label: "English" },
  { code: "hi", label: "Hindi" },
  { code: "te", label: "Telugu" },
  { code: "ta", label: "Tamil" },
  { code: "ne", label: "Nepali" },
  { code: "mr", label: "Marathi" },
];

export default function TranslateBox() {
  const [text, setText] = useState("Hi {{1}}, welcome to our store!");
  const [target, setTarget] = useState("te");
  const [out, setOut] = useState("");

  const { mutateAsync: translate, isPending, error } = useTranslate();

  const go = async () => {
    const translated = await translate({ text, target });
    setOut(translated);
  };

  return (
    <div className="space-y-3">
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows={6}
        className="w-full border rounded p-2"
        placeholder="Type text. Placeholders like {{1}} are preserved."
      />
      <div className="flex items-center gap-2">
        <select
          value={target}
          onChange={(e) => setTarget(e.target.value)}
          className="border rounded p-2"
        >
          {languages.map((l) => (
            <option key={l.code} value={l.code}>
              {l.label}
            </option>
          ))}
        </select>
        <button
          onClick={go}
          disabled={isPending || !text.trim()}
          className="px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-50"
        >
          {isPending ? "Translating…" : "Translate"}
        </button>
      </div>
      {error && <div className="text-red-600">{error.message}</div>}
      <textarea
        readOnly
        value={out}
        rows={6}
        className="w-full border rounded p-2 bg-gray-50"
      />
    </div>
  );
}
