import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function Reports() {
  return (
    <div className="container mx-auto px-4 py-6">
      <Card>
        <CardHeader>
          <CardTitle>Reports</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600">
            This feature is under development. The reports section will allow you to view summary reports
            of leave usage by department, teacher, or leave type.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
