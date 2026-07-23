import { apiRpc } from '@hi/common';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';

/** One service in the checkout group, with the SLA this module applies to it. */
export interface CheckoutGroupService {
  serviceId: string | { _id: string; name?: string; image?: string; categoryId?: string };
  acceptMins: number;
  completeMins: number;
}

export interface CheckoutGroup {
  _id?: string;
  businessId: string;
  name: string;
  isActive: boolean;
  services: CheckoutGroupService[];
  floorWindowMins: number;
  widenToOtherFloors: boolean;
  otherFloorsWindowMins: number;
  notifyManager: boolean;
}

export interface CheckoutTask {
  _id: string;
  roomId?: { _id: string; name?: string };
  serviceId?: { _id: string; name?: string };
  acceptedBy?: { _id: string; name?: string };
  completedBy?: { _id: string; name?: string };
  /** The front-office user who performed the checkout that raised this. */
  triggeredBy?: { _id: string; name?: string; phone?: string };
  zoneId?: { _id: string; name?: string };
  status: 'PENDING' | 'ACCEPTED' | 'COMPLETED' | 'CANCELLED';
  stage: 'FLOOR' | 'ALL_FLOORS' | 'MANAGER';
  acceptMins: number;
  completeMins: number;
  /** The guest who checked out — captured so the report shows who stayed. */
  guestName?: string;
  guestPhone?: string;
  /** Every occupant at checkout, in room order: [0] primary, rest companions. */
  guests?: Array<{ userId?: string; name?: string; phone?: string }>;
  createdAt: number;
  acceptDueAt: number;
  completeDueAt?: number;
  acceptedAt?: number;
  completedAt?: number;
  escalatedAt?: number;
}

/** The id may arrive populated or raw depending on the endpoint. */
export const serviceIdOf = (s: CheckoutGroupService): string =>
  typeof s.serviceId === 'string' ? s.serviceId : s.serviceId._id;

export const DEFAULT_GROUP: Omit<CheckoutGroup, 'businessId'> = {
  name: 'Room checkout',
  isActive: true,
  services: [],
  floorWindowMins: 2,
  widenToOtherFloors: false,
  otherFloorsWindowMins: 2,
  notifyManager: true,
};

export const useCheckoutGroup = (businessId?: string) => {
  const { data, isLoading, refetch } = useQuery({
    queryKey: ['checkoutGroup', businessId],
    enabled: Boolean(businessId),
    queryFn: async (): Promise<CheckoutGroup | null> => {
      const res = await apiRpc.hotel.checkout_task.group.$get({ query: { businessId: businessId as string } });
      const json = await res.json();
      return (json?.data as CheckoutGroup) ?? null;
    },
  });
  return { group: data ?? null, isLoading, refetch };
};

export const useSaveCheckoutGroup = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: Partial<CheckoutGroup> & { businessId: string }) => {
      const res = await apiRpc.hotel.checkout_task.group.$post({ json: payload as never });
      const json = await res.json();
      if (res.status !== 200) throw new Error(json?.message || 'Could not save');
      return json?.data as CheckoutGroup;
    },
    onSuccess: (_d, vars) => {
      queryClient.invalidateQueries({ queryKey: ['checkoutGroup', vars.businessId] });
      toast.success('Checkout automation saved');
    },
    onError: (e: unknown) => toast.error(e instanceof Error ? e.message : 'Could not save'),
  });
};

/**
 * Completed + open tasks in a date range. The report reads this rather than the
 * alert history: checkout work lives in its own collection, so the two reports
 * can never double-count the same job.
 */
export const useCheckoutTaskHistory = (businessId?: string, from?: number, to?: number) => {
  const { data, isLoading } = useQuery({
    queryKey: ['checkoutTaskHistory', businessId, from, to],
    enabled: Boolean(businessId && from && to),
    queryFn: async (): Promise<CheckoutTask[]> => {
      const res = await apiRpc.hotel.checkout_task.history.$get({
        query: { businessId: businessId as string, from: String(from), to: String(to) },
      });
      const json = await res.json();
      return (json?.data as CheckoutTask[]) ?? [];
    },
  });
  return { tasks: data ?? [], isLoading };
};

/** Tasks currently open across the property — drives the live view. */
export const useActiveCheckoutTasks = (businessId?: string) => {
  const { data, isLoading } = useQuery({
    queryKey: ['checkoutTasksActive', businessId],
    enabled: Boolean(businessId),
    refetchInterval: 30_000,
    queryFn: async (): Promise<CheckoutTask[]> => {
      const res = await apiRpc.hotel.checkout_task.active.$get({ query: { businessId: businessId as string } });
      const json = await res.json();
      return (json?.data as CheckoutTask[]) ?? [];
    },
  });
  return { tasks: data ?? [], isLoading };
};
