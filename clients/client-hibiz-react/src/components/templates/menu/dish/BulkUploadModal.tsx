import { useState } from "react";
import { HiX } from "react-icons/hi";
import { FiDownload } from "react-icons/fi";
import { BiUpload } from "react-icons/bi";

interface BulkUploadModalProps {
  onClose: () => void;
  onUpload: (file: File) => void;
  isLoading: boolean;
}

const BulkUploadModal = ({
  onClose,
  onUpload,
  isLoading,
}: BulkUploadModalProps) => {
  const [file, setFile] = useState<File | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (file) {
      onUpload(file);
    }
  };

  const downloadTemplate = () => {
    // Create CSV content with portions example
    const csvContent =
      "name,price,dishTypes,description,portions\n" +
      "Butter Chicken,299,NON_VEG,Creamy tomato-based curry with tender chicken pieces,Regular:299:NON_VEG:true|Large:399:NON_VEG:false|Family:599:NON_VEG:false\n" +
      "Paneer Tikka,249,VEG,Grilled cottage cheese with spices,Half:249:VEG:true|Full:399:VEG:false\n" +
      "Veg Biryani,199,VEG,Fragrant rice dish with mixed vegetables,\n" +
      "Egg Curry,179,EGG,Boiled eggs in a spicy curry sauce,Small:179:EGG:true|Large:279:EGG:false\n" +
      "Mushroom Risotto,349,VEGAN,Italian rice dish with mushrooms,\n" +
      "Wine Pasta,399,ALCOHOL,Pasta cooked with wine sauce,\n" +
      "Gluten-Free Pizza,299,GLUTEN_FREE,Pizza made with gluten-free base,Regular:299:GLUTEN_FREE:true|Large:399:GLUTEN_FREE:false\n" +
      "Special Thali,499,MIX,Combination of veg and non-veg items,";

    // Create a blob and download link
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);

    link.setAttribute("href", url);
    link.setAttribute("download", "dish_upload_template.csv");
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="w-full max-w-2xl p-6 mx-4 bg-white rounded-xl max-h-[90vh] overflow-y-auto hide-scrollbar">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Bulk Upload Dishes</h2>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-gray-100"
            type="button"
          >
            <HiX size={20} />
          </button>
        </div>

        <div className="mb-6">
          <h3 className="mb-3 font-medium text-gray-800">Required Format</h3>
          <div className="p-4 mb-4 overflow-auto bg-gray-50 rounded-lg">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="px-3 py-2 font-medium text-left text-gray-700">
                    name*
                  </th>
                  <th className="px-3 py-2 font-medium text-left text-gray-700">
                    price*
                  </th>
                  <th className="px-3 py-2 font-medium text-left text-gray-700">
                    dishTypes*
                  </th>
                  <th className="px-3 py-2 font-medium text-left text-gray-700">
                    description
                  </th>
                  <th className="px-3 py-2 font-medium text-left text-gray-700">
                    portions
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-gray-100">
                  <td className="px-3 py-2 text-gray-600">Butter Chicken</td>
                  <td className="px-3 py-2 text-gray-600">299</td>
                  <td className="px-3 py-2 text-gray-600">NON_VEG</td>
                  <td className="px-3 py-2 text-gray-600">
                    Creamy tomato curry...
                  </td>
                  <td className="px-3 py-2 text-gray-600">
                    Regular:299:NON_VEG:true|Large:399:NON_VEG:false
                  </td>
                </tr>
                <tr className="border-b border-gray-100">
                  <td className="px-3 py-2 text-gray-600">Paneer Tikka</td>
                  <td className="px-3 py-2 text-gray-600">249</td>
                  <td className="px-3 py-2 text-gray-600">VEG</td>
                  <td className="px-3 py-2 text-gray-600">
                    Grilled cottage cheese...
                  </td>
                  <td className="px-3 py-2 text-gray-600">
                    Half:249:VEG:true|Full:399:VEG:false
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="p-4 mb-4 text-sm bg-blue-50 rounded-lg border border-blue-200">
            <p className="font-medium text-blue-800 mb-2">
              📋 Important Guidelines:
            </p>
            <ul className="pl-5 space-y-1 list-disc text-blue-700">
              <li>
                Fields marked with <span className="font-medium">*</span> are
                required
              </li>
              <li>
                <span className="font-medium">Valid dishTypes:</span> VEG,
                NON_VEG, EGG, VEGAN, ALCOHOL, NON_ALCOHOL
                (case insensitive, spaces and underscores accepted)
              </li>
              <li>
                <span className="font-medium">Price:</span> Enter numbers only
                (without ₹ or currency symbols)
              </li>
              <li>
                <span className="font-medium">Description:</span> Optional,
                maximum 190 characters
              </li>
              <li>
                <span className="font-medium">Portions format:</span>{" "}
                name:price:type:isDefault|name:price:type:isDefault
              </li>
              <li>
                <span className="font-medium">File formats:</span> .csv, .xlsx,
                .xls are supported
              </li>
            </ul>
          </div>

          <div className="p-4 mb-4 text-sm bg-gray-50 rounded-lg border border-gray-200">
            <p className="font-medium text-gray-800 mb-2">
              🍽️ Dish Type Examples:
            </p>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              <div className="p-2 bg-white rounded border border-gray-200">
                <span className="font-medium">Vegetarian:</span> VEG, veg
              </div>
              <div className="p-2 bg-white rounded border border-gray-200">
                <span className="font-medium">Non-Vegetarian:</span> NON_VEG,
                non-veg, non veg
              </div>
              <div className="p-2 bg-white rounded border border-gray-200">
                <span className="font-medium">Egg:</span> EGG, egg
              </div>
              <div className="p-2 bg-white rounded border border-gray-200">
                <span className="font-medium">Vegan:</span> VEGAN, vegan
              </div>
              <div className="p-2 bg-white rounded border border-gray-200">
                <span className="font-medium">Alcohol:</span> ALCOHOL, alcohol
              </div>
              <div className="p-2 bg-white rounded border border-gray-200">
                <span className="font-medium">Non-Alcohol:</span> NON_ALCOHOL,
                non_alcohol
              </div>
              <div className="p-2 bg-white rounded border border-gray-200">
                <span className="font-medium">Gluten-Free:</span> GLUTEN_FREE,
                glutenfree
              </div>
              <div className="p-2 bg-white rounded border border-gray-200">
                <span className="font-medium">Mixed:</span> MIX, mix
              </div>
            </div>
          </div>

          <div className="p-4 mb-4 text-sm bg-amber-50 rounded-lg border border-amber-200">
            <p className="font-medium text-amber-800 mb-2">
              🍲 Portions Format:
            </p>
            <p className="mb-2 text-amber-700">
              Format:{" "}
              <code className="bg-white px-1 py-0.5 rounded">
                name:price:type:isDefault
              </code>{" "}
              separated by pipes (|)
            </p>
            <div className="bg-white p-3 rounded border border-amber-200 mb-2">
              <p className="font-medium text-amber-800">Example:</p>
              <code className="text-amber-700 break-all">
                Regular:299:NON_VEG:true|Large:399:NON_VEG:false|Family:599:NON_VEG:false
              </code>
            </div>
            <ul className="pl-5 space-y-1 list-disc text-amber-700">
              <li>
                <span className="font-medium">name:</span> Portion name (e.g.,
                Small, Regular, Large)
              </li>
              <li>
                <span className="font-medium">price:</span> Portion price
                (numbers only)
              </li>
              <li>
                <span className="font-medium">type:</span> Same dish types as
                above
              </li>
              <li>
                <span className="font-medium">isDefault:</span> true or false
                (first portion is default if not specified)
              </li>
            </ul>
          </div>

          <button
            onClick={downloadTemplate}
            className="flex items-center px-4 py-2 mb-4 text-sm font-medium text-blue-700 bg-blue-100 rounded-lg hover:bg-blue-200 transition-colors"
            type="button"
          >
            <FiDownload className="mr-2" size={16} /> Download Sample Template
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="mb-6">
            <label className="block mb-2 text-sm font-medium text-gray-700">
              Upload Your Excel/CSV File
            </label>
            <div className="relative">
              <input
                type="file"
                accept=".csv,.xlsx,.xls"
                onChange={handleFileChange}
                className="w-full px-3 py-3 text-sm border-2 border-dashed border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8C63FF] focus:border-[#8C63FF] hover:border-gray-400 transition-colors"
                required
              />
              {file && (
                <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded text-sm text-green-700">
                  ✅ Selected: {file.name}
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              disabled={isLoading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex items-center px-6 py-2 text-sm font-medium text-white rounded-lg bg-[#7D68FE] hover:bg-[#6a57d3] disabled:bg-[#b3a8f8] disabled:cursor-not-allowed transition-colors"
              disabled={!file || isLoading}
            >
              {isLoading ? (
                <>
                  <svg
                    className="w-4 h-4 mr-2 animate-spin"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                      fill="none"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  Uploading...
                </>
              ) : (
                <>
                  <BiUpload className="mr-2" size={16} /> Upload Dishes
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BulkUploadModal;
