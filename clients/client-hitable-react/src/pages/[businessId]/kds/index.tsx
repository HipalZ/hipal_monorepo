import { KotDashboard } from '@/components/kds/KotDashboard';

const KDS = () => {
  // pass from state/route in real app
  const kitchenId = '68f1fa0506ccebf9f86dfd05';
  return (
    <div className="min-h-screen bg-black/10 p-4 dark:bg-zinc-900">
      <KotDashboard kitchenId={kitchenId} />
    </div>
  );
};
export default KDS;
