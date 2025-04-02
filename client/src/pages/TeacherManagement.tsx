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
  const [isEditing, setIsEditing] = useState(false);
  const [editingTeacherId, setEditingTeacherId] = useState<number | null>(null);
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

  // Form for adding/editing teachers
  const form = useForm({
    resolver: zodResolver(insertTeacherSchema),
    defaultValues: {
      teacherId: "",
      name: "",
      department: "",
      position: "",
      appointmentDate: new Date().toISOString().split('T')[0]
    }
  });

  // Add teacher mutation
  const { mutate: addTeacher, isPending: isAddPending } = useMutation({
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

  // Update teacher mutation
  const { mutate: updateTeacher, isPending: isUpdatePending } = useMutation({
    mutationFn: async ({ id, data }: { id: number, data: any }) => {
      return apiRequest("PUT", `/api/teachers/${id}`, data);
    },
    onSuccess: () => {
      toast({
        title: "Teacher Updated",
        description: "The teacher has been updated successfully."
      });
      // Reset form and refetch teachers
      form.reset();
      setIsAddingTeacher(false);
      setIsEditing(false);
      setEditingTeacherId(null);
      queryClient.invalidateQueries({ queryKey: ['/api/teachers'] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update teacher",
        variant: "destructive"
      });
    }
  });

  // Delete teacher mutation
  const { mutate: deleteTeacher, isPending: isDeletePending } = useMutation({
    mutationFn: async (id: number) => {
      return apiRequest("DELETE", `/api/teachers/${id}`);
    },
    onSuccess: () => {
      toast({
        title: "ගුරුවරයා ඉවත් කරන ලදී",
        description: "ගුරුවරයා සාර්ථකව ඉවත් කරන ලදී."
      });
      queryClient.invalidateQueries({ queryKey: ['/api/teachers'] });
    },
    onError: (error) => {
      toast({
        title: "දෝෂයකි",
        description: "ගුරුවරයා ඉවත් කිරීමට නොහැකි විය.",
        variant: "destructive"
      });
    }
  });

  const onSubmit = (data: any) => {
    if (isEditing && editingTeacherId) {
      updateTeacher({ id: editingTeacherId, data });
    } else {
      addTeacher(data);
    }
  };
  
  const handleEdit = (teacher: Teacher) => {
    // Set form values for editing
    form.reset({
      teacherId: teacher.teacherId,
      name: teacher.name,
      department: teacher.department,
      position: teacher.position,
      appointmentDate: teacher.appointmentDate
    });
    setEditingTeacherId(teacher.id);
    setIsEditing(true);
    setIsAddingTeacher(true);
  };
  
  const handleCancelForm = () => {
    form.reset();
    setIsAddingTeacher(false);
    setIsEditing(false);
    setEditingTeacherId(null);
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
              <TabsTrigger value="all-teachers">සියලුම ගුරුවරුන්</TabsTrigger>
              <TabsTrigger value="departments">දෙපාර්තමේන්තු අනුව</TabsTrigger>
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
                        placeholder="නම හෝ අංකය අනුව ගුරුවරුන් සොයන්න..." 
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
                          <TableHead>ගුරු අංකය</TableHead>
                          <TableHead>නම</TableHead>
                          <TableHead>දෙපාර්තමේන්තුව</TableHead>
                          <TableHead className="text-right">ක්‍රියාමාර්ග</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {isLoading ? (
                          <TableRow>
                            <TableCell colSpan={4} className="text-center py-10">
                              ගුරුවරුන් පූරණය වෙමින්...
                            </TableCell>
                          </TableRow>
                        ) : filteredTeachers.length > 0 ? (
                          filteredTeachers.map((teacher: Teacher) => (
                            <TableRow key={teacher.id}>
                              <TableCell>{teacher.teacherId}</TableCell>
                              <TableCell className="font-medium">{teacher.name}</TableCell>
                              <TableCell>{teacher.department}</TableCell>
                              <TableCell className="text-right">
                                <div className="flex justify-end gap-2">
                                  <Button 
                                    variant="link" 
                                    className="h-auto p-0"
                                    onClick={() => viewTeacherDetails(teacher.id)}
                                  >
                                    නිවාඩු විස්තර බලන්න
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleEdit(teacher)}
                                  >
                                    සංස්කරණය
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="text-red-600 hover:text-red-800"
                                    onClick={() => {
                                      if (confirm("ඔබට මෙම ගුරුවරයා ඉවත් කිරීමට අවශ්‍ය බව විශ්වාසද?")) {
                                        deleteTeacher(teacher.id);
                                      }
                                    }}
                                    disabled={isDeletePending}
                                  >
                                    ඉවත් කරන්න
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))
                        ) : (
                          <TableRow>
                            <TableCell colSpan={4} className="text-center py-10">
                              ගුරුවරුන් හමු නොවීය. ආරම්භ කිරීමට ඔබගේ පළමු ගුරුවරයා එකතු කරන්න.
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              ) : (
                <div className="p-6">
                  <h3 className="text-lg font-medium mb-4">
                    {isEditing ? "ගුරුවරයා යාවත්කාලීන කරන්න" : "නව ගුරුවරයෙකු එකතු කරන්න"}
                  </h3>
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                      <FormField
                        control={form.control}
                        name="teacherId"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>ගුරු අංකය</FormLabel>
                            <FormControl>
                              <Input placeholder="ගුරු අංකය ඇතුලත් කරන්න (උදා: TCH-2023-001)" {...field} />
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
                            <FormLabel>සම්පූර්ණ නම</FormLabel>
                            <FormControl>
                              <Input placeholder="ගුරුවරයාගේ සම්පූර්ණ නම ඇතුලත් කරන්න" {...field} />
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
                            <FormLabel>දෙපාර්තමේන්තුව</FormLabel>
                            <FormControl>
                              <Input placeholder="දෙපාර්තමේන්තුව ඇතුලත් කරන්න" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="position"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>තනතුර</FormLabel>
                            <FormControl>
                              <Input placeholder="තනතුර ඇතුලත් කරන්න" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="appointmentDate"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>පත්වීම් දිනය</FormLabel>
                            <FormControl>
                              <Input type="date" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <div className="flex justify-end gap-3 pt-2">
                        <Button 
                          type="button" 
                          variant="outline" 
                          onClick={() => handleCancelForm()}
                          disabled={isAddPending || isUpdatePending}
                        >
                          අවලංගු කරන්න
                        </Button>
                        <Button type="submit" disabled={isAddPending || isUpdatePending}>
                          {isEditing 
                            ? (isUpdatePending ? "යාවත්කාලීන කරමින්..." : "ගුරුවරයා යාවත්කාලීන කරන්න")
                            : (isAddPending ? "එකතු කරමින්..." : "ගුරුවරයා එකතු කරන්න")}
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
              <h3 className="text-lg font-medium mb-4">දෙපාර්තමේන්තු සාරාංශය</h3>
              <p className="text-gray-600">
                මෙම විශේෂාංගය දෙපාර්තමේන්තු අනුව වර්ග කරන ලද ගුරුවරුන් පෙන්වනු ඇත.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
