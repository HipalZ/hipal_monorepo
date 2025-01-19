import type { Alert } from "@/components/types/hiClientzData";
import { Button } from "@/components/ui/button";
import { cn } from "@hi/common";
import { memo, useCallback, useState } from "react";
import { FiCopy } from "react-icons/fi";
import { MdOutlineCall, MdOutlineTableBar } from "react-icons/md";

const MemoOfflineCard = ({ alert }: { alert: Alert }) => {
  const [numberTick, setNumberTick] = useState(false);

  const copyText = useCallback((id: string, value?: string) => {
    let text: string;
    if (value) {
      text = value;
    } else {
      text = document.querySelector(id)?.textContent || "";
    }

    const sanitizedText = text.replace(/[₹]/g, "");
    navigator.clipboard
      .writeText(sanitizedText)
      .then(() => {
        setNumberTick(true);
        setTimeout(() => {
          setNumberTick(false);
        }, 3000);
      })
      .catch((err) => {
        console.error("Failed to copy text: ", err);
      });
  }, []);
  return (
    <>
      <div className="flex items-start justify-between space-y-2">
        <section>
          <span className="font-semibold">
            {alert?.userId?.name || "Customer"}
          </span>
          <div className="flex items-center space-x-2">
            <p className="text-sm">{alert?.userId?.phone || "NA"}</p>
            <Button
              variant="ghost"
              size="icon"
              className={cn(
                "h-8 w-8",
                numberTick ? "text-green-500" : "text-primary",
              )}
              onClick={() => copyText("#phone", alert?.userId?.phone)}
            >
              <FiCopy className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="w-8 h-8 text-primary"
              asChild
            >
              <a href={`tel:+91${alert?.userId?.phone}`}>
                <MdOutlineCall className="w-4 h-4" />
              </a>
            </Button>
          </div>
        </section>
        <section className="text-right">
          <div className="flex -mt-3 space-x-2 text-right">
            <MdOutlineTableBar size={28} />
            <h4 className="text-lg font-semibold text-right">
              {alert?.tableName}
            </h4>
          </div>
        </section>
      </div>
      <p className="font-semibold opacity-70">{alert?.message}</p>
    </>
  );
};

const CallCaptainCard = memo(MemoOfflineCard);
export default CallCaptainCard;
