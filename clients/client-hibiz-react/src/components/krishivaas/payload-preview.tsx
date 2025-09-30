import MiddlePopUp from "@/components/atom/middlePopUp";
import { Button } from "@/components/ui/button";
import { memo } from "react";

const MemoPayloadPreview = ({ showPreview, setShowPreview, previewPayloads, handleOpenTerms, setPreviewPayloads }:Props) => {
    return <MiddlePopUp show={showPreview} onlyPopUp >
        <div className="w-full max-w-3xl h-[75dvh] overflow-y-scroll bg-white rounded-lg shadow-2xl">
            <h2 className="mb-4 text-2xl font-semibold text-center">Preview Templates</h2>
            <div className="space-y-4 p-4">
                {previewPayloads?.map((p, i) => (
                    <div key={i?.toString()} className="p-3 rounded mb-3 border">
                        <h3 className="font-semibold mb-2">{p.name}</h3>
                        {p.components.find((c) => c.type === "HEADER") && (
                            <textarea
                                className="w-full border rounded p-2 mb-3"
                                value={p.components.find((c) => c.type === "HEADER")?.text || ""}
                                onChange={(e) => {
                                    const newPayloads = [...previewPayloads];
                                    const header = newPayloads[i].components.find((c) => c.type === "HEADER");
                                    if (header) header.text = e.target.value;
                                    setPreviewPayloads(newPayloads);
                                }}
                                placeholder="Edit header..."
                            />
                        )}
                        {p.components.find((c) => c.type === "BODY") && (
                            <textarea
                                className="w-full border rounded p-2"
                                value={p.components.find((c) => c.type === "BODY")?.text || ""}
                                onChange={(e) => {
                                    const newPayloads = [...previewPayloads];
                                    const body = newPayloads[i].components.find((c) => c.type === "BODY");
                                    if (body) body.text = e.target.value;
                                    setPreviewPayloads(newPayloads);
                                }}
                                placeholder="Edit body..."
                            />
                        )}
                    </div>
                ))}
                <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => setShowPreview(false)} className="px-4 py-2 border rounded">Cancel</Button>
                    <Button variant="outline" onClick={handleOpenTerms} className="px-4 py-2 bg-green-600 text-white rounded">Save All</Button>
                </div>
            </div>
        </div>
    </MiddlePopUp>
}

const PayloadPreview = memo(MemoPayloadPreview);
export default PayloadPreview