import DateRangePicker from '@/components/molecules/dateRangePicker/index.tsx';
import MemoizedHeader from '@/components/molecules/header/index.tsx';
import AddonReports from '@/components/reports/AddOnReports.tsx';
import CategoryReports from '@/components/reports/CategoryReports.tsx';
import MultiReportDownloadButton from '@/components/reports/CombinedReport';
import DeletedItemsReports from '@/components/reports/DeletedItemReport';
import DiscountReports from '@/components/reports/DiscountReport.tsx';
import DishTypeReports from '@/components/reports/DishTypeReports.tsx';
import ItemReports from '@/components/reports/ItemReports.tsx';
import ItemVariantReports from '@/components/reports/ItemVariantReports.tsx';
import ParentCategoryReports from '@/components/reports/ParentCategoryReports.tsx';
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
  ItemVariant = 'itemVariant',
  DishType = 'dishType',
  Discount = 'discount',
  ServiceCharge = 'serviceCharge',
  AddOn = 'addOn',
  Deleted = 'deleted_items',
}

const navItems = [
  { text: 'Combined' },
  { text: 'Category' },
  { text: 'Parent Category' },
  { text: 'Item' },
  { text: 'Item Variant' },
  { text: 'Dish Type' },
  { text: 'Add On' },
  { text: 'Discount' },
  { text: 'Service Charge' },
  { text: 'Deleted Items' },
];

const normalizeNavKey = (s: string) => s.toLowerCase().replace(/\s+/g, '');

const navKeyToReportType: Record<string, ReportsTypes> = {
  combined: ReportType.Combined,
  category: ReportType.Category,
  parentcategory: ReportType.ParentCategory,
  item: ReportType.Item,
  itemvariant: ReportType.ItemVariant,
  dishtype: ReportType.DishType,
  discount: ReportType.Discount,
  servicecharge: ReportType.ServiceCharge,
  addon: ReportType.AddOn,
  deleteditems: ReportType.Deleted,
};

const Reports = () => {
  const businessId = useParams().businessId;
  const navigate = useNavigate();
  const reportPage = useReports((s) => s.reportPage);
  const setReportPage = useReports((s) => s.setReportPage);

  const changeLayout = useCallback(
    (text: string) => {
      const key = normalizeNavKey(text);
      const reportType = navKeyToReportType[key] ?? (key as ReportsTypes);
      setReportPage(reportType);
    },
    [setReportPage],
  );

  const selectedNavLabel =
    navItems.find((item) => navKeyToReportType[normalizeNavKey(item.text)] === reportPage)?.text ?? reportPage ?? '';

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
      <UniversalNav items={navItems} selectedNavItem={selectedNavLabel} changeNav={changeLayout} />
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
      {reportPage === ReportType.ItemVariant && (
        <div>
          <ItemVariantReports />
        </div>
      )}
      {reportPage === ReportType.DishType && (
        <div>
          <DishTypeReports />
        </div>
      )}
      {reportPage === ReportType.AddOn && (
        <div>
          <AddonReports />
        </div>
      )}
      {reportPage === ReportType.Discount && (
        <div>
          <DiscountReports />
        </div>
      )}
      {reportPage === ReportType.ServiceCharge && (
        <div>
          <ServiceChargeReports />
        </div>
      )}
      {reportPage === ReportType.Deleted && (
        <div>
          <DeletedItemsReports />
        </div>
      )}
    </main>
  );
};

export default Reports;
