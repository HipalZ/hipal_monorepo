import MiddlePopUp from '@/components/atom/middlePopUp';
import useBusinessData from '@/components/store/useBusinessData';
import useTimings from '@/components/store/useTimings';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useStaffServices, type StaffAlertReportData } from '@/hooks/hotel/useStaffAlertReport.ts';
import { motion } from 'framer-motion';
import { ChevronDown, Clock, Download, TrendingUp } from 'lucide-react';
import { useState } from 'react';
import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';
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

  const handleServices = async (staff: any) => {
    setIsDialogOpen(true);

    const result = await getStaffServices({
      businessId: businessId || '',
      from: timeStampStart || 0,
      to: timeStampEnd || 0,
      staffId: staff.staffId,
    });

    // result is the alerts array
    const serviceNames: string[] = (Array.isArray(result) ? result : [])
      .flatMap((alert: any) => (Array.isArray(alert?.serviceIds) ? alert.serviceIds : []))
      .map((s: any) => (typeof s?.name === 'string' ? s.name.trim() : ''))
      .filter(Boolean);
    setServicesData(serviceNames);
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
    const csvContent = [Object.keys(data[0]).join(','), ...data.map((row) => Object.values(row).join(','))].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${filename}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="bg-background min-h-screen space-y-2 p-4 md:p-6 lg:p-0">
      <div className="flex items-end justify-end gap-4">
        <Button onClick={() => exportToCSV(filteredData, 'user-analytics')} variant="outline" size="sm" className="gap-2 bg-transparent">
          <Download className="h-4 w-4" />
          Export CSV
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
            <motion.div whileHover={{ scale: 1.02 }} transition={{ duration: 0.2 }}>
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
            </motion.div>

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
                    transition={{ delay: index * 0.1 }}
                    whileHover={{ scale: 1.01, boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}
                    className="rounded-xl border bg-white/70 p-5 transition-all"
                  >
                    <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
                      {/* Staff Info */}
                      <div className="flex items-start gap-4">
                        <div className="space-y-2">
                          <h3 className="text-lg font-semibold text-gray-800">{staff.staffName}</h3>
                          <button onClick={() => handleServices(staff)} className="text-sm font-medium text-blue-600 hover:underline">
                            View Services
                          </button>

                          <div className="flex flex-wrap gap-2">
                            <Badge className="rounded-full px-3 py-1 font-medium">{staff.servicesHandled} Services</Badge>
                            <Badge
                              className="rounded-full px-3 py-1 font-medium"
                              style={{
                                backgroundColor: staff.overallPerformanceScore === 'on-time' ? 'hsl(142 76% 36%)' : 'hsl(0 84% 60%)',
                                color: 'white',
                              }}
                            >
                              {staff.overallPerformanceScore}
                            </Badge>
                          </div>
                        </div>
                      </div>

                      {/* Metrics */}
                      <div className="grid w-full flex-1 grid-cols-1 gap-6 sm:grid-cols-2 lg:max-w-3xl lg:grid-cols-3">
                        {/* Acceptance */}
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>Acceptance Rate</span>
                            <span className="font-semibold text-gray-800">{staff.acceptancePercent}%</span>
                          </div>
                          <div className="h-3 w-full overflow-hidden rounded-full bg-gray-100">
                            <div
                              className="h-full rounded-full transition-all duration-500"
                              style={{
                                width: `${staff.acceptancePercent}%`,
                                background: 'linear-gradient(to right, #22c55e, #16a34a)',
                              }}
                            />
                          </div>
                          <p className="text-muted-foreground text-xs">
                            {staff.acceptanceOnTime}/{staff.acceptanceTotal} on time
                          </p>
                        </div>

                        {/* Completion */}
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>Completion Rate</span>
                            <span className="font-semibold text-gray-800">{staff.completionPercent}%</span>
                          </div>
                          <div className="h-3 w-full overflow-hidden rounded-full bg-gray-100">
                            <div
                              className="h-full rounded-full transition-all duration-500"
                              style={{
                                width: `${staff.completionPercent}%`,
                                background: 'linear-gradient(to right, #f59e0b, #d97706)',
                              }}
                            />
                          </div>
                          <p className="text-muted-foreground text-xs">
                            {staff.completionOnTime}/{staff.completionTotal} on time
                          </p>
                        </div>

                        {/* Efficiency */}
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>Efficiency</span>
                            <span className="font-semibold text-gray-800">{staff.efficiencyPercent}%</span>
                          </div>
                          <div className="h-3 w-full overflow-hidden rounded-full bg-gray-100">
                            <div
                              className="h-full rounded-full transition-all duration-500"
                              style={{
                                width: `${staff.efficiencyPercent}%`,
                                background: 'linear-gradient(to right, #ef4444, #dc2626)',
                              }}
                            />
                          </div>
                          <p className="text-muted-foreground text-xs">Overall efficiency rating</p>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
      <MiddlePopUp onlyPopUp show={isDialogOpen} onClose={() => setIsDialogOpen(false)}>
        <ServicesData servicesData={servicesData} setIsDialogOpen={setIsDialogOpen} />
      </MiddlePopUp>
    </div>
  );
}
