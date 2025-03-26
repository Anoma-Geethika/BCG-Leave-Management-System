import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Teacher } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { Search } from "lucide-react";

const searchSchema = z.object({
  query: z.string().min(1, "Please enter a search term"),
});

type SearchForm = z.infer<typeof searchSchema>;

interface TeacherSearchProps {
  onSelectTeacher: (teacher: Teacher) => void;
}

export default function TeacherSearch({ onSelectTeacher }: TeacherSearchProps) {
  const [searchQuery, setSearchQuery] = useState<string>("");
  const { toast } = useToast();

  const form = useForm<SearchForm>({
    resolver: zodResolver(searchSchema),
    defaultValues: {
      query: "",
    },
  });

  // Only run the search query when the user submits the form
  const { data: teachers, isLoading } = useQuery({
    queryKey: ['/api/teachers/search', searchQuery],
    queryFn: async () => {
      if (!searchQuery) return [];
      const response = await fetch(`/api/teachers/search?q=${encodeURIComponent(searchQuery)}`);
      if (!response.ok) {
        throw new Error("Failed to search teachers");
      }
      return response.json();
    },
    enabled: searchQuery.length > 0,
  });

  const onSearch = (data: SearchForm) => {
    setSearchQuery(data.query);
  };

  const handleSelectTeacher = (teacher: Teacher) => {
    onSelectTeacher(teacher);
    toast({
      title: "Teacher Selected",
      description: `${teacher.name} has been selected.`,
    });
  };

  return (
    <div className="mb-6">
      <h2 className="text-xl font-medium mb-4">ගුරුවරයා සොයන්න</h2>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSearch)} className="flex flex-col md:flex-row gap-4">
          <div className="flex-grow">
            <FormField
              control={form.control}
              name="query"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>ගුරු නම හෝ අංකය</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input 
                        placeholder="ගුරු නම හෝ අංකය ඇතුලත් කරන්න" 
                        {...field} 
                      />
                      <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-neutral-500">
                        <Search className="h-5 w-5" />
                      </div>
                    </div>
                  </FormControl>
                </FormItem>
              )}
            />
          </div>
          <div className="md:w-1/4">
            <FormLabel className="invisible">සෙවීම</FormLabel>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "සොයමින්..." : "සොයන්න"}
            </Button>
          </div>
        </form>
      </Form>

      {/* Search Results */}
      {teachers && teachers.length > 0 && (
        <div className="mt-4 p-2 border rounded-md">
          <h3 className="text-sm font-medium mb-2">Search Results</h3>
          <ul className="space-y-1">
            {teachers.map((teacher: Teacher) => (
              <li 
                key={teacher.id} 
                className="p-2 hover:bg-gray-100 rounded cursor-pointer flex justify-between"
                onClick={() => handleSelectTeacher(teacher)}
              >
                <span>{teacher.name} ({teacher.teacherId})</span>
                <span className="text-primary text-sm">Select</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {searchQuery && teachers && teachers.length === 0 && (
        <div className="mt-4 p-4 bg-gray-50 rounded text-center">
          No teachers found matching "{searchQuery}"
        </div>
      )}
    </div>
  );
}
