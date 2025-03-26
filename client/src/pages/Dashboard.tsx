import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { format, subMonths, isWithinInterval } from "date-fns";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line
} from "recharts";
import { apiRequest } from "@/lib/queryClient";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Leave, Teacher, leaveTypes } from "@shared/schema";
import { Skeleton } from "@/components/ui/skeleton";

// Colors for charts
const COLORS = {
  casual: "#4f46e5", // Indigo
  sick: "#f97316",   // Orange
  duty: "#10b981",   // Emerald
  other: "#8b5cf6"   // Violet
};

const RADIAN = Math.PI / 180;
const renderCustomizedLabel = ({
  cx,
  cy,
  midAngle,
  innerRadius,
  outerRadius,
  percent,
}: any) => {
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  return (
    <text
      x={x}
      y={y}
      fill="white"
      textAnchor={x > cx ? "start" : "end"}
      dominantBaseline="central"
    >
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
};

export default function Dashboard() {
  const [timeRange, setTimeRange] = useState<string>("6months");
  const [chartView, setChartView] = useState<string>("byType");

  // Fetch all leave records
  const { data: leaves, isLoading: isLoadingLeaves } = useQuery<Leave[]>({
    queryKey: ["/api/leaves"],
  });

  // Fetch all teachers
  const { data: teachers, isLoading: isLoadingTeachers } = useQuery<Teacher[]>({
    queryKey: ["/api/teachers"],
  });

  // Function to filter leaves by time range
  const filterLeavesByTimeRange = (leaves: Leave[]) => {
    if (!leaves) return [];
    
    const now = new Date();
    let startDate: Date;
    
    switch (timeRange) {
      case "1month":
        startDate = subMonths(now, 1);
        break;
      case "3months":
        startDate = subMonths(now, 3);
        break;
      case "1year":
        startDate = subMonths(now, 12);
        break;
      case "6months":
      default:
        startDate = subMonths(now, 6);
        break;
    }
    
    return leaves.filter(leave => {
      const submittedDate = new Date(leave.submittedAt);
      return isWithinInterval(submittedDate, { start: startDate, end: now });
    });
  };

  // Prepare data for pie chart (leave by type)
  const prepareLeaveByTypeData = (leaves: Leave[]) => {
    if (!leaves) return [];
    
    const filteredLeaves = filterLeavesByTimeRange(leaves);
    const leaveByType = {
      casual: 0,
      sick: 0,
      duty: 0,
      other: 0,
    };
    
    filteredLeaves.forEach(leave => {
      leaveByType[leave.leaveType as keyof typeof leaveByType] += leave.days;
    });
    
    return Object.entries(leaveByType).map(([name, value]) => ({
      name: name.charAt(0).toUpperCase() + name.slice(1),
      value,
    }));
  };

  // Prepare data for bar chart (leave by department)
  const prepareLeaveByDepartmentData = (leaves: Leave[], teachers: Teacher[]) => {
    if (!leaves || !teachers) return [];
    
    const filteredLeaves = filterLeavesByTimeRange(leaves);
    const leaveByDepartment: Record<string, { department: string, casual: number, sick: number, duty: number, other: number }> = {};
    
    // Initialize departments
    teachers.forEach(teacher => {
      if (!leaveByDepartment[teacher.department]) {
        leaveByDepartment[teacher.department] = {
          department: teacher.department,
          casual: 0,
          sick: 0,
          duty: 0,
          other: 0,
        };
      }
    });
    
    // Aggregate leave days by department
    filteredLeaves.forEach(leave => {
      const teacher = teachers.find(t => t.id === leave.teacherId);
      if (teacher) {
        leaveByDepartment[teacher.department][leave.leaveType as keyof Omit<typeof leaveByDepartment[string], 'department'>] += leave.days;
      }
    });
    
    return Object.values(leaveByDepartment);
  };

  // Prepare data for line chart (monthly leave trends)
  const prepareMonthlyTrendsData = (leaves: Leave[]) => {
    if (!leaves) return [];
    
    const filteredLeaves = filterLeavesByTimeRange(leaves);
    const monthlyData: Record<string, { month: string, casual: number, sick: number, duty: number, other: number }> = {};
    
    // Initialize months for the selected time range
    const now = new Date();
    let startDate: Date;
    let monthsToShow: number;
    
    switch (timeRange) {
      case "1month":
        startDate = subMonths(now, 1);
        monthsToShow = 1;
        break;
      case "3months":
        startDate = subMonths(now, 3);
        monthsToShow = 3;
        break;
      case "1year":
        startDate = subMonths(now, 12);
        monthsToShow = 12;
        break;
      case "6months":
      default:
        startDate = subMonths(now, 6);
        monthsToShow = 6;
        break;
    }
    
    for (let i = 0; i <= monthsToShow; i++) {
      const date = subMonths(now, i);
      const monthKey = format(date, "MMM yyyy");
      monthlyData[monthKey] = {
        month: monthKey,
        casual: 0,
        sick: 0,
        duty: 0,
        other: 0,
      };
    }
    
    // Aggregate leave days by month
    filteredLeaves.forEach(leave => {
      const submittedDate = new Date(leave.submittedAt);
      const monthKey = format(submittedDate, "MMM yyyy");
      
      if (monthlyData[monthKey]) {
        monthlyData[monthKey][leave.leaveType as keyof Omit<typeof monthlyData[string], 'month'>] += leave.days;
      }
    });
    
    return Object.values(monthlyData).reverse();
  };

  const leaveByTypeData = leaves ? prepareLeaveByTypeData(leaves) : [];
  const leaveByDepartmentData = leaves && teachers ? prepareLeaveByDepartmentData(leaves, teachers) : [];
  const monthlyTrendsData = leaves ? prepareMonthlyTrendsData(leaves) : [];

  // Top statistics
  const calculateTotalLeaves = () => {
    if (!leaves) return 0;
    return filterLeavesByTimeRange(leaves).length;
  };

  const calculateTotalLeaveDays = () => {
    if (!leaves) return 0;
    return filterLeavesByTimeRange(leaves).reduce((total, leave) => total + leave.days, 0);
  };

  const calculateTeachersOnLeave = () => {
    if (!leaves) return 0;
    const filteredLeaves = filterLeavesByTimeRange(leaves);
    const uniqueTeachers = new Set();
    filteredLeaves.forEach(leave => uniqueTeachers.add(leave.teacherId));
    return uniqueTeachers.size;
  };

  const calculatePendingApprovals = () => {
    if (!leaves) return 0;
    const filteredLeaves = filterLeavesByTimeRange(leaves);
    return filteredLeaves.filter(leave => leave.status === "pending").length;
  };

  const isLoading = isLoadingLeaves || isLoadingTeachers;

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">පුවරුව (Dashboard)</h1>
          <p className="text-muted-foreground">
            ගුරු නිවාඩු දත්ත සාරාංශය සහ විශ්ලේෂණය
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600">කාල සීමාව:</span>
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select a time range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1month">පසුගිය මාසය</SelectItem>
              <SelectItem value="3months">පසුගිය මාස 3</SelectItem>
              <SelectItem value="6months">පසුගිය මාස 6</SelectItem>
              <SelectItem value="1year">පසුගිය වසර</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Stats overview */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-row items-center justify-between space-y-0">
              <p className="text-sm font-medium text-muted-foreground">
                සම්පූර්ණ නිවාඩු අයදුම්
              </p>
            </div>
            {isLoading ? (
              <Skeleton className="h-9 w-16 mt-2" />
            ) : (
              <div className="text-2xl font-bold mt-2">{calculateTotalLeaves()}</div>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-row items-center justify-between space-y-0">
              <p className="text-sm font-medium text-muted-foreground">
                සම්පූර්ණ නිවාඩු දින
              </p>
            </div>
            {isLoading ? (
              <Skeleton className="h-9 w-16 mt-2" />
            ) : (
              <div className="text-2xl font-bold mt-2">{calculateTotalLeaveDays()}</div>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-row items-center justify-between space-y-0">
              <p className="text-sm font-medium text-muted-foreground">
                නිවාඩු ලබන ගුරුවරුන්
              </p>
            </div>
            {isLoading ? (
              <Skeleton className="h-9 w-16 mt-2" />
            ) : (
              <div className="text-2xl font-bold mt-2">{calculateTeachersOnLeave()}</div>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-row items-center justify-between space-y-0">
              <p className="text-sm font-medium text-muted-foreground">
                අනුමැතිය අපේක්ෂිත
              </p>
            </div>
            {isLoading ? (
              <Skeleton className="h-9 w-16 mt-2" />
            ) : (
              <div className="text-2xl font-bold mt-2">{calculatePendingApprovals()}</div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <Tabs defaultValue="leaveDistribution" className="space-y-4">
        <TabsList>
          <TabsTrigger value="leaveDistribution">නිවාඩු බෙදා හැරීම</TabsTrigger>
          <TabsTrigger value="departmentAnalysis">අංශ විශ්ලේෂණය</TabsTrigger>
          <TabsTrigger value="trends">ප්‍රවණතා</TabsTrigger>
        </TabsList>
        
        {/* Leave Distribution Tab */}
        <TabsContent value="leaveDistribution" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>නිවාඩු වර්ග අනුව බෙදා හැරීම</CardTitle>
              <CardDescription>
                විවිධ නිවාඩු වර්ග සඳහා ගත් මුළු නිවාඩු දින ගණන
              </CardDescription>
            </CardHeader>
            <CardContent className="pl-2">
              {isLoading ? (
                <div className="flex justify-center items-center h-80">
                  <Skeleton className="h-80 w-80 rounded-full" />
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={350}>
                  <PieChart>
                    <Pie
                      data={leaveByTypeData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={renderCustomizedLabel}
                      outerRadius={140}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {leaveByTypeData.map((entry, index) => (
                        <Cell 
                          key={`cell-${index}`} 
                          fill={COLORS[entry.name.toLowerCase() as keyof typeof COLORS]} 
                        />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend 
                      formatter={(value) => {
                        switch(value.toLowerCase()) {
                          case 'casual': return 'සාමාන්‍ය';
                          case 'sick': return 'අසනීප';
                          case 'duty': return 'රාජකාරි';
                          case 'other': return 'වෙනත්';
                          default: return value;
                        }
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Department Analysis Tab */}
        <TabsContent value="departmentAnalysis" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>අංශ අනුව නිවාඩු විශ්ලේෂණය</CardTitle>
              <CardDescription>
                විවිධ අංශ විසින් ලබා ගත් නිවාඩු වර්ග
              </CardDescription>
            </CardHeader>
            <CardContent className="pl-2">
              {isLoading ? (
                <div className="h-80 flex items-center justify-center">
                  <Skeleton className="h-80 w-full" />
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={350}>
                  <BarChart
                    data={leaveByDepartmentData}
                    margin={{
                      top: 5,
                      right: 30,
                      left: 20,
                      bottom: 5,
                    }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="department" />
                    <YAxis />
                    <Tooltip 
                      formatter={(value, name) => {
                        // Translate the names for tooltips
                        const translatedName = 
                          name === "casual" ? "සාමාන්‍ය" :
                          name === "sick" ? "අසනීප" :
                          name === "duty" ? "රාජකාරි" :
                          name === "other" ? "වෙනත්" : name;
                        return [value, translatedName];
                      }}
                    />
                    <Legend
                      formatter={(value) => {
                        switch(value) {
                          case 'casual': return 'සාමාන්‍ය';
                          case 'sick': return 'අසනීප';
                          case 'duty': return 'රාජකාරි';
                          case 'other': return 'වෙනත්';
                          default: return value;
                        }
                      }}
                    />
                    <Bar dataKey="casual" fill={COLORS.casual} />
                    <Bar dataKey="sick" fill={COLORS.sick} />
                    <Bar dataKey="duty" fill={COLORS.duty} />
                    <Bar dataKey="other" fill={COLORS.other} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Trends Tab */}
        <TabsContent value="trends" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>මාසික නිවාඩු ප්‍රවණතා</CardTitle>
              <CardDescription>
                කාලය තුළ නිවාඩු භාවිතයේ ප්‍රවණතා
              </CardDescription>
            </CardHeader>
            <CardContent className="pl-2">
              {isLoading ? (
                <div className="h-80 flex items-center justify-center">
                  <Skeleton className="h-80 w-full" />
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={350}>
                  <LineChart
                    data={monthlyTrendsData}
                    margin={{
                      top: 5,
                      right: 30,
                      left: 20,
                      bottom: 5,
                    }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip 
                      formatter={(value, name) => {
                        // Translate the names for tooltips
                        const translatedName = 
                          name === "casual" ? "සාමාන්‍ය" :
                          name === "sick" ? "අසනීප" :
                          name === "duty" ? "රාජකාරි" :
                          name === "other" ? "වෙනත්" : name;
                        return [value, translatedName];
                      }}
                    />
                    <Legend 
                      formatter={(value) => {
                        switch(value) {
                          case 'casual': return 'සාමාන්‍ය';
                          case 'sick': return 'අසනීප';
                          case 'duty': return 'රාජකාරි';
                          case 'other': return 'වෙනත්';
                          default: return value;
                        }
                      }}
                    />
                    <Line type="monotone" dataKey="casual" stroke={COLORS.casual} activeDot={{ r: 8 }} strokeWidth={2} />
                    <Line type="monotone" dataKey="sick" stroke={COLORS.sick} activeDot={{ r: 8 }} strokeWidth={2} />
                    <Line type="monotone" dataKey="duty" stroke={COLORS.duty} activeDot={{ r: 8 }} strokeWidth={2} />
                    <Line type="monotone" dataKey="other" stroke={COLORS.other} activeDot={{ r: 8 }} strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}