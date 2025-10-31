import { handleRemoveAlert } from '@/components/hooks/commonApi';
import { useHiClientZ } from '@/components/store/useHiClientzData';
import { useLiteStore } from '@/components/store/useLiteStore';
import type { Alert } from '@/components/types/hiClientzData';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { cn, timestampToDateTime, useErrorHandling } from '@/components/utils/helpers';
import { apiRpc } from '@hi/common';
import { AnimatePresence, motion } from 'framer-motion';
import { memo } from 'react';
import { IoCloseCircleSharp } from 'react-icons/io5';
import { MdOutlineTableBar } from 'react-icons/md';

interface IOnlineProp {
  onlineAlertData: Alert[];
}

const OnlineAlertCard = ({ onlineAlertData }: IOnlineProp) => {
  const { errorText } = useErrorHandling();

  const removeOnlineAlert = useLiteStore((s) => s.removeOnlineAlert);
  const removeOnlineCount = useLiteStore((s) => s.removeOnlineCount);
  const setViewData = useLiteStore((s) => s.setViewData);
  const captainData = useHiClientZ((s) => s.captainData);
  const setClickViewMore = useLiteStore((s) => s.setClickViewMore);

  const removeAlert = async (id: string) => {
    try {
      const res = await handleRemoveAlert(apiRpc, id, captainData?.name);
      if (res.status === 401) {
        return errorText();
      }
      if (res.status === 200) {
        removeOnlineAlert(id);
        removeOnlineCount();
      }
    } catch (error) {
      console.error('Error removing alert:', error);
    }
  };
  const handleViewMore = (alert: Alert) => {
    setViewData(alert);
    setClickViewMore(true);
  };

  return (
    <motion.main
      className="m-4 grid gap-4 pb-[5rem] md:mx-4 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <AnimatePresence>
        {Array.isArray(onlineAlertData) &&
          onlineAlertData.length > 0 &&
          onlineAlertData.map((alert) => (
            <motion.div
              key={alert?._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              layout
            >
              <Card className={cn('relative overflow-hidden', alert?.status === 'FAIL' ? 'border-red-200' : 'border-green-200')}>
                <CardContent className="p-4">
                  <div className="-ml-4 -mt-4 mb-4 flex items-center justify-between">
                    <Badge
                      variant={alert?.status === 'FAIL' ? 'destructive' : 'default'}
                      className="rounded-none text-base font-medium capitalize md:text-lg"
                    >
                      {alert?.alertType?.split('_').join(' ').toLowerCase()}
                    </Badge>
                    <span className="text-muted-foreground text-sm font-semibold">{timestampToDateTime(alert?.date)}</span>
                  </div>
                  <div className="mb-2 flex items-start justify-between">
                    <h3 className="text-2xl font-bold">
                      {alert?.order_id?.discount > 0 || alert?.order_id?.claimedCoins > 0 ? (
                        <span className="text-muted-foreground mr-2 text-sm line-through">₹ {alert?.order_id?.billValue}</span>
                      ) : null}
                      ₹ {alert?.order_id?.total}
                    </h3>
                    <div className="flex items-center space-x-2 text-right">
                      <MdOutlineTableBar size={28} />
                      <h4 className="text-lg font-semibold">{alert?.tableName}</h4>
                    </div>
                  </div>
                  <span className="text-foreground font-semibold opacity-60">{alert?.userId?.name || 'customer'}</span>
                </CardContent>
                <CardFooter className={cn('flex items-center justify-between p-4', alert?.status === 'FAIL' ? 'bg-red-100' : 'bg-green-100')}>
                  {alert.alertType !== 'OFFLINE' && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-destructive hover:text-destructive bg-destructive/10"
                      onClick={() => removeAlert(alert?._id)}
                    >
                      <IoCloseCircleSharp className="mr-2 h-4 w-4" />
                      Remove
                    </Button>
                  )}
                  <Button variant="outline" size="sm" onClick={() => handleViewMore(alert)} className="font-semibold">
                    View Details
                  </Button>
                </CardFooter>
              </Card>
            </motion.div>
          ))}
      </AnimatePresence>
    </motion.main>
  );
};

const OnlineAlertCardMemo = memo(OnlineAlertCard);
export default OnlineAlertCardMemo;
