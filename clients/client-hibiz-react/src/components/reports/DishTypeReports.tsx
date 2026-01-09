import { useGetDishTypeReportsCsv, useDishTypeReports, type BusinessDishTypeReport } from '@/hooks/useReportHook';
import { Download, RefreshCw, TrendingUp, UtensilsCrossed } from 'lucide-react';
import { memo, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import AdvancedBottomButton from '../atom/bottomButton/advancedBottomButton';
import useReports from '../store/useReports';
import useTimings from '../store/useTimings';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import EmptyStateInstructions from './categoryLayouts/EmptyStateInstructions';
import FoodType from '../atom/FoodType';

const MemoDishTypeReports = () => {
  const params = useParams();
  const businessId = params.businessId ?? '';

  const timeStampStart = useTimings((s) => s.timeStampStart);
  const timeStampEnd = useTimings((s) => s.timeStampEnd);
  const dishTypeReports = useReports((s) => s.dishTypeReports);
  const { isPending, getDishTypeReports } = useDishTypeReports();
  const { isPending: isPendingCsv, getDishTypeReportsCsv } = useGetDishTypeReportsCsv();

  const hasReports = dishTypeReports.length > 0;
  const hasDishTypes =
    hasReports &&
    dishTypeReports.some((business) => business.dishTypes.length > 0);

  // Calculate totals across all businesses
  const totals = useMemo(() => {
    if (!hasDishTypes) {
      return {
        itemCount: 0,
        grossAmount: 0,
        discount: 0,
        tax: 0,
        netSales: 0,
      };
    }

    return dishTypeReports.reduce(
      (acc, business) => {
        const businessTotals = business.dishTypes.reduce(
          (sum, type) => ({
            itemCount: sum.itemCount + type.itemCount,
            grossAmount: sum.grossAmount + type.grossAmount,
            discount: sum.discount + type.discount,
            tax: sum.tax + type.tax,
            netSales: sum.netSales + type.netSales,
          }),
          { itemCount: 0, grossAmount: 0, discount: 0, tax: 0, netSales: 0 },
        );

        return {
          itemCount: acc.itemCount + businessTotals.itemCount,
          grossAmount: acc.grossAmount + businessTotals.grossAmount,
          discount: acc.discount + businessTotals.discount,
          tax: acc.tax + businessTotals.tax,
          netSales: acc.netSales + businessTotals.netSales,
        };
      },
      { itemCount: 0, grossAmount: 0, discount: 0, tax: 0, netSales: 0 },
    );
  }, [dishTypeReports, hasDishTypes]);

  const getReports = async () => {
    await getDishTypeReports({
      from: timeStampStart,
      to: timeStampEnd,
      businessIds: businessId ? [businessId] : [],
    });
  };

  const downloadReports = async () => {
    await getDishTypeReportsCsv({
      from: timeStampStart,
      to: timeStampEnd,
      businessIds: businessId ? [businessId] : [],
    });
  };

  return (
    <>
      <div className="space-y-6 p-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">
            <p>Dish Type Reports</p>
            <p className="text-primary w-[60%] text-sm md:w-full">
              {dishTypeReports[0]?.from} ~ {dishTypeReports[0]?.to}
            </p>
          </h2>
        </div>

        {/* Summary Cards */}
        {hasDishTypes && (
          <div className="grid grid-cols-2 gap-4 md:grid-cols-5">
            <Card>
              <CardContent className="p-4">
                <div className="text-muted-foreground text-xs font-medium uppercase">Total Quantity</div>
                <div className="mt-1 text-2xl font-bold">{totals.itemCount.toLocaleString()}</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-muted-foreground text-xs font-medium uppercase">Gross Amount</div>
                <div className="mt-1 text-2xl font-bold">
                  ₹{totals.grossAmount.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-muted-foreground text-xs font-medium uppercase">Discount</div>
                <div className="mt-1 text-2xl font-bold text-red-600">
                  ₹{totals.discount.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-muted-foreground text-xs font-medium uppercase">Tax</div>
                <div className="mt-1 text-2xl font-bold">
                  ₹{totals.tax.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-muted-foreground text-xs font-medium uppercase">Net Sales</div>
                <div className="mt-1 text-2xl font-bold text-green-600">
                  ₹{totals.netSales.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Results Section */}
        {hasReports && (
          <div className="space-y-6 pb-[5rem]">
            {dishTypeReports.map((business) => (
              <Card key={business.businessId} className="w-full border-none !p-0 shadow-none">
                <CardHeader className="w-full border-none p-0 pb-6 shadow-none">
                  <CardTitle className="flex items-center justify-start gap-4 text-lg font-semibold">
                    <div className="flex items-center gap-2">
                      <UtensilsCrossed className="h-5 w-5" />
                      {business.businessName}
                    </div>
                    <div className="text-muted-foreground text-sm">
                      {business.dishTypes.length} type{business.dishTypes.length !== 1 ? 's' : ''}
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent className="border-none !p-0 shadow-none">
                  {business.dishTypes.length === 0 ? (
                    <p className="text-muted-foreground py-8 text-center">
                      No dish type data available for the selected date range.
                    </p>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full border-collapse">
                        <thead>
                          <tr className="border-b-2 border-gray-200">
                            <th className="p-3 text-left text-sm font-semibold text-gray-700">Type</th>
                            <th className="p-3 text-right text-sm font-semibold text-gray-700">Quantity</th>
                            <th className="p-3 text-right text-sm font-semibold text-gray-700">Gross Amount</th>
                            <th className="p-3 text-right text-sm font-semibold text-gray-700">Discount</th>
                            <th className="p-3 text-right text-sm font-semibold text-gray-700">Tax</th>
                            <th className="p-3 text-right text-sm font-semibold text-gray-700">Net Sales</th>
                            <th className="p-3 text-right text-sm font-semibold text-gray-700">% of Total</th>
                          </tr>
                        </thead>
                        <tbody>
                          {business.dishTypes.map((dishType, index) => {
                            const percentage =
                              totals.netSales > 0
                                ? ((dishType.netSales / totals.netSales) * 100).toFixed(1)
                                : '0.0';

                            return (
                              <tr
                                key={`${business.businessId}-${dishType.type}-${index}`}
                                className="border-b border-gray-100 hover:bg-gray-50"
                              >
                                <td className="p-3">
                                  <div className="flex items-center gap-2">
                                    <FoodType types={[dishType.type as 'VEG' | 'EGG' | 'NON_VEG' | 'VEGAN' | 'OTHER' | 'ALCOHOL' | 'NON_ALCOHOL']} />
                                    <span className="font-medium">{dishType.type}</span>
                                  </div>
                                </td>
                                <td className="p-3 text-right">{dishType.itemCount.toLocaleString()}</td>
                                <td className="p-3 text-right">
                                  ₹{dishType.grossAmount.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                                </td>
                                <td className="p-3 text-right text-red-600">
                                  ₹{dishType.discount.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                                </td>
                                <td className="p-3 text-right">
                                  ₹{dishType.tax.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                                </td>
                                <td className="p-3 text-right font-semibold text-green-600">
                                  ₹{dishType.netSales.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                                </td>
                                <td className="p-3 text-right text-sm text-gray-600">{percentage}%</td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {!hasReports && !isPending && <EmptyStateInstructions text="Dish Type" />}
      </div>

      <AdvancedBottomButton
        maxWidth="28rem"
        fixed={true}
        buttons={[
          ...(hasDishTypes
            ? [
                {
                  text: isPendingCsv ? 'Downloading...' : 'Download Excel',
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
            className: hasDishTypes ? 'w-full md:max-w-[14rem]' : 'w-full md:max-w-[24rem]',
            disable: isPending,
            isBackButton: false,
            icon: isPending ? <RefreshCw className="h-4 w-4 animate-spin" /> : <TrendingUp className="h-4 w-4" />,
          },
        ]}
      />
    </>
  );
};

const DishTypeReports = memo(MemoDishTypeReports);
export default DishTypeReports;