import { motion } from "framer-motion";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from "recharts";
import { Clock, TrendingUp,  ChevronDown } from "lucide-react";
import type { StaffAlertReportData } from "@/hooks/hotel/useStaffAlertReport.ts";

// Staff interface for filtering
export interface IHotelStaff {
  _id: string;
  name: string;
  phone: string;
  customRole: {
    businessId: string;
    nickName: string;
    role: string;
    _id: string;
  }[];
}

interface StaffPerformanceDashboardProps {
  data: StaffAlertReportData;
  isLoading: boolean;
}

const getPerformanceColor = (percentage: number) => {
  if (percentage >= 80) return "hsl(142 76% 36%)"; // Green for good performance
  if (percentage >= 50) return "hsl(32 95% 44%)"; // Orange for moderate performance
  return "hsl(0 84% 60%)"; // Red for poor performance
};

const exportToCSV = (data: any[], filename: string) => {
  const csvContent = [
    Object.keys(data[0]).join(","),
    ...data.map((row) => Object.values(row).join(",")),
  ].join("\n");

  const blob = new Blob([csvContent], { type: "text/csv" });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${filename}.csv`;
  a.click();
  window.URL.revokeObjectURL(url);
};

export default function StaffPerformanceDashboard({
  data,
  isLoading,
}: StaffPerformanceDashboardProps) {
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"/>
          <p className="text-muted-foreground">Loading performance data...</p>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="text-muted-foreground">
            No performance data available
          </div>
        </div>
      </div>
    );
  }

  const filteredData = data.report;

  const pieData = [
    {
      name: "On Time",
      value: data.plotValue.onTime,
      color: "hsl(142 76% 36%)",
    },
    { name: "Late", value: data.plotValue.late, color: "hsl(0 84% 60%)" },
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
        ease: "easeOut",
      },
    },
  };

  const handleExport = () => {
    const exportData = filteredData.map((staff: any) => ({
      "Staff Name": staff.staffName,
      "Acceptance Rate": `${staff.acceptancePercent}%`,
      "Completion Rate": `${staff.completionPercent}%`,
      Efficiency: `${staff.efficiencyPercent}%`,
      "Performance Score": staff.overallPerformanceScore,
      "Services Handled": staff.servicesHandled,
    }));
    exportToCSV(
      exportData,
      `staff-performance-${new Date().toISOString().split("T")[0]}`,
    );
  };

  return (
    <div className="min-h-screen bg-background p-4 md:p-6 lg:p-0">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="max-w-7xl mx-auto space-y-6"
      >
        {/* Filter and Export Section */}
        {/* <motion.div
          variants={itemVariants}
          className="flex flex-col gap-4 items-start sm:items-center justify-between"
        >
          <div className="flex items-center gap-4">
            <Button
              onClick={handleExport}
              variant="outline"
              size="sm"
              className="gap-2 bg-transparent"
            >
              <Download className="h-4 w-4" />
              Export CSV
            </Button>
          </div>
        </motion.div> */}

        <section className="flex flex-col lg:flex-row gap-4 flex-wrap">
          {/* Key Metrics Cards */}
          <motion.div
            variants={itemVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-2 md:grid-cols-2 gap-6"
          >
            {/* Total Services Card */}
            <motion.div
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.2 }}
            >
              <Card className="border-l-4 border-l-primary">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">
                    Total Services
                  </CardTitle>
                  <ChevronDown className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-primary">
                    {data.overAll.totalServicesHandled}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Service actions completed
                  </p>
                </CardContent>
              </Card>
            </motion.div>

            {/* On-Time Rate Card */}
            <motion.div
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.2 }}
            >
              <Card className="border-l-4 border-l-chart-1">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">
                    On-Time Rate
                  </CardTitle>
                  <Clock className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-chart-1">
                    {Math.round(
                      (data.overAll.totalOnTimeCount /
                        data.overAll.totalServiceActionCount) *
                        100,
                    )}
                    %
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {data.overAll.totalOnTimeCount} out of{" "}
                    {data.overAll.totalServiceActionCount}
                  </p>
                </CardContent>
              </Card>
            </motion.div>

            {/* Avg Completion Card */}
            <motion.div
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.2 }}
            >
              <Card className="border-l-4 border-l-accent">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">
                    Avg Completion
                  </CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-foreground">
                    {data.overAll.totalAvgCompletionMinutes}m
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Average completion time
                  </p>
                </CardContent>
              </Card>
            </motion.div>

            {/* Avg SLA Time Card */}
            <motion.div
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.2 }}
            >
              <Card className="border-l-4 border-l-secondary">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">
                    Avg SLA Time
                  </CardTitle>
                  <Clock className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-foreground">
                    {data.overAll.totalAvgSlaMinutes}m
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Service level agreement
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>

          {/* Charts Section */}
          <motion.div
            variants={itemVariants}
            whileHover={{ scale: 1.01 }}
            transition={{ duration: 0.2 }}
            className="w-full flex-1"
          >
            <Card className="relative p-0">
              <CardHeader className="absolute left-0">
                <CardTitle className="text-xl font-semibold">
                  Performance Overview
                </CardTitle>
                <CardDescription>
                  On-time vs Late service completion
                </CardDescription>
              </CardHeader>
              <CardContent className="py-6 pt-12 lg:pt-6 lg:pl-[13rem]">
                <div className="flex flex-col lg:flex-row lg:items-center gap-6 h-[300px] lg:h-[230px]">
                  {/* Text content on the left for large screens */}
                  {/* <div className="flex-1 lg:flex-none lg:w-1/2 space-y-4 flex flex-col justify-center">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">
                          On Time Services
                        </span>
                        <span className="text-lg font-bold text-chart-1">
                          {data.plotValue.onTime}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">
                          Late Services
                        </span>
                        <span className="text-lg font-bold text-destructive">
                          {data.plotValue.late}
                        </span>
                      </div>
                      <div className="pt-2 border-t">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">
                            Total Services
                          </span>
                          <span className="text-xl font-bold">
                            {data.plotValue.onTime + data.plotValue.late}
                          </span>
                        </div>
                        <div className="flex items-center justify-between mt-1">
                          <span className="text-xs text-muted-foreground">
                            Success Rate
                          </span>
                          <span className="text-sm font-medium text-chart-1">
                            {Math.round(
                              (data.plotValue.onTime /
                                (data.plotValue.onTime + data.plotValue.late)) *
                                100,
                            )}
                            %
                          </span>
                        </div>
                      </div>
                    </div>
                  </div> */}

                  {/* Pie chart on the right for large screens */}
                  <div className="flex-1 lg:w-1/2 h-[240px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={pieData}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={100}
                          paddingAngle={2}
                          dataKey="value"
                        >
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
          <Card>
            <CardHeader>
              <CardTitle className="text-xl font-semibold">
                Individual Staff Performance
              </CardTitle>
              <CardDescription>
                Detailed breakdown of each staff member's metrics
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {filteredData.map((staff, index) => (
                  <motion.div
                    key={staff.staffName}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    whileHover={{ scale: 1.01 }}
                    className="p-4 border rounded-lg bg-card/50 hover:bg-card transition-colors"
                  >
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                      <div className="space-y-2">
                        <h3 className="text-lg font-semibold text-card-foreground">
                          {staff.staffName}
                        </h3>
                        <div className="flex flex-wrap gap-2">
                          <Badge variant="secondary">
                            {staff.servicesHandled} Services
                          </Badge>
                          <Badge
                            variant="outline"
                            style={{
                              backgroundColor:
                                staff.overallPerformanceScore === "on-time"
                                  ? "hsl(142 76% 36%)"
                                  : "hsl(0 84% 60%)",
                              color: "white",
                              borderColor:
                                staff.overallPerformanceScore === "on-time"
                                  ? "hsl(142 76% 36%)"
                                  : "hsl(0 84% 60%)",
                            }}
                          >
                            {staff.overallPerformanceScore}
                          </Badge>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 flex-1 lg:max-w-2xl">
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>Acceptance Rate</span>
                            <span className="font-medium">
                              {staff.acceptancePercent}%
                            </span>
                          </div>
                          <div className="w-full bg-secondary/20 rounded-full h-2">
                            <div
                              className="h-2 rounded-full transition-all duration-300"
                              style={{
                                width: `${staff.acceptancePercent}%`,
                                backgroundColor: getPerformanceColor(
                                  staff.acceptancePercent,
                                ),
                              }}
                            />
                          </div>
                          <p className="text-xs text-muted-foreground">
                            {staff.acceptanceOnTime}/{staff.acceptanceTotal} on
                            time
                          </p>
                        </div>

                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>Completion Rate</span>
                            <span className="font-medium">
                              {staff.completionPercent}%
                            </span>
                          </div>
                          <div className="w-full bg-secondary/20 rounded-full h-2">
                            <div
                              className="h-2 rounded-full transition-all duration-300"
                              style={{
                                width: `${staff.completionPercent}%`,
                                backgroundColor: getPerformanceColor(
                                  staff.completionPercent,
                                ),
                              }}
                            />
                          </div>
                          <p className="text-xs text-muted-foreground">
                            {staff.completionOnTime}/{staff.completionTotal} on
                            time
                          </p>
                        </div>

                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>Efficiency</span>
                            <span className="font-medium">
                              {staff.efficiencyPercent}%
                            </span>
                          </div>
                          <div className="w-full bg-secondary/20 rounded-full h-2">
                            <div
                              className="h-2 rounded-full transition-all duration-300"
                              style={{
                                width: `${staff.efficiencyPercent}%`,
                                backgroundColor: getPerformanceColor(
                                  staff.efficiencyPercent,
                                ),
                              }}
                            />
                          </div>
                          <p className="text-xs text-muted-foreground">
                            Overall efficiency rating
                          </p>
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
    </div>
  );
}
