import Kitchen from "@/components/templates/kitchen/index.tsx";
import { useGetAllKitchens } from "@/hooks/useKItchenHook.ts";
import MemoizedHeader from "@/components/molecules/header";
const KitchenPage = () => {
  const { kitchenData, kitchenLoading } = useGetAllKitchens();

  return (
    <main>
      <header className="linear_gradient_background">
        <MemoizedHeader title="Kitchen" />
      </header>
      <Kitchen kitchenData={kitchenData} />
    </main>
  );
};

export default KitchenPage;
