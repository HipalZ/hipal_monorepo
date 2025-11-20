import { useAddonReports, useGetAddonReportsCsv } from '@/hooks/useReportHook.ts';
import { Download, Plus, RefreshCw, TrendingUp } from 'lucide-react';
import { memo } from 'react';
import { useParams } from 'react-router-dom';
import AdvancedBottomButton from '../atom/bottomButton/advancedBottomButton.tsx';
import useReports from '../store/useReports.ts';
import useTimings from '../store/useTimings.ts';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card.tsx';
import AddonCardLayout from './addOnLayouts/AddCardLayout.tsx';
import AddonCompactLayout from './addOnLayouts/AddOnCompactLayout.tsx';
import AddonTableLayout from './addOnLayouts/AddonTableLayout.tsx';
import EmptyStateInstructions from './categoryLayouts/EmptyStateInstructions.tsx';
import LayoutToggleButtons from './LayoutToggleButtons.tsx';

const MemoAddonReports = () => {
  const businessId = useParams().businessId;
  const timeStampStart = useTimings((s) => s.timeStampStart);
  const timeStampEnd = useTimings((s) => s.timeStampEnd);
  const addonReports = useReports((s) => s.addonReports);
  const { isPending, getAddonReports } = useAddonReports();
  const { isPending: isPendingCsv, getAddonReportsCsv } = useGetAddonReportsCsv();
  const layout = useReports((s) => s.layoutType);

  const hasReports = addonReports.length > 0;
  const hasAddons = hasReports && addonReports.some((business) => business.addOns.length > 0);

  const getReports = () => {
    getAddonReports({
      from: timeStampStart,
      to: timeStampEnd,
      businessIds: [businessId],
    });
  };

  const downloadReports = () => {
    getAddonReportsCsv({
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
            <p>AddOn Reports</p>
            <p className="text-primary w-[60%] text-sm md:w-full">
              {addonReports[0]?.from} ~ {addonReports[0]?.to}
            </p>
          </h2>
          {hasAddons && <LayoutToggleButtons />}
        </div>

        {hasReports && (
          <div className="space-y-6 pb-[5rem]">
            {addonReports.map((business) => (
              <Card key={business.businessId} className="w-full">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Plus className="h-5 w-5" />
                      {business.businessName}
                    </div>
                    <div className="text-muted-foreground text-sm">{business.addOns.length} addon types</div>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-2">
                  {business.addOns.length === 0 ? (
                    <p className="text-muted-foreground py-8 text-center">No addon data available for the selected date range.</p>
                  ) : (
                    <>
                      {layout === 'cards' && <AddonCardLayout business={business} />}
                      {layout === 'table' && <AddonTableLayout business={business} />}
                      {layout === 'compact' && <AddonCompactLayout business={business} />}
                    </>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {!hasReports && !isPending && <EmptyStateInstructions text="Addon" />}
      </div>

      <AdvancedBottomButton
        maxWidth="28rem"
        fixed={true}
        buttons={[
          // Only show download button if reports exist and have addons
          ...(hasAddons
            ? [
                {
                  text: isPendingCsv ? 'Downloading...' : 'Download CSV',
                  onClick: downloadReports,
                  className: 'w-full md:max-w-[12rem] !bg-purple-600',
                  disable: isPendingCsv,
                  isBackButton: false,
                  icon: isPendingCsv ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />,
                },
              ]
            : []),
          {
            text: isPending ? 'Generating...' : 'Generate Report',
            onClick: getReports,
            className: hasAddons ? 'w-full md:max-w-[14rem]' : 'w-full md:max-w-[24rem]',
            disable: isPending,
            isBackButton: false,
            icon: isPending ? <RefreshCw className="h-4 w-4 animate-spin" /> : <TrendingUp className="h-4 w-4" />,
          },
        ]}
      />
    </>
  );
};

const AddonReports = memo(MemoAddonReports);
export default AddonReports;
