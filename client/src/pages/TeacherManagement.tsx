import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useLocation } from "wouter";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Separator } from "@/components/ui/separator";
import { 
  UserPlus, 
  Search,
  RefreshCw,
} from "lucide-react";
import { Teacher, insertTeacherSchema } from "@shared/schema";

export default function TeacherManagement() {
  const [isAddingTeacher, setIsAddingTeacher] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  
  // Fetch all teachers
  const { data: teachers, isLoading, refetch } = useQuery({
    queryKey: ['/api/teachers'],
    queryFn: async () => {
      const response = await fetch('/api/teachers');
      if (!response.ok) {
        throw new Error('Failed to fetch teachers');
      }
      return response.json();
    }
  });

  // Form for adding new teachers
  const form = useForm({
    resolver: zodResolver(insertTeacherSchema),
    defaultValues: {
      teacherId: "",
      name: "",
      department: ""
    }
  });

  // Add teacher mutation
  const { mutate: addTeacher, isPending } = useMutation({
    mutationFn: async (data: any) => {
      return apiRequest("POST", "/api/teachers", data);
    },
    onSuccess: () => {
      toast({
        title: "Teacher Added",
        description: "The teacher has been added successfully."
      });
      // Reset form and refetch teachers
      form.reset();
      setIsAddingTeacher(false);
      queryClient.invalidateQueries({ queryKey: ['/api/teachers'] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to add teacher",
        variant: "destructive"
      });
    }
  });

  const onSubmit = (data: any) => {
    addTeacher(data);
  };
  
  // Function to view teacher details (navigates to leave management)
  const viewTeacherDetails = (teacherId: number) => {
    setLocation(`/leave-management?teacherId=${teacherId}`);
  };
  
  // Filter teachers based on search query
  const filteredTeachers = teachers ? teachers.filter((teacher: Teacher) => {
    const query = searchQuery.toLowerCase();
    return (
      teacher.name.toLowerCase().includes(query) ||
      teacher.teacherId.toLowerCase().includes(query) ||
      teacher.department.toLowerCase().includes(query)
    );
  }) : [];

  return (
    <div className="container mx-auto px-4 py-6">
      <Tabs defaultValue="all-teachers" className="w-full">
        <Card className="mb-6">
          <CardHeader className="pb-2">
            <div className="flex justify-between items-center">
              <CardTitle>ගුරු කළමනාකරණය</CardTitle>
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => refetch()}
                  disabled={isLoading}
                >
                  <RefreshCw className="mr-2 h-4 w-4" />
                  යාවත්කාලීන කරන්න
                </Button>
                <Button 
                  size="sm" 
                  onClick={() => setIsAddingTeacher(true)}
                  disabled={isAddingTeacher}
                >
                  <UserPlus className="mr-2 h-4 w-4" />
                  ගුරුවරයෙකු එකතු කරන්න
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-2">
            <TabsList>
              <TabsTrigger value="all-teachers">All Teachers</TabsTrigger>
              <TabsTrigger value="departments">By Department</TabsTrigger>
            </TabsList>
          </CardContent>
        </Card>

        <TabsContent value="all-teachers" className="mt-0">
          <Card>
            <CardContent className="p-0">
              {!isAddingTeacher ? (
                <div>
                  <div className="p-4">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input 
                        placeholder="Search teachers by name or ID..." 
                        className="pl-10"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                      />
                    </div>
                  </div>
                  <Separator />
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Teacher ID</TableHead>
                          <TableHead>Name</TableHead>
                          <TableHead>Department</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {isLoading ? (
                          <TableRow>
                            <TableCell colSpan={4} className="text-center py-10">
                              Loading teachers...
                            </TableCell>
                          </TableRow>
                        ) : filteredTeachers.length > 0 ? (
                          filteredTeachers.map((teacher: Teacher) => (
                            <TableRow key={teacher.id}>
                              <TableCell>{teacher.teacherId}</TableCell>
                              <TableCell className="font-medium">{teacher.name}</TableCell>
                              <TableCell>{teacher.department}</TableCell>
                              <TableCell className="text-right">
                                <Button 
                                  variant="link" 
                                  className="h-auto p-0"
                                  onClick={() => viewTeacherDetails(teacher.id)}
                                >
                                  View leave details
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))
                        ) : (
                          <TableRow>
                            <TableCell colSpan={4} className="text-center py-10">
                              No teachers found. Add your first teacher to get started.
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              ) : (
                <div className="p-6">
                  <h3 className="text-lg font-medium mb-4">Add New Teacher</h3>
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                      <FormField
                        control={form.control}
                        name="teacherId"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Teacher ID</FormLabel>
                            <FormControl>
                              <Input placeholder="Enter teacher ID (e.g., TCH-2023-001)" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Full Name</FormLabel>
                            <FormControl>
                              <Input placeholder="Enter teacher's full name" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="department"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Department</FormLabel>
                            <FormControl>
                              <Input placeholder="Enter department" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <div className="flex justify-end gap-3 pt-2">
                        <Button 
                          type="button" 
                          variant="outline" 
                          onClick={() => setIsAddingTeacher(false)}
                          disabled={isPending}
                        >
                          Cancel
                        </Button>
                        <Button type="submit" disabled={isPending}>
                          {isPending ? "Adding..." : "Add Teacher"}
                        </Button>
                      </div>
                    </form>
                  </Form>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="departments" className="mt-0">
          <Card>
            <CardContent className="p-6">
              <h3 className="text-lg font-medium mb-4">Department Summary</h3>
              <p className="text-gray-600">
                This feature will display teachers grouped by department.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
