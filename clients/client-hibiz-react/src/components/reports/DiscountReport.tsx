import { useDiscountReports, useGetDiscountReportsCsv } from '@/hooks/useReportHook.ts';
import { Download, Percent, RefreshCw, TrendingUp } from 'lucide-react';
import { memo } from 'react';
import { useParams } from 'react-router-dom';
import AdvancedBottomButton from '../atom/bottomButton/advancedBottomButton.tsx';
import useReports from '../store/useReports.ts';
import useTimings from '../store/useTimings.ts';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card.tsx';
import EmptyStateInstructions from './categoryLayouts/EmptyStateInstructions.tsx';
import DiscountCompactLayout from './discountLayouts/DiscountCompactLayout.tsx';
import DiscountTableLayout from './discountLayouts/DiscountTableLayout.tsx';
import LayoutToggleButtons from './LayoutToggleButtons.tsx';

const MemoDiscountReports = () => {
  const businessId = useParams().businessId;
  const timeStampStart = useTimings((s) => s.timeStampStart);
  const timeStampEnd = useTimings((s) => s.timeStampEnd);
  const discountReports = useReports((s) => s.discountReports);
  const { isPending, getDiscountReports } = useDiscountReports();
  const { isPending: isPendingCsv, getDiscountReportsCsv } = useGetDiscountReportsCsv();
  const layout = useReports((s) => s.layoutType);

  const hasReports = discountReports.length > 0;
  const hasDiscounts = hasReports && discountReports.some((business) => business.discounts.length > 0);

  const getReports = () => {
    getDiscountReports({
      from: timeStampStart,
      to: timeStampEnd,
      businessIds: [businessId],
    });
  };

  const downloadReports = () => {
    getDiscountReportsCsv({
      from: timeStampStart,
      to: timeStampEnd,
      businessIds: [businessId],
    });
  };

  return (
    <>
      <div className="space-y-6 p-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">
            <p>Discount Reports</p>
            <p className="text-primary w-[60%] text-sm md:w-full">
              {discountReports[0]?.from} ~ {discountReports[0]?.to}
            </p>
          </h2>
          {hasDiscounts && <LayoutToggleButtons />}
        </div>

        {hasReports && (
          <div className="space-y-6 pb-[5rem]">
            {discountReports.map((business) => (
              <Card key={business.businessId} className="w-full">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Percent className="h-5 w-5" />
                      {business.businessName}
                    </div>
                    <div className="text-muted-foreground text-sm">{business.discounts.length} discount types</div>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-2">
                  {business.discounts.length === 0 ? (
                    <p className="text-muted-foreground py-8 text-center">No discount data available for the selected date range.</p>
                  ) : (
                    <>
                      {layout === 'table' && <DiscountTableLayout business={business} />}
                      {layout === 'compact' && <DiscountCompactLayout business={business} />}
                    </>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {!hasReports && !isPending && <EmptyStateInstructions text="Discount" />}
      </div>

      <AdvancedBottomButton
        maxWidth="28rem"
        fixed={true}
        buttons={[
          // Only show download button if reports exist and have discounts
          ...(hasDiscounts
            ? [
                {
                  text: isPendingCsv ? 'Preparing Report...' : 'Download Report',
                  onClick: downloadReports,
                  className: 'w-full md:max-w-[12rem]',
                  color: '#2563eb',
                  disable: isPendingCsv,
                  isBackButton: false,
                  icon: isPendingCsv ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />,
                },
              ]
            : []),
          {
            text: isPending ? 'Generating...' : 'Generate Report',
            onClick: getReports,
            className: hasDiscounts ? 'w-full md:max-w-[14rem]' : 'w-full md:max-w-[24rem]',
            disable: isPending,
            isBackButton: false,
            icon: isPending ? <RefreshCw className="h-4 w-4 animate-spin" /> : <TrendingUp className="h-4 w-4" />,
          },
        ]}
      />
    </>
  );
};

const DiscountReports = memo(MemoDiscountReports);
export default DiscountReports;
