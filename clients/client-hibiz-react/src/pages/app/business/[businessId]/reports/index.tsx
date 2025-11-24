import DateRangePicker from '@/components/molecules/dateRangePicker/index.tsx';
import MemoizedHeader from '@/components/molecules/header/index.tsx';
import AddonReports from '@/components/reports/AddOnReports.tsx';
import CategoryReports from '@/components/reports/CategoryReports.tsx';
import DiscountReports from '@/components/reports/DiscountReport.tsx';
import ItemReports from '@/components/reports/ItemReports.tsx';
import ServiceChargeReports from '@/components/reports/ServiceChargeReports.tsx';
import useReports, { type ReportsTypes } from '@/components/store/useReports.ts';
import UniversalNav from '@/components/templates/menu/sideNavbaar/universelSidenav.tsx';
import { cn } from '@/lib/utils.ts';
import { useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

enum ReportType {
  Category = 'category',
  Item = 'item',
  Discount = 'discount',
  ServiceCharge = 'serviceCharge',
  AddOn = 'addOn',
}

const navItems = [
  { text: 'Category' },
  { text: 'Item' },
  {
    text: 'AddOn',
  },
  { text: 'Discount' },
  { text: 'ServiceCharge' },
];

const Reports = () => {
  const businessId = useParams().businessId;
  const navigate = useNavigate();
  const reportPage = useReports((s) => s.reportPage);
  const setReportPage = useReports((s) => s.setReportPage);

  const changeLayout = useCallback(
    (text: string) => {
      const correctedText = text.toLowerCase() as ReportsTypes;
      setReportPage(correctedText);
    },
    [setReportPage],
  );

  const handleBack = useCallback(() => {
    return navigate(`/app/business/${businessId}`);
  }, []);

  return (
    <main>
      <div className="sticky top-0 z-50 w-full">
        <article className="linear_gradient_background">
          <MemoizedHeader title="Item Analytics" onBack={handleBack} />
        </article>

        <nav className="hide-scrollbar mobile-only absolute flex w-full flex-nowrap space-x-4 overflow-auto text-nowrap px-4 text-sm">
          {navItems.map((item) => (
            <button
              className={cn(
                'bg-white pb-3 pt-4',
                reportPage?.toLowerCase() === item.text.toLowerCase()
                  ? 'border-b-2 border-[#8162e6] text-lg font-semibold text-[#8162e6] transition-all'
                  : '',
              )}
              key={item.text}
              type="button"
              onClick={() => changeLayout(item.text)}
            >
              {item.text}
            </button>
          ))}
        </nav>
      </div>
      <UniversalNav items={navItems} selectedNavItem={reportPage} changeNav={changeLayout} />
      <section className="mt-[4rem] xl:mt-0">
        <DateRangePicker />
      </section>
      {reportPage === ReportType.Category && (
        <div>
          <CategoryReports />
        </div>
      )}
      {reportPage === ReportType.Item && (
        <div>
          <ItemReports />
        </div>
      )}
      {reportPage === ReportType.AddOn.toLowerCase() && (
        <div>
          <AddonReports />
        </div>
      )}
      {reportPage === ReportType.Discount && (
        <div>
          <DiscountReports />
        </div>
      )}
      {reportPage === ReportType.ServiceCharge.toLowerCase() && (
        <div>
          <ServiceChargeReports />
        </div>
      )}
    </main>
  );
};

export default Reports;
