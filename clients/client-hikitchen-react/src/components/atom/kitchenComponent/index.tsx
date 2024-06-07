import { useKotStore } from '@/components/store/useKot';
import { GiKnifeFork } from 'react-icons/gi';
import { LiaFileContractSolid } from 'react-icons/lia';

function KitchenComponent({ allKots, cookingDishes }:{
    allKots:number,
    cookingDishes:number
}) {
  const filter = useKotStore((s) => s.filter);

  return (
    <div className="flex items-center justify-between px-6 pt-2 border-t border-[#cacaca]">
      <div className="text-lg font-semibold md:text-xl lg:text-2xl xl:text-3xl">{filter}</div>
      <div className="flex space-x-4">
        <div className="flex items-center font-semibold md:text-xl lg:text-2xl xl:text-2xl">
          <GiKnifeFork className="mr-1 text-sm md:text-base lg:text-xl xl:text-xl"  />
          <div> {cookingDishes} Dishes</div>
        </div>
        <div className="flex items-center font-semibold md:text-xl lg:text-2xl xl:text-2xl">
          <LiaFileContractSolid className="mr-1 text-base md:text-base lg:text-xl xl:text-xl" />
          <div>{allKots} KOT </div>
        </div>
      </div>
    </div>
  );
}

export default KitchenComponent;
