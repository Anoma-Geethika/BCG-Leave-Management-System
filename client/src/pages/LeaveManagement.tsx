import { useState } from "react";
import TeacherSearch from "@/components/TeacherSearch";
import TeacherInfo from "@/components/TeacherInfo";
import LeaveForm from "@/components/LeaveForm";
import LeaveHistory from "@/components/LeaveHistory";
import { Teacher } from "@shared/schema";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";

export default function LeaveManagement() {
  const [selectedTeacher, setSelectedTeacher] = useState<Teacher | null>(null);

  const handleSelectTeacher = (teacher: Teacher) => {
    setSelectedTeacher(teacher);
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <Tabs defaultValue="leave-management" className="w-full">
        <Card className="rounded-t-lg shadow border-b">
          <TabsList className="w-full justify-start rounded-none border-b bg-transparent p-0">
            <TabsTrigger 
              value="leave-management" 
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent"
            >
              නිවාඩු කළමනාකරණය
            </TabsTrigger>
            <TabsTrigger 
              value="reports" 
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent"
            >
              වාර්තා
            </TabsTrigger>
            <TabsTrigger 
              value="teacher-management" 
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent"
            >
              ගුරු කළමනාකරණය
            </TabsTrigger>
          </TabsList>
        </Card>

        <TabsContent value="leave-management" className="mt-0">
          <Card className="rounded-t-none shadow pt-6 px-6 pb-6">
            <TeacherSearch onSelectTeacher={handleSelectTeacher} />
            <TeacherInfo teacher={selectedTeacher} />
            <LeaveForm teacher={selectedTeacher} />
            <LeaveHistory teacher={selectedTeacher} />
          </Card>
        </TabsContent>

        <TabsContent value="reports">
          <Card className="shadow p-6">
            <h2 className="text-xl font-medium mb-4">වාර්තා</h2>
            <p className="text-gray-600">
              වාර්තා ක්‍රියාකාරිත්වය අනාගත යාවත්කාලීන කිරීමකදී ක්‍රියාත්මක කරනු ඇත.
            </p>
          </Card>
        </TabsContent>

        <TabsContent value="teacher-management">
          <Card className="shadow p-6">
            <h2 className="text-xl font-medium mb-4">ගුරු කළමනාකරණය</h2>
            <p className="text-gray-600">
              ගුරු කළමනාකරණ ක්‍රියාකාරිත්වය අනාගත යාවත්කාලීන කිරීමකදී ක්‍රියාත්මක කරනු ඇත.
            </p>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
