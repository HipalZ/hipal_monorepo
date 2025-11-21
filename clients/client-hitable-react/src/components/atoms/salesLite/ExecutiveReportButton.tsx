import { type ExecutiveReportInput, buildExecutiveSalesReportPdf } from '@/components/utils/buildExecutiveSalesReport';
import { format as dfFormat } from 'date-fns';
import { Download } from 'lucide-react';

type Props = ExecutiveReportInput;

const formatForFile = (d: Date | string) => {
  const dateObj = d instanceof Date ? d : new Date(d);
  return dfFormat(dateObj, 'yyyy-MM-dd_HH-mm');
};

async function urlToDataUrl(url: string): Promise<string> {
  const res = await fetch(url);
  const blob = await res.blob();

  return await new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

export default function ExecutiveReportButton(props: Props) {
  const save = async () => {
    let logoForPdf = props.businessLogo;

    if (logoForPdf) {
      try {
        logoForPdf = await urlToDataUrl(logoForPdf);
      } catch (e) {
        console.error('Failed to load logo for PDF:', e);
        logoForPdf = undefined;
      }
    }

    const doc = buildExecutiveSalesReportPdf({
      ...props,
      businessLogo: logoForPdf,
    });

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
