import { useCategoryReports, useGetReportsCsv } from '@/hooks/useReportHook.ts';
import { Download, Package, RefreshCw, TrendingUp } from 'lucide-react';
import { memo } from 'react';
import { useParams } from 'react-router-dom';
import AdvancedBottomButton from '../atom/bottomButton/advancedBottomButton.tsx';
import useReports from '../store/useReports.ts';
import useTimings from '../store/useTimings.ts';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card.tsx';
import CategoryCompactLayout from './categoryLayouts/CategoryCompactLayout.tsx';
import CategoryTableLayout from './categoryLayouts/CategoryTableLayout.tsx';
import EmptyStateInstructions from './categoryLayouts/EmptyStateInstructions.tsx';
import LayoutToggleButtons from './LayoutToggleButtons.tsx';

const MemoCategoryReports = () => {
  const businessId = useParams().businessId;
  const timeStampStart = useTimings((s) => s.timeStampStart);
  const timeStampEnd = useTimings((s) => s.timeStampEnd);
  const categoryReports = useReports((s) => s.categoryReports);
  const { isPending, getCategoryReports } = useCategoryReports();
  const { isPending: isPendingCsv, getReportsCsv } = useGetReportsCsv();
  const layout = useReports((s) => s.layoutType);

  const hasReports = categoryReports.length > 0;
  const hasCategories = hasReports && categoryReports.some((business) => business.categories.length > 0);

  const getReports = async () => {
    await getCategoryReports({
      from: timeStampStart,
      to: timeStampEnd,
      businessIds: [businessId],
    });
  };

  const downloadReports = async () => {
    await getReportsCsv({
      from: timeStampStart,
      to: timeStampEnd,
      businessIds: [businessId],
    });
  };

  return (
    <>
      <div className="space-y-6 p-4">
        <div className="flex items-center justify-between">
          {hasCategories && <h2 className="text-2xl font-bold">Category Reports</h2>}
          {hasCategories && <LayoutToggleButtons />}
        </div>

        {hasReports && (
          <div className="space-y-6 pb-[5rem]">
            {categoryReports.map((business) => (
              <Card key={business.businessId} className="w-full">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Package className="h-5 w-5" />
                      {business.businessName}
                    </div>
                    <div className="text-muted-foreground text-sm">{business.categories.length} categories</div>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-2">
                  {business.categories.length === 0 ? (
                    <p className="text-muted-foreground py-8 text-center">No category data available for the selected date range.</p>
                  ) : (
                    <>
                      {layout === 'table' && <CategoryTableLayout business={business} />}
                      {layout === 'compact' && <CategoryCompactLayout business={business} />}
                    </>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {!hasReports && !isPending && <EmptyStateInstructions text="Category" />}
      </div>

      <AdvancedBottomButton
        maxWidth="28rem"
        fixed={true}
        buttons={[
          ...(hasCategories
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
            className: hasCategories ? 'w-full md:max-w-[14rem]' : 'w-full md:max-w-[24rem]',
            disable: isPending,
            isBackButton: false,
            icon: isPending ? <RefreshCw className="h-4 w-4 animate-spin" /> : <TrendingUp className="h-4 w-4" />,
          },
        ]}
      />
    </>
  );
};

const CategoryReports = memo(MemoCategoryReports);
export default CategoryReports;
