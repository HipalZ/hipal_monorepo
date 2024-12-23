import { ArrowLeft } from "lucide-react";
import { DetailedAnalyticsPieChart } from "./detailedAnalytics";

function AnalyticsDetailsPage() {
  return (
    <main className="container p-6 mx-auto">
      <header className="flex items-center gap-4 mb-6">
        <a
          href="/analytics"
          className="p-2 transition-colors rounded-full hover:bg-gray-100"
          aria-label="Back to overview"
        >
          <ArrowLeft className="w-4 h-4" />
        </a>
        <div>
          <h1 className="text-2xl font-bold">Template_12JAN2024</h1>
          <p className="mt-1 text-sm text-gray-600">
            Hi This campaign is the best offers for this template.
          </p>
        </div>
      </header>

      <section
        className="grid grid-cols-2 gap-4 mb-8 md:grid-cols-5"
        aria-label="Detailed Statistics"
      >
        <article className="p-4 rounded-lg bg-red-50">
          <header className="mb-2">
            <h2 className="text-sm font-medium">Sent</h2>
          </header>
          <p className="text-2xl font-bold">555</p>
        </article>

        <article className="p-4 rounded-lg bg-green-50">
          <header className="mb-2">
            <h2 className="text-sm font-medium">Received</h2>
          </header>
          <p className="text-2xl font-bold">550</p>
        </article>

        <article className="p-4 rounded-lg bg-blue-50">
          <header className="mb-2">
            <h2 className="text-sm font-medium">Read</h2>
          </header>
          <p className="text-2xl font-bold">548</p>
        </article>

        <article className="p-4 rounded-lg bg-pink-50">
          <header className="mb-2">
            <h2 className="text-sm font-medium">Failed</h2>
          </header>
          <p className="text-2xl font-bold">2</p>
        </article>

        <article className="p-4 rounded-lg bg-gray-50">
          <header className="mb-2">
            <h2 className="text-sm font-medium">Block</h2>
          </header>
          <p className="text-2xl font-bold">5</p>
        </article>
      </section>

      <div className="grid gap-6 mb-8 md:grid-cols-2">
        <section className="p-6 border rounded-lg" aria-label="Analytics Chart">
          <div className="flex flex-col items-center gap-4">
            <div className="w-[300px] h-[300px]">
              <DetailedAnalyticsPieChart />
            </div>
            <p className="text-sm text-gray-600">Success percentage: 79%</p>
            <p className="text-sm text-gray-600">No of launch: 555</p>
          </div>
        </section>

        <section className="p-6 border rounded-lg" aria-label="Export Options">
          <h2 className="mb-4 text-lg font-semibold">Export Options</h2>
          <div className="space-y-4">
            <button
              type="button"
              className="w-full px-4 py-2 text-left border rounded-md hover:bg-gray-50"
            >
              Export all customers Data
            </button>
            <button
              type="button"
              className="w-full px-4 py-2 text-left border rounded-md hover:bg-gray-50"
            >
              Export this section Data
            </button>
            <div className="space-y-2">
              <button
                type="button"
                className="w-full px-4 py-1.5 text-left border rounded-md hover:bg-gray-50 text-sm"
              >
                Blocked
              </button>
              <button
                type="button"
                className="w-full px-4 py-1.5 text-left border rounded-md hover:bg-gray-50 text-sm"
              >
                Delivered
              </button>
              <button
                type="button"
                className="w-full px-4 py-1.5 text-left border rounded-md hover:bg-gray-50 text-sm"
              >
                Read
              </button>
              <button
                type="button"
                className="w-full px-4 py-1.5 text-left border rounded-md hover:bg-gray-50 text-sm"
              >
                Failed
              </button>
            </div>
          </div>
        </section>
      </div>

      <section className="border rounded-lg" aria-label="Phone Numbers">
        <header className="p-6 border-b">
          <h2 className="text-lg font-semibold">Table With Phone numbers</h2>
        </header>
        <div className="p-6">
          <table className="w-full" role="grid">
            <thead>
              <tr className="border-b">
                <th className="pb-4 text-left">Phone Number</th>
                <th className="pb-4 text-left">Data</th>
                <th className="pb-4 text-left">Status</th>
                <th className="pb-4 text-left">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {Array(5)
                .fill(null)
                .map((_, i) => (
                  <tr key={i?.toString()} className="border-b last:border-0">
                    <td className="py-4">9999999999</td>
                    <td className="py-4">Data</td>
                    <td className="py-4">
                      {
                        ["Blocked", "Delivered", "Read", "Failed", "Delivered"][
                          i
                        ]
                      }
                    </td>
                    <td className="py-4">
                      <button
                        type="button"
                        className="px-4 py-1.5 text-sm hover:bg-gray-100 rounded"
                      >
                        View
                      </button>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}

export default AnalyticsDetailsPage;
