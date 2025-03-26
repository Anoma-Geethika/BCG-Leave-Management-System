import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function TeacherManagement() {
  return (
    <div className="container mx-auto px-4 py-6">
      <Card>
        <CardHeader>
          <CardTitle>Teacher Management</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600">
            This feature is under development. The teacher management section will allow you to add, edit
            and manage teacher profiles.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
