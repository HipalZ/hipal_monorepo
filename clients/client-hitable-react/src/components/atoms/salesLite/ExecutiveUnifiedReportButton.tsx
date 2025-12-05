import { Download } from "lucide-react";
import { format as dfFormat } from "date-fns";
import {
  buildUnifiedExecutiveSalesReportPdf,
  UnifiedExecutiveReportInput,
} from "@/components/utils/buildUnifiedExecutiveSalesReportPdf";

type Props = UnifiedExecutiveReportInput;

const formatForFile = (d: number | string | Date) => {
  const dateObj = d instanceof Date ? d : new Date(d);
  return dfFormat(dateObj, "yyyy-MM-dd_HH-mm"); // 2025-11-28_10-35
};

export default function ExecutiveUnifiedReportButton(props: Props) {
  const save = () => {
    const doc = buildUnifiedExecutiveSalesReportPdf(props);

    const fromStamp = formatForFile(props.from);
    const toStamp = formatForFile(props.to);

    doc.save(`${props.businessName || "Sales"}_${fromStamp}_to_${toStamp}.pdf`);
  };

  return (
    <button
      type="button"
      onClick={save}
      className="inline-flex items-center gap-2 rounded-lg border bg-white px-4 py-2 text-sm font-medium shadow-sm transition hover:bg-slate-50 active:scale-[0.99]"
      title="Download Executive Report"
    >
      <Download className="h-4 w-4" />
      Executive Report
    </button>
  );
}
