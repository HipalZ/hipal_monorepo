import { cn, hideMiddleNumbers } from '@/lib/utils';
import { Phone } from 'lucide-react';
import type { FC } from 'react';
import { memo } from 'react';
import { FiCopy } from 'react-icons/fi';
import { MdOutlineCall } from 'react-icons/md';
import type { PhoneActionsProps } from './bill.types.ts';

const PhoneActions: FC<PhoneActionsProps> = memo(({ customerPhone, customerName, isPhoneVerified, copyTick, onProtectedAction }) => {
  return (
    <div className="mb-2 space-y-2">
      <div className="flex w-[70%] items-start gap-2">
        <Phone className="h-5 w-5 text-gray-600" />
        <div className="flex flex-1 items-center gap-2">
          <p className="text-sm text-gray-700">
            {customerName} ({isPhoneVerified ? customerPhone : hideMiddleNumbers(customerPhone || '')})
          </p>
          {customerPhone && (
            <div className="flex items-center gap-1">
              <button
                type="button"
                className={cn('rounded p-1 text-xs', copyTick ? 'bg-green-100 text-green-600' : 'bg-purple-100 text-purple-600')}
                onClick={() => onProtectedAction('copy')}
              >
                <FiCopy className="h-3 w-3" />
              </button>
              <button type="button" className="rounded bg-blue-100 p-1 text-blue-600" onClick={() => onProtectedAction('call')}>
                <MdOutlineCall className="h-3 w-3" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
});

PhoneActions.displayName = 'PhoneActions';
export default PhoneActions;
