import { useWhatsappTempStore } from "@/components/store/useWhatsappTempStore";
import { lazy, memo } from "react";
import toast from "react-hot-toast";
import { FILTER_OPTIONS, formatDate } from "@/components/utils/helper";

const MiddlePopUp = lazy(() => import("@/components/atom/middlePopUp"));

const MemoExportOptions = () => {
  const { openExport, setOpenExport, campaignsData } = useWhatsappTempStore(
    (s) => ({
      openExport: s.openExport,
      setOpenExport: s.setOpenExport,
      campaignsData: s.campaignsData,
    }),
  );

  const handleExport = async (option: string) => {
    setOpenExport(false);

    if (option === "all") {
      // Export all data
      if (campaignsData?.campaignAnalytics.length === 0) {
        return toast.error("No data available for this campaign.");
      }
      downloadCSV(campaignsData?.campaignAnalytics, "all_campaign_data.csv");
    } else {
      // Export filtered data
      const filtered = campaignsData.campaignAnalytics.filter(
        (item) => item.status === option,
      );
      if (filtered.length === 0) {
        return toast.error(`No ${option} data available.`);
      }
      downloadCSV(filtered, `${option}_data.csv`);
    }
  };
  const downloadCSV = (data: any[], filename: string) => {
    // Define the order of fields in the CSV
    const fields = ["name", "phone", "status", "date"];

    // Create the CSV header
    const header = fields.join(",");

    // Create the CSV rows
    const csvRows = data.map((row) =>
      fields
        .map((field) => {
          let value =
            field === "date" ? formatDate(row[field]) : row[field] || "";
          if (value.toString().includes(",")) {
            value = `"${value}"`;
          }
          return value;
        })
        .join(","),
    );

    // Combine header and rows
    const csvContent = [header, ...csvRows].join("\n");

    // Create a Blob with the CSV content
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });

    // Create a download link
    const link = document.createElement("a");
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute("download", filename);
      link.style.visibility = "hidden";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <MiddlePopUp
      onlyPopUp
      show={openExport}
      onClose={() => setOpenExport(false)}
    >
      <div className="p-4 space-y-4">
        <article className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">
            Export Options
          </h3>
          <button
            className="p-2 text-white bg-red-500 rounded-lg on_active_bounce"
            type="button"
            onClick={() => setOpenExport(false)}
          >
            Cancel
          </button>
        </article>
        <ul className="divide-y divide-gray-200">
          {FILTER_OPTIONS.map((option) => (
            <li key={option.id}>
              <button
                type="button"
                onClick={() => handleExport(option.status)}
                className="flex items-center justify-between w-full p-3 text-left transition-all rounded-md hover:bg-gray-300 focus:ring-2 focus:ring-indigo-500"
                title={!option.count ? "No data available for export" : ""}
              >
                <div className="flex items-center gap-3">
                  <div className="text-gray-700">
                    <option.icon className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {option.label}
                    </p>
                    <p className="mt-1 text-xs text-gray-600">
                      {option.description}
                    </p>
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
