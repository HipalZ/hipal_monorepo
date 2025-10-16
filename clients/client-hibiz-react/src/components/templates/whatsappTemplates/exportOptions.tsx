import { useWhatsappTempStore } from '@/components/store/useWhatsappTempStore';
import { FILTER_OPTIONS, formatDate } from '@/components/utils/helper';
import { lazy, memo } from 'react';
import toast from 'react-hot-toast';

const MiddlePopUp = lazy(() => import('@/components/atom/middlePopUp'));

const MemoExportOptions = () => {
  const { openExport, setOpenExport, campaignsData } = useWhatsappTempStore((s) => ({
    openExport: s.openExport,
    setOpenExport: s.setOpenExport,
    campaignsData: s.campaignsData,
  }));

  const handleExport = async (option: string) => {
    setOpenExport(false);

    if (option === 'all') {
      // Export all data
      if (campaignsData?.campaignAnalytics.length === 0) {
        return toast.error('No data available for this campaign.');
      }
      downloadCSV(campaignsData?.campaignAnalytics, 'all_campaign_data.csv');
    } else {
      // Export filtered data
      const filtered = campaignsData.campaignAnalytics.filter((item) => item.status === option);
      if (filtered.length === 0) {
        return toast.error(`No ${option} data available.`);
      }
      downloadCSV(filtered, `${option}_data.csv`);
    }
  };
  const downloadCSV = (data: any[], filename: string) => {
    const fields = ['name', 'phone', 'status', 'date'];
    const header = fields.join(',');

    const csvRows = data.map((row) =>
      fields
        .map((field) => {
          let value = '';

          switch (field) {
            case 'name':
              value = row.name || row?.userId?.name || '';
              break;
            case 'phone':
              value = row.phone || row?.userId?.phone || '';
              break;
            case 'date':
              value = row.date ? formatDate(row.date) : '';
              break;
            default:
              value = row[field] || '';
          }

          // escape commas and quotes safely
          if (typeof value === 'string' && value.includes(',')) {
            value = `"${value.replace(/"/g, '""')}"`;
          }

          return value;
        })
        .join(','),
    );

    const csvContent = [header, ...csvRows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });

    const link = document.createElement('a');
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', filename);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <MiddlePopUp onlyPopUp show={openExport} onClose={() => setOpenExport(false)}>
      <div className="space-y-4 p-4">
        <article className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">Export Options</h3>
          <button className="on_active_bounce rounded-lg bg-red-500 p-2 text-white" type="button" onClick={() => setOpenExport(false)}>
            Cancel
          </button>
        </article>
        <ul className="divide-y divide-gray-200">
          {FILTER_OPTIONS.map((option) => (
            <li key={option.id}>
              <button
                type="button"
                onClick={() => handleExport(option.status)}
                className="flex w-full items-center justify-between rounded-md p-3 text-left transition-all hover:bg-gray-300 focus:ring-2 focus:ring-indigo-500"
                title={!option.count ? 'No data available for export' : ''}
              >
                <div className="flex items-center gap-3">
                  <div className="text-gray-700">
                    <option.icon className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{option.label}</p>
                    <p className="mt-1 text-xs text-gray-600">{option.description}</p>
                  </div>
                </div>
              </button>
            </li>
          ))}
        </ul>
      </div>
    </MiddlePopUp>
  );
};

const ExportOptions = memo(MemoExportOptions);
export default ExportOptions;
