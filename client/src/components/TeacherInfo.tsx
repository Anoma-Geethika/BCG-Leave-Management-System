import { useQuery } from "@tanstack/react-query";
import { Teacher, LeaveUsage, leaveLimits } from "@shared/schema";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

interface TeacherInfoProps {
  teacher: Teacher | null;
}

export default function TeacherInfo({ teacher }: TeacherInfoProps) {
  const { data: leaveUsage, isLoading } = useQuery({
    queryKey: ['/api/teachers', teacher?.id, 'leave-usage'],
    queryFn: async () => {
      if (!teacher) return null;
      const response = await fetch(`/api/teachers/${teacher.id}/leave-usage`);
      if (!response.ok) {
        if (response.status === 404) {
          // If teacher has no leave usage yet, return default values
          return {
            teacherId: teacher.id,
            casualUsed: 0,
            sickUsed: 0,
            dutyUsed: 0,
            otherUsed: 0
          };
        }
        throw new Error("Failed to fetch leave usage");
      }
      return response.json();
    },
    enabled: !!teacher,
  });

  if (!teacher) return null;

  return (
    <Card className="bg-gray-50 mb-6">
      <CardContent className="p-4">
        <div className="flex flex-col md:flex-row justify-between">
          <div>
            <h3 className="text-lg font-medium">{teacher.name}</h3>
            <p className="text-gray-600">අංකය: {teacher.teacherId}</p>
            <p className="text-gray-600">අංශය: {teacher.department}</p>
          </div>
          <div className="mt-3 md:mt-0">
            <h4 className="text-sm font-medium text-gray-700">නිවාඩු සාරාංශය</h4>
            {isLoading ? (
              <div className="flex gap-4 mt-1">
                <Skeleton className="h-10 w-20" />
                <Skeleton className="h-10 w-20" />
                <Skeleton className="h-10 w-20" />
              </div>
            ) : leaveUsage ? (
              <div className="flex gap-4 mt-1">
                <div>
                  <span className="text-xs text-gray-600">සාමාන්‍ය</span>
                  <p className="font-medium">{leaveUsage.casualUsed}/{leaveLimits.casual} දින</p>
                </div>
                <div>
                  <span className="text-xs text-gray-600">අසනීප</span>
                  <p className="font-medium">{leaveUsage.sickUsed}/{leaveLimits.sick} දින</p>
                </div>
                <div>
                  <span className="text-xs text-gray-600">රාජකාරි</span>
                  <p className="font-medium">{leaveUsage.dutyUsed}/{leaveLimits.duty} දින</p>
                </div>
                <div>
                  <span className="text-xs text-gray-600">වෙනත්</span>
                  <p className="font-medium">{leaveUsage.otherUsed}/{leaveLimits.other} දින</p>
                </div>
              </div>
            ) : (
              <p className="text-sm text-gray-500 mt-1">නිවාඩු දත්ත නොමැත</p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
