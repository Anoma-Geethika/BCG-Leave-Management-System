import { useState } from "react";
import { format } from "date-fns";
import { useQuery } from "@tanstack/react-query";
import { Teacher, Leave } from "@shared/schema";
import { Card, CardContent } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/status-badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import LeaveDetailsModal from "./LeaveDetailsModal";
import { Skeleton } from "@/components/ui/skeleton";

interface LeaveHistoryProps {
  teacher: Teacher | null;
}

export default function LeaveHistory({ teacher }: LeaveHistoryProps) {
  const [leaveTypeFilter, setLeaveTypeFilter] = useState<string>("all");
  const [selectedLeave, setSelectedLeave] = useState<Leave | null>(null);

  const { data: leaves, isLoading } = useQuery({
    queryKey: ['/api/teachers', teacher?.id, 'leaves', leaveTypeFilter],
    queryFn: async () => {
      if (!teacher) return [];
      const url = leaveTypeFilter === "all" 
        ? `/api/teachers/${teacher.id}/leaves` 
        : `/api/teachers/${teacher.id}/leaves?type=${leaveTypeFilter}`;
      
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error("Failed to fetch leaves");
      }
      return response.json();
    },
    enabled: !!teacher,
  });

  const handleFilterChange = (value: string) => {
    setLeaveTypeFilter(value);
  };

  const openLeaveDetails = (leave: Leave) => {
    setSelectedLeave(leave);
  };

  const closeLeaveDetails = () => {
    setSelectedLeave(null);
  };

  if (!teacher) {
    return (
      <div className="mb-8">
        <h2 className="text-xl font-medium mb-4">නිවාඩු ඉතිහාසය</h2>
        <div className="p-6 text-center bg-gray-50 rounded-md border border-gray-200">
          <p className="text-gray-600">නිවාඩු ඉතිහාසය බැලීමට ගුරුවරයෙකු තෝරන්න.</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-medium">නිවාඩු ඉතිහාසය</h2>
        <div className="flex items-center space-x-2">
          <label htmlFor="filter-leave-type" className="text-sm text-gray-600">පෙරහන:</label>
          <Select value={leaveTypeFilter} onValueChange={handleFilterChange}>
            <SelectTrigger id="filter-leave-type" className="w-[130px]">
              <SelectValue placeholder="සියලු වර්ග" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">සියලු වර්ග</SelectItem>
              <SelectItem value="casual">සාමාන්‍ය</SelectItem>
              <SelectItem value="sick">අසනීප</SelectItem>
              <SelectItem value="duty">රාජකාරි</SelectItem>
              <SelectItem value="other">වෙනත්</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b">
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">ඉදිරිපත් කළ දිනය</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">වර්ගය</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">කාල සීමාව</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">දින</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">හේතුව</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">තත්ත්වය</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">ක්‍රියා</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {isLoading ? (
                  Array(3).fill(0).map((_, index) => (
                    <tr key={index}>
                      <td className="px-6 py-4 whitespace-nowrap"><Skeleton className="h-6 w-24" /></td>
                      <td className="px-6 py-4 whitespace-nowrap"><Skeleton className="h-6 w-20" /></td>
                      <td className="px-6 py-4 whitespace-nowrap"><Skeleton className="h-6 w-32" /></td>
                      <td className="px-6 py-4 whitespace-nowrap"><Skeleton className="h-6 w-8" /></td>
                      <td className="px-6 py-4"><Skeleton className="h-6 w-40" /></td>
                      <td className="px-6 py-4 whitespace-nowrap"><Skeleton className="h-6 w-20" /></td>
                      <td className="px-6 py-4 whitespace-nowrap"><Skeleton className="h-6 w-24" /></td>
                    </tr>
                  ))
                ) : leaves && leaves.length > 0 ? (
                  leaves.map((leave: Leave) => (
                    <tr key={leave.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {format(new Date(leave.submittedAt), "yyyy-MM-dd")}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {leave.leaveType === 'casual' ? 'සාමාන්‍ය' : 
                         leave.leaveType === 'sick' ? 'අසනීප' : 
                         leave.leaveType === 'duty' ? 'රාජකාරි' : 'වෙනත්'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        <div>{format(new Date(leave.startDate), "MMM dd, yyyy")}</div>
                        <div className="text-xs text-gray-500">
                          සිට {format(new Date(leave.endDate), "MMM dd, yyyy")}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{leave.days}</td>
                      <td className="px-6 py-4 text-sm text-gray-600 max-w-xs truncate">{leave.reason}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <StatusBadge status={leave.status as any} />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <Button 
                          variant="link" 
                          className="text-primary hover:text-primary/80"
                          onClick={() => openLeaveDetails(leave)}
                        >
                          View Details
                        </Button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                      No leave records found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          
          {leaves && leaves.length > 0 && (
            <div className="px-6 py-4 flex justify-between items-center border-t">
              <div className="text-sm text-gray-600">
                Showing <span className="font-medium">{leaves.length}</span> records
              </div>
              <div className="flex space-x-2">
                <Button variant="outline" size="sm" disabled>
                  Previous
                </Button>
                <Button variant="outline" size="sm" disabled>
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {selectedLeave && (
        <LeaveDetailsModal 
          leave={selectedLeave} 
          teacher={teacher}
          onClose={closeLeaveDetails} 
        />
      )}
    </div>
  );
}
