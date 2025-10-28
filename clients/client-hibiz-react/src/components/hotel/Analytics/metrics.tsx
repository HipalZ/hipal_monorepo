import { motion } from 'framer-motion';
import { cn } from '../../utils/helper';

type MetricItemProps = {
  title: string;
  percent: number;
  onTime: string;
  gradient: string;
};

function MetricItem({ title, percent, onTime, gradient }: MetricItemProps) {
  return (
    <div className="space-y-2">
      <div className="flex justify-between text-sm font-medium text-gray-700">
        <span>{title}</span>
        <span className="text-gray-900">{percent}%</span>
      </div>

      {/* Progress bar */}
      <div className="relative h-3 overflow-hidden rounded-full bg-gray-200">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${percent}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className={cn('h-full rounded-full bg-gradient-to-r', gradient)}
        />
      </div>

      <p className="text-xs text-gray-600">{onTime} tasks</p>
    </div>
  );
}

export default MetricItem;
