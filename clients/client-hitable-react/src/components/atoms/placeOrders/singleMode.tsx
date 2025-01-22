import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { memo } from "react"
import type { IMode } from "./normalsettle";
import type { IBillData } from "@/components/types/hiClientzData";
import { useOrderStore } from "@/components/store/useOrderData";
import { motion } from "framer-motion";
import { ModeIcon } from "./normalsettle";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";

const MemoSingleMode = ({ paymentModes, billData }: { paymentModes: IMode[]; billData: IBillData }) => {

    const {
        settleModes,
        setSettleModes,
    } = useOrderStore();

    const handleSelectSingleMode = (mode: IMode) => {
        setSettleModes([
            {
                _id: mode._id,
                name: mode.name,
                amount: billData?.total || 0,
            },
        ]);
    };


    return (
        <RadioGroup
            value={settleModes[0]?._id || ""}
            onValueChange={(val) => {
                const modeObj = paymentModes?.find((m) => m._id === val);
                if (modeObj) handleSelectSingleMode(modeObj);
            }}
        >
            <div className="flex flex-col px-4 gap-4 h-[60vh] overflow-auto hide-scrollbar pb-[7rem]">
                {paymentModes?.map((mode) => (
                    <motion.div
                        key={mode._id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                    >
                        <Card
                            className={`cursor-pointer transition-all ${settleModes[0]?._id === mode._id ? "border-primary" : ""
                                }`}
                        >
                            <CardContent className="p-4">
                                <RadioGroupItem
                                    value={mode._id}
                                    id={mode._id}
                                    className="sr-only peer"
                                    disabled={!mode.active}
                                />
                                <Label
                                    htmlFor={mode._id}
                                    className={`flex items-center space-x-4 cursor-pointer ${!mode.active ? "cursor-not-allowed" : ""
                                        }`}
                                >
                                    <div className="flex-shrink-0">
                                        <ModeIcon name={mode.name} />
                                    </div>
                                    <div>
                                        <p className="font-medium capitalize">{mode.name}</p>
                                        {!mode.active && (
                                            <p className="text-sm text-muted-foreground">
                                                Currently unavailable
                                            </p>
                                        )}
                                    </div>
                                </Label>
                            </CardContent>
                        </Card>
                    </motion.div>
                ))}
            </div>
        </RadioGroup>
    )
}

const SingleMode = memo(MemoSingleMode)
export default SingleMode