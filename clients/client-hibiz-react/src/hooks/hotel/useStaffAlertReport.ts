import { apiRpc } from "@hi/common";
import { useQuery } from "@tanstack/react-query";

export interface StaffAlertReportQueryPayload {
  businessId: string;
  from: string;
  to: string;
  staffId: string;
}

export interface StaffAlertReportOverAll {
  totalOnTimeCount: number;
  totalServiceActionCount: number;
  totalAvgCompletionMinutes: number;
  totalAvgSlaMinutes: number;
}

export interface StaffAlertReportItem {
  staffName: string;
  acceptanceOnTime: number;
  acceptanceTotal: number;
  acceptancePercent: number;
  completionOnTime: number;
  completionTotal: number;
  completionPercent: number;
  overallPerformanceScore: string;
  efficiencyPercent: number;
  servicesHandled: number;
}

export interface StaffAlertReportPlotValue {
  onTime: number;
  late: number;
}

export interface StaffAlertReportData {
  overAll: StaffAlertReportOverAll;
  report: StaffAlertReportItem[];
  plotValue: StaffAlertReportPlotValue;
}

export const useStaffAlertReport = (payload: StaffAlertReportQueryPayload) => {

  const staffAlertReport = async () => {
    const response = await apiRpc.hotel.alert.staff_alert_report.$get({
      query: payload,
    });

    const res = await response.json(); 

    const staffReport = res.data as StaffAlertReportData;
    return staffReport;
  };

  const queryKey = [
    "staffAlertReport",
    payload.businessId,
    payload.from,
    payload.to,
    payload.staffId,
  ];

  const { data, isLoading, refetch } = useQuery({
    queryKey: queryKey,
    queryFn: staffAlertReport,
    enabled: !!payload.businessId && !!payload.from && !!payload.to,
  });

  return { data, isLoading, refetch };
};
