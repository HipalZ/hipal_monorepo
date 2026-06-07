import AdvancedBottomButton from '@/components/atom/bottomButton/advancedBottomButton.tsx';
import useTimings from '@/components/store/useTimings.ts';
import { useDownloadUnifiedExcel } from '@/hooks/useReportHook.ts';
import { Download, RefreshCw } from 'lucide-react';
import { memo } from 'react';
import { useParams } from 'react-router-dom';

const MemoMultiReportDownloadButton = () => {
  const { businessId } = useParams();
  const timeStampStart = useTimings((s) => s.timeStampStart);
  const timeStampEnd = useTimings((s) => s.timeStampEnd);

  const { isPendingExcel, downloadUnifiedExcel } = useDownloadUnifiedExcel();

  const handleDownload = async () => {
    if (!businessId) return;

    await downloadUnifiedExcel({
      businessIds: [businessId],
      from: timeStampStart,
      to: timeStampEnd,
    });
  };

  return (
    <>
      <AdvancedBottomButton
        fixed={true}
        maxWidth="30rem"
        buttons={[
          {
            type: 'button',
            text: isPendingExcel ? 'Preparing Report...' : 'Download Report',
            onClick: handleDownload,
            disable: isPendingExcel || !businessId,
            color: '#2563eb',
            icon: isPendingExcel ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />,
          },
        ]}
      />
    </>
  );
};

const MultiReportDownloadButton = memo(MemoMultiReportDownloadButton);
export default MultiReportDownloadButton;
