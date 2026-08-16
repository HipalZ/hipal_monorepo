import useBusinessData from '@/components/store/useBusinessData';
import { useHiClientZ } from '@/components/store/useHiClientzData';
import { useHotelStore } from '@/components/store/useHotelStore';
import { apiRpc } from '@hi/common';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import toast from 'react-hot-toast';

export interface CheckoutTask {
  _id: string;
  roomId?: { _id: string; name?: string };
  serviceId?: { _id: string; name?: string; image?: string };
  acceptedBy?: { _id: string; name?: string };
  status: 'PENDING' | 'ACCEPTED' | 'COMPLETED' | 'CANCELLED';
  stage: 'FLOOR' | 'ALL_FLOORS' | 'MANAGER';
  acceptMins: number;
  completeMins: number;
  createdAt: number;
  acceptDueAt: number;
  completeDueAt?: number;
  acceptedAt?: number;
  cancelledAt?: number;
  cancelledBy?: { _id: string; name?: string };
  cancelReason?: string;
  escalatedAt?: number;
}

const TASKS_KEY = 'checkoutTasks';

/** Tasks offered to this staff member, plus anything they already accepted. */
export const useMyCheckoutTasks = (businessId?: string, userId?: string) => {
  const { data, isLoading, refetch } = useQuery({
    queryKey: [TASKS_KEY, businessId, userId],
    enabled: Boolean(businessId && userId),
    refetchInterval: 3000,
    queryFn: async (): Promise<CheckoutTask[]> => {
      const res = await apiRpc.hotel.checkout_task.my_tasks.$get({
        query: { businessId: businessId as string, userId: userId as string },
      });
      const json = await res.json();
      return (json?.data as CheckoutTask[]) ?? [];
    },
  });
  return { tasks: data ?? [], isLoading, refetch };
};

/**
 * Global poller that keeps the staff's open turnover-task count in the store,
 * so the Alerts nav badge reflects checkout tasks the same way it reflects
 * guest alerts. Shares the `my_tasks` query key, so mounting it alongside the
 * alerts screen costs no extra fetch. Mount once, at the app root.
 */
export const useCheckoutTaskCount = () => {
  const businessId = useBusinessData((s) => s.outletInfo?.businessId);
  const userId = useHiClientZ((s) => s.captainData?._id);
  const setHotelCheckoutCount = useHotelStore((s) => s.setHotelCheckoutCount);
  const { tasks } = useMyCheckoutTasks(businessId, userId);

  useEffect(() => {
    setHotelCheckoutCount(tasks.length);
  }, [tasks.length, setHotelCheckoutCount]);
};

export const useCheckoutTaskActions = (businessId?: string, userId?: string) => {
  const queryClient = useQueryClient();
  const invalidate = () => queryClient.invalidateQueries({ queryKey: [TASKS_KEY, businessId, userId] });

  const accept = useMutation({
    mutationFn: async (taskId: string) => {
      const res = await apiRpc.hotel.checkout_task.accept.$post({ json: { taskId, userId: userId as string } });
      const json = await res.json();
      // 409 means somebody on the floor beat you to it — not an error state.
      if (res.status === 409) throw new Error(json?.message || 'Already accepted by someone else');
      if (res.status !== 200) throw new Error(json?.message || 'Could not accept');
      return json?.data;
    },
    onSuccess: () => {
      toast.success('Task accepted');
      invalidate();
    },
    onError: (e: unknown) => {
      toast.error(e instanceof Error ? e.message : 'Could not accept');
      invalidate(); // pull the winner's state so the card corrects itself
    },
  });

  const complete = useMutation({
    mutationFn: async (taskId: string) => {
      const res = await apiRpc.hotel.checkout_task.complete.$post({ json: { taskId, userId: userId as string } });
      const json = await res.json();
      if (res.status !== 200) throw new Error(json?.message || 'Could not complete');
      return json?.data;
    },
    onSuccess: () => {
      toast.success('Marked complete');
      invalidate();
    },
    onError: (e: unknown) => toast.error(e instanceof Error ? e.message : 'Could not complete'),
  });

  const reject = useMutation({
    mutationFn: async ({ taskId, reasonOfRejection }: { taskId: string; reasonOfRejection: string }) => {
      const res = await apiRpc.hotel.checkout_task.cancel.$post({
        json: { taskId, userId: userId as string, reasonOfRejection },
      });
      const json = await res.json();
      if (res.status !== 200) throw new Error(json?.message || 'Could not reject');
      return json?.data;
    },
    onSuccess: () => {
      toast.success('Task rejected');
      invalidate();
      queryClient.invalidateQueries({ queryKey: ['checkoutTasksActive', businessId] });
    },
    onError: (e: unknown) => {
      toast.error(e instanceof Error ? e.message : 'Could not reject');
      invalidate();
    },
  });

  return { accept, complete, reject };
};

/**
 * The set of room ids that currently have an open checkout task, business-wide.
 * The room grid uses this to paint a checked-out room as "Cleaning" until
 * housekeeping finishes — without ever changing the room's real status, so
 * booking is never blocked. Polls on the same cadence as the escalation sweep.
 */
export const useCleaningRoomIds = (businessId?: string): Set<string> => {
  const { data } = useQuery({
    queryKey: ['checkoutTasksActive', businessId],
    enabled: Boolean(businessId),
    refetchInterval: 30_000,
    queryFn: async (): Promise<CheckoutTask[]> => {
      const res = await apiRpc.hotel.checkout_task.active.$get({ query: { businessId: businessId as string } });
      const json = await res.json();
      return (json?.data as CheckoutTask[]) ?? [];
    },
  });
  return new Set((data ?? []).map((t) => t.roomId?._id).filter(Boolean) as string[]);
};

/**
 * Raise the configured checkout services for a room. Called right after a
 * successful checkout — deliberately swallows its own failures so a problem
 * here can never surface as a failed checkout.
 */
export const triggerCheckoutTasks = async (args: {
  businessId: string;
  roomId: string;
  triggeredBy?: string;
  checkoutAt?: number;
  guestName?: string;
  guestPhone?: string;
}): Promise<number> => {
  try {
    const res = await apiRpc.hotel.checkout_task.trigger.$post({ json: args as never });
    const json = await res.json();
    return Number(json?.data?.raised ?? 0);
  } catch (error) {
    console.error('[checkoutTask:trigger] failed', error);
    return 0;
  }
};
