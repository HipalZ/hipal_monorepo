import useBusinessData from '@/components/store/useBusinessData';
import useTimings from '@/components/store/useTimings';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useStaffServices, type StaffAlertReportData } from '@/hooks/hotel/useStaffAlertReport.ts';
import { motion } from 'framer-motion';
import { ChevronDown, Clock, Download, History, TrendingUp } from 'lucide-react';
import { useState } from 'react';
import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';
import PopUp from '../../atom/popUp';
import { cn } from '../../utils/helper';
import MetricItem from './metrics';
import ServicesData from './servicesData';

interface StaffPerformanceDashboardProps {
  data: StaffAlertReportData;
  isLoading: boolean;
}

export default function StaffPerformanceDashboard({ data, isLoading }: StaffPerformanceDashboardProps) {
  const { getStaffServices } = useStaffServices();
  const timeStampStart = useTimings((s) => s.timeStampStart);
  const timeStampEnd = useTimings((s) => s.timeStampEnd);
  const businessId = useBusinessData((s) => s.outletInfo?.businessId);
  const [servicesData, setServicesData] = useState<any[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // inside StaffPerformanceDashboard
  const handleServices = async (staff: any) => {
    setIsDialogOpen(true);

    const result = await getStaffServices({
      businessId: businessId || '',
      from: timeStampStart || 0,
      to: timeStampEnd || 0,
      staffId: staff.staffId,
    });
    setServicesData(Array.isArray(result) ? result : []);
  };

  if (isLoading) {
    return (
      <div className="bg-background flex min-h-screen items-center justify-center">
        <div className="space-y-4 text-center">
          <div className="border-primary mx-auto h-12 w-12 animate-spin rounded-full border-b-2" />
          <p className="text-muted-foreground">Loading performance data...</p>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="bg-background flex min-h-screen items-center justify-center">
        <div className="space-y-4 text-center">
          <div className="text-muted-foreground">No performance data available</div>
        </div>
      </div>
    );
  }

  const filteredData = data.report;

  const pieData = [
    {
      name: 'On Time',
      value: data.plotValue.onTime,
      color: 'hsl(142 76% 36%)',
    },
    { name: 'Late', value: data.plotValue.late, color: 'hsl(0 84% 60%)' },
  ];

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.5,
        ease: 'easeOut',
      },
    },
  };

  const exportToCSV = (data: any[], filename: string) => {
    if (!data.length) return;

    const escapeCsvValue = (value: unknown) => {
      const str = String(value ?? '');
      if (str.includes('"') || str.includes(',') || str.includes('\n')) {
        return `"${str.replace(/"/g, '""')}"`;
      }
      return str;
    };

    const headers = Object.keys(data[0]);
    const csvContent = [
      headers.map(escapeCsvValue).join(','),
      ...data.map((row) => headers.map((header) => escapeCsvValue(row[header])).join(',')),
    ].join('\n');

    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${filename}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  const formatFilenameDate = (timestamp?: number) => {
    if (!timestamp) return 'unknown-date';

    const parts = new Intl.DateTimeFormat('en-CA', {
      timeZone: 'Asia/Kolkata',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).formatToParts(new Date(timestamp));

    const getPart = (type: Intl.DateTimeFormatPartTypes) => parts.find((part) => part.type === type)?.value ?? '';
    return `${getPart('year')}-${getPart('month')}-${getPart('day')}`;
  };

  const staffAnalyticsFilename = `staff_analytics_${formatFilenameDate(timeStampStart)}-to-${formatFilenameDate(timeStampEnd)}`;

  return (
    <div className="bg-background min-h-screen space-y-2 p-4 md:p-6 lg:p-0">
      <div className="flex items-end justify-end gap-4">
        <Button onClick={() => exportToCSV(filteredData, staffAnalyticsFilename)} size="sm" className="gap-2 bg-blue-600 text-white hover:bg-blue-700">
          <Download className="h-4 w-4" />
          Download Report
        </Button>
      </div>
      <motion.div variants={containerVariants} initial="hidden" animate="visible" className="mx-auto max-w-7xl space-y-6">
        <section className="flex flex-col flex-wrap gap-4 lg:flex-row">
          {/* Key Metrics Cards */}
          <motion.div variants={itemVariants} initial="hidden" animate="visible" className="grid grid-cols-2 gap-6 md:grid-cols-2">
            {/* Total Services Card */}
            <motion.div whileHover={{ scale: 1.02 }} transition={{ duration: 0.2 }}>
              <Card className="border-l-primary border-l-4">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Total Services</CardTitle>
                  <ChevronDown className="text-muted-foreground h-4 w-4" />
                </CardHeader>
                <CardContent>
                  <div className="text-primary text-2xl font-bold">{data.overAll.totalServicesHandled}</div>
                  <p className="text-muted-foreground text-xs">Service actions completed</p>
                </CardContent>
              </Card>
            </motion.div>

            {/* On-Time Rate Card */}
            <motion.div whileHover={{ scale: 1.02 }} transition={{ duration: 0.2 }}>
              <Card className="border-l-chart-1 border-l-4">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">On-Time Rate</CardTitle>
                  <Clock className="text-muted-foreground h-4 w-4" />
                </CardHeader>
                <CardContent>
                  <div className="text-chart-1 text-2xl font-bold">
                    {Math.round((data.overAll.totalOnTimeCount / data.overAll.totalServiceActionCount) * 100)}%
                  </div>
                  <p className="text-muted-foreground text-xs">
                    {data.overAll.totalOnTimeCount} out of {data.overAll.totalServiceActionCount}
                  </p>
                </CardContent>
              </Card>
            </motion.div>

            {/* Avg Completion Card */}
            {/* <motion.div whileHover={{ scale: 1.02 }} transition={{ duration: 0.2 }}>
              <Card className="border-l-accent border-l-4">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Avg Completion</CardTitle>
                  <TrendingUp className="text-muted-foreground h-4 w-4" />
                </CardHeader>
                <CardContent>
                  <div className="text-foreground text-2xl font-bold">{data.overAll.totalAvgCompletionMinutes}m</div>
                  <p className="text-muted-foreground text-xs">Average completion time</p>
                </CardContent>
              </Card>
            </motion.div> */}

            {/* Avg SLA Time Card */}
            <motion.div whileHover={{ scale: 1.02 }} transition={{ duration: 0.2 }}>
              <Card className="border-l-secondary border-l-4">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Avg SLA Time</CardTitle>
                  <Clock className="text-muted-foreground h-4 w-4" />
                </CardHeader>
                <CardContent>
                  <div className="text-foreground text-2xl font-bold">{data.overAll.totalAvgSlaMinutes}m</div>
                  <p className="text-muted-foreground text-xs">Service level agreement</p>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>

          {/* Charts Section */}
          <motion.div variants={itemVariants} whileHover={{ scale: 1.01 }} transition={{ duration: 0.2 }} className="w-full flex-1">
            <Card className="relative p-0">
              <CardHeader className="absolute left-0">
                <CardTitle className="text-xl font-semibold">Performance Overview</CardTitle>
                <CardDescription>On-time vs Late service completion</CardDescription>
              </CardHeader>
              <CardContent className="py-6 pt-12 lg:pl-[13rem] lg:pt-6">
                <div className="flex h-[300px] flex-col gap-6 lg:h-[230px] lg:flex-row lg:items-center">
                  <div className="h-[240px] flex-1 lg:w-1/2">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={2} dataKey="value">
                          {pieData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </section>

        {/* Staff Performance Table */}
        <motion.div variants={itemVariants}>
          <Card className="rounded-xl border shadow-sm">
            <CardHeader>
              <CardTitle className="text-2xl font-semibold">Individual Staff Performance</CardTitle>
              <CardDescription>Detailed breakdown of each staff member's metrics</CardDescription>
            </CardHeader>

            <CardContent>
              <div className="space-y-6">
                {filteredData.map((staff, index) => (
                  <motion.div
                    key={staff.staffName}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1, type: 'spring', stiffness: 120 }}
                    whileHover={{ scale: 1.015, boxShadow: '0 8px 30px rgba(0,0,0,0.08)' }}
                    className="group rounded-2xl border bg-white/80 p-3 shadow-sm transition-all duration-300"
                  >
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleServices(staff)}
                      aria-label={`View service history for ${staff.staffName}`}
                      className="float-right text-base font-medium text-indigo-600 hover:text-indigo-700"
                    >
                      <History />
                      Service History
                    </Button>
                    <div className="mt-4 flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
                      {/* ---------- Staff Info ---------- */}
                      <div className="flex items-start gap-5">
                        {/* Avatar */}
                        <div className="shrink-0">
                          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-2xl font-bold text-white shadow-md">
                            {staff.staffName.charAt(0).toUpperCase()}
                          </div>
                        </div>

                        <div className="space-y-3">
                          <article className="flex items-center justify-between gap-4">
                            <h3 className="text-xl font-semibold text-gray-900">{staff.staffName}</h3>
                          </article>

                          <div className="flex flex-wrap items-center gap-2">
                            <Badge className="rounded-full bg-gradient-to-r from-cyan-500 to-teal-500 px-4 py-1.5 text-xs font-semibold text-white shadow-sm transition-transform hover:scale-105">
                              {staff.servicesHandled} Services Handled
                            </Badge>

                            <Badge
                              className={cn(
                                'rounded-full px-4 py-1.5 text-xs font-semibold text-white shadow-sm transition-transform hover:scale-105',
                                staff.overallPerformanceScore === 'on-time'
                                  ? 'bg-gradient-to-r from-green-500 to-emerald-600'
                                  : 'bg-gradient-to-r from-red-500 to-rose-600',
                              )}
                            >
                              {staff.overallPerformanceScore}
                            </Badge>
                          </div>

                          <p className="text-sm text-gray-600">
                            <span className="font-medium">Total Active :</span> {staff?.totalActiveMinutes?.toLocaleString() || 0} mins
                          </p>
                        </div>
                      </div>

                      {/* ---------- Metrics Grid ---------- */}
                      <div className="grid w-full flex-1 grid-cols-1 gap-6 sm:grid-cols-2 lg:max-w-3xl lg:grid-cols-3">
                        {/* Acceptance */}
                        <MetricItem
                          title="Acceptance Rate"
                          percent={staff?.acceptancePercent}
                          onTime={`${staff?.acceptanceOnTime}/${staff?.acceptanceTotal}`}
                          gradient="from-emerald-400 to-emerald-600"
                        />

                        {/* Completion */}
                        <MetricItem
                          title="Completion Rate"
                          percent={staff?.completionPercent}
                          onTime={`${staff?.completionOnTime}/${staff?.completionTotal}`}
                          gradient="from-amber-400 to-amber-600"
                        />

                        {/* Efficiency */}
                        <MetricItem
                          title="Efficiency"
                          percent={staff?.efficiencyPercent}
                          onTime="Overall efficiency rating"
                          gradient="from-rose-400 to-rose-600"
                        />
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
      <PopUp
        hide
        show={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        width="w-[96vw] max-w-[1400px]"
      >
        <ServicesData servicesData={servicesData} setIsDialogOpen={setIsDialogOpen} />
      </PopUp>
    </div>
  );
}
