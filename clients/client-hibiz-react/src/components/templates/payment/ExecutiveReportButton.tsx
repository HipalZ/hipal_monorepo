import { type ExecutiveReportInput, buildExecutiveSalesReportPdf } from '@/components/utils/buildExecutiveSalesReportPdf';
import { format as dfFormat } from 'date-fns';
import { Download } from 'lucide-react';
type Props = ExecutiveReportInput;
const formatForFile = (d: Date | string) => {
  const dateObj = d instanceof Date ? d : new Date(d);
  // Example: 2025-11-18_10-35
  return dfFormat(dateObj, 'yyyy-MM-dd_HH-mm');
};

export default function ExecutiveReportButton(props: Props) {
  const save = () => {
    const doc = buildExecutiveSalesReportPdf(props);

    const fromStamp = formatForFile(props.from);
    const toStamp = formatForFile(props.to);

    doc.save(`${props.businessName || 'Sales'}_${fromStamp}_to_${toStamp}.pdf`);
  };
  return (
    <button
      type="button"
      onClick={save}
      className="inline-flex items-center gap-2 rounded-lg border bg-white px-4 py-2 text-sm font-medium shadow-sm transition hover:bg-slate-50 active:scale-[0.99]"
      title="Download Executive Report"
    >
      <Download />
      Executive Report
    </button>
  );
}
