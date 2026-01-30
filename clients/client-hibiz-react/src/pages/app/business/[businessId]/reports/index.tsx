import DateRangePicker from '@/components/molecules/dateRangePicker/index.tsx';
import MemoizedHeader from '@/components/molecules/header/index.tsx';
import AddonReports from '@/components/reports/AddOnReports.tsx';
import CategoryReports from '@/components/reports/CategoryReports.tsx';
import ParentCategoryReports from '@/components/reports/ParentCategoryReports.tsx';
import MultiReportDownloadButton from '@/components/reports/CombinedReport';
import DeletedItemsReports from '@/components/reports/DeletedItemReport';
import DiscountReports from '@/components/reports/DiscountReport.tsx';
import DishTypeReports from '@/components/reports/DishTypeReports.tsx';
import ItemReports from '@/components/reports/ItemReports.tsx';
import ItemVariantReports from '@/components/reports/ItemVariantReports.tsx';
import ServiceChargeReports from '@/components/reports/ServiceChargeReports.tsx';
import useReports, { type ReportsTypes } from '@/components/store/useReports.ts';
import UniversalNav from '@/components/templates/menu/sideNavbaar/universelSidenav.tsx';
import { cn } from '@/lib/utils.ts';
import { useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

enum ReportType {
  Combined = 'combined',
  Category = 'category',
  ParentCategory = 'parentCategory',
  Item = 'item',
  ItemVariant = 'item_variant',
  DishType = 'dishType',
  Discount = 'discount',
  ServiceCharge = 'serviceCharge',
  AddOn = 'addOn',
  Deleted = 'Deleted_Items',
}

const navItems = [
  { text: 'Combined' },
  { text: 'Category' },
  { text: 'Parent Category' },
  { text: 'Item' },
  { text: 'Item_Variant' },
  { text: 'DishType' },
  { text: 'AddOn' },
  { text: 'Discount' },
  { text: 'ServiceCharge' },
  { text: 'Deleted_Items' },
];

const normalizeNavKey = (s: string) => s.toLowerCase().replace(/\s+/g, '');

const Reports = () => {
  const businessId = useParams().businessId;
  const navigate = useNavigate();
  const reportPage = useReports((s) => s.reportPage);
  const setReportPage = useReports((s) => s.setReportPage);

  const changeLayout = useCallback(
    (text: string) => {
      const key = normalizeNavKey(text);
      const correctedText: ReportsTypes =
        key === 'parentcategory'
          ? 'parentCategory'
          : key === 'item_variant'
            ? 'itemVariant'
            : key === 'dishtype'
              ? 'dishType'
              : key === 'servicecharge'
                ? 'serviceCharge'
                : key === 'addon'
                  ? 'addOn'
                  : key === 'deleted_items'
                    ? 'deleted_items'
                    : (text.toLowerCase() as ReportsTypes);
      setReportPage(correctedText);
    },
    [setReportPage],
  );

  const handleBack = useCallback(() => {
    return navigate(`/app/business/${businessId}`);
  }, [navigate, businessId]);

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
                normalizeNavKey(reportPage ?? '') === normalizeNavKey(item.text)
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
      {reportPage === ReportType.Combined && (
        <div>
          <MultiReportDownloadButton />
        </div>
      )}
      {reportPage === ReportType.Category && (
        <div>
          <CategoryReports />
        </div>
      )}
      {reportPage === ReportType.ParentCategory && (
        <div>
          <ParentCategoryReports />
        </div>
      )}
      {reportPage === ReportType.Item && (
        <div>
          <ItemReports />
        </div>
      )}
      {reportPage === ReportType.ItemVariant.toLowerCase() && (
        <div>
          <ItemVariantReports />
        </div>
      )}
      {reportPage === ReportType.DishType.toLowerCase() && (
        <div>
          <DishTypeReports />
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
      {reportPage === ReportType.Deleted.toLowerCase() && (
        <div>
          <DeletedItemsReports />
        </div>
      )}
    </main>
  );
};

export default Reports;
