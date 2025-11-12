import { motion } from 'framer-motion';
import { FolderTree, Layers, UtensilsCrossed } from 'lucide-react';
import { memo } from 'react';

type Props = {
  categoriesCount: number;
  subcategoriesCount: number;
  dishesCount: number;
  isLoading?: boolean;
};

const StatCard = ({
  icon: Icon,
  label,
  value,
  gradient,
  isLoading,
}: {
  icon: any;
  label: string;
  value: number | string;
  gradient: string;
  isLoading?: boolean;
}) => {
  return (
    <motion.div
      whileHover={{ y: -2 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white/90 p-4 shadow-sm backdrop-blur-sm"
    >
      {/* subtle gradient glow */}
      <div
        className={`pointer-events-none absolute -inset-px rounded-2xl opacity-0 blur-lg transition-opacity duration-300 group-hover:opacity-60 ${gradient}`}
      />

      <div className="relative z-10 flex items-center gap-4">
        <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${gradient} text-white shadow-sm`}>
          <Icon size={22} />
        </div>
        <div>
          <p className="text-[12px] font-medium uppercase tracking-wide text-slate-500">{label}</p>
          {isLoading ? (
            <div className="mt-1 h-6 w-16 animate-pulse rounded-md bg-slate-200" />
          ) : (
            <p className="mt-1 text-2xl font-semibold tabular-nums text-slate-900">{value}</p>
          )}
        </div>
      </div>

      {/* bottom accent line */}
      <div className={`absolute bottom-0 left-0 right-0 h-[3px] opacity-60 ${gradient}`} />
    </motion.div>
  );
};

const MenuStatsStrip = ({ categoriesCount, subcategoriesCount, dishesCount, isLoading }: Props) => {
  return (
    <div className="px-4">
      <div className="mb-4">
        <div className="grid grid-cols-2 gap-4">
          {/* <StatCard
            icon={FolderTree}
            label="Categories"
            value={categoriesCount}
            isLoading={isLoading}
            gradient="bg-gradient-to-br from-indigo-500 to-violet-500"
          /> */}
          <StatCard
            icon={Layers}
            label="Subcategories"
            value={subcategoriesCount}
            isLoading={isLoading}
            gradient="bg-gradient-to-br from-teal-500 to-emerald-500"
          />
          <StatCard
            icon={UtensilsCrossed}
            label="Dishes"
            value={dishesCount}
            isLoading={isLoading}
            gradient="bg-gradient-to-br from-rose-500 to-orange-500"
          />
        </div>
      </div>
    </div>
  );
};

export default memo(MenuStatsStrip);
