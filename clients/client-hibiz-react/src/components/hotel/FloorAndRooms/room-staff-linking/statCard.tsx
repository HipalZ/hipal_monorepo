const StatCard = ({ label, value }: { label: string; value: number }) => {
  return (
    <div className="rounded-xl border bg-white p-2 flex items-center justify-between">
      <div className="text-base md:text-lg tracking-wide text-gray-500">
        {label}
      </div>
      <div className="text-base md:text-lg font-semibold text-gray-900">
        {value}
      </div>
    </div>
  );
};

export default StatCard;
