import { type ExecutiveReportInput, buildExecutiveSalesReportPdf } from '@/components/utils/buildExecutiveSalesReportPdf';

type Props = ExecutiveReportInput;

export default function ExecutiveReportButton(props: Props) {
  const save = () => {
    const doc = buildExecutiveSalesReportPdf(props);
    const from = new Date(props.from).toISOString().slice(0, 10);
    const to = new Date(props.to).toISOString().slice(0, 10);
    doc.save(`${props.businessName || 'Sales'}_${from}_to_${to}.pdf`);
  };
  return (
    <button
      type="button"
      onClick={save}
      className="inline-flex items-center gap-2 rounded-lg border bg-white px-4 py-2 text-sm font-medium shadow-sm transition hover:bg-slate-50 active:scale-[0.99]"
      title="Download Executive Report"
    >
      Download Report
    </button>
  );
}
