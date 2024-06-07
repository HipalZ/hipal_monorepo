import { useSelectedButtonStore } from '@/components/store/useSelectBtn';
import type { IData } from '@/components/types/businessData';
import { memo, startTransition, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const DashboardCard = memo(({ title, count, onClick }: { title: string; count: number; onClick: () => void }) => (
  <div onClick={onClick} className="flex flex-col items-center justify-center space-y-4 rounded-md border border-[#cacaca] bg-white p-4">
    <h2 className="text-lg font-medium">{title}</h2>
    <p className="text-xl font-semibold">{count}</p>
  </div>
));

const DashboardContent = memo(({ data }: { data: IData }) => {
  const navigate = useNavigate();
  const setSelectedButton = useSelectedButtonStore((s) => s.setSelectedButton);
  const totalCategories = data.categories ? data.categories.length : 0;
  const totalAddOns = data.addOns ? data.addOns.length : 0;
  const totalDishes = data.dishes ? data.dishes.length : 0;

  const dashboardItems = [
    { title: 'Categories', count: totalCategories },
    { title: 'Add Ons', count: totalAddOns },
    { title: 'Dish', count: totalDishes },
    { title: 'Quick Menu', count: 0 },
  ];
  const handleCardClick = (title: string) => {
    setSelectedButton(title);
  };

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get('tab') !== 'Dashboard') {
      params.set('tab', 'Dashboard');
      startTransition(() => {
        navigate({ search: params.toString() }, { replace: true });
      });
    }
  }, [location, navigate]);

  return (
    <div className="p-4">
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
        {dashboardItems.map((item) => (
          <DashboardCard key={item.title} title={item.title} count={item.count} onClick={() => handleCardClick(item.title)} />
        ))}
      </div>
    </div>
  );
});

export default DashboardContent;
