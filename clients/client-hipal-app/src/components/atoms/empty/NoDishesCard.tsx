"use client";

export default function NoDishesCard({
  title = "No dishes found",
  subtitle = "Try applying a different filter or category.",
  onClear,
}: {
  title?: string;
  subtitle?: string;
  onClear: () => void;
}) {
  return (
    <div className="w-full flex justify-center items-center py-16">
      <div className="text-center bg-white p-6 rounded-xl shadow-sm border">
        <h3 className="text-xl font-semibold text-gray-700">{title}</h3>
        <p className="text-gray-500 text-sm mt-1">{subtitle}</p>

        <button
          onClick={onClear}
          className="mt-4 px-4 py-2 bg-black text-white rounded-lg text-sm hover:bg-gray-800 transition"
        >
          Remove filter
        </button>
      </div>
    </div>
  );
}
