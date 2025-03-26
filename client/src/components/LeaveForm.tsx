import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { DateRange } from "react-day-picker";
import { useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
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
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DateRangePicker } from "@/components/ui/date-range-picker";
import { 
  Teacher, 
  leaveFormSchema, 
  leaveTypes, 
  LeaveType
} from "@shared/schema";

interface LeaveFormProps {
  teacher: Teacher | null;
}

export default function LeaveForm({ teacher }: LeaveFormProps) {
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const { toast } = useToast();

  const form = useForm({
    resolver: zodResolver(leaveFormSchema),
    defaultValues: {
      teacherId: 0,
      leaveType: "" as LeaveType,
      startDate: undefined as unknown as Date,
      endDate: undefined as unknown as Date,
      days: 0,
      reason: "",
    },
  });

  const { mutate, isPending } = useMutation({
    mutationFn: async (formData: any) => {
      return apiRequest("POST", "/api/leaves", formData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/teachers', teacher?.id, 'leaves'] });
      queryClient.invalidateQueries({ queryKey: ['/api/teachers', teacher?.id, 'leave-usage'] });
      toast({
        title: "Leave Request Submitted",
        description: "The leave request has been submitted successfully.",
      });
      resetForm();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to submit leave request.",
        variant: "destructive",
      });
    },
  });

  const resetForm = () => {
    form.reset();
    setDateRange(undefined);
  };

  const onSubmit = (data: any) => {
    if (!teacher) {
      toast({
        title: "Error",
        description: "Please select a teacher first.",
        variant: "destructive",
      });
      return;
    }

    mutate({
      ...data,
      teacherId: teacher.id,
    });
  };

  const handleDateRangeChange = (range: DateRange | undefined) => {
    setDateRange(range);
    if (range?.from) {
      form.setValue("startDate", range.from);
      if (range.to) {
        form.setValue("endDate", range.to);
      }
    }
  };

  const handleDaysChange = (days: number) => {
    form.setValue("days", days);
  };

  // If no teacher is selected, show a message
  if (!teacher) {
    return (
      <div className="mb-8">
        <h2 className="text-xl font-medium mb-4">නිවාඩු ඉල්ලුම් පත්‍රය</h2>
        <div className="p-6 text-center bg-gray-50 rounded-md border border-gray-200">
          <p className="text-gray-600">නිවාඩු ඉල්ලුම් කිරීමට ගුරුවරයෙකු තෝරන්න.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mb-8">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-medium">නිවාඩු ඉල්ලුම් පත්‍රය</h2>
      </div>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="leaveType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>නිවාඩු වර්ගය</FormLabel>
                  <Select 
                    onValueChange={field.onChange} 
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="නිවාඩු වර්ගය තෝරන්න" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value={leaveTypes.CASUAL}>සාමාන්‍ය නිවාඩු</SelectItem>
                      <SelectItem value={leaveTypes.SICK}>අසනීප නිවාඩු</SelectItem>
                      <SelectItem value={leaveTypes.DUTY}>රාජකාරි නිවාඩු</SelectItem>
                      <SelectItem value={leaveTypes.OTHER}>වෙනත් නිවාඩු</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormItem>
              <FormLabel>නිවාඩු දින</FormLabel>
              <DateRangePicker 
                dateRange={dateRange} 
                onDateRangeChange={handleDateRangeChange}
                onDaysChange={handleDaysChange}
              />
            </FormItem>

            <FormField
              control={form.control}
              name="days"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>දින ගණන</FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      min="1"
                      {...field}
                      onChange={(e) => field.onChange(parseInt(e.target.value))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          
          <FormField
            control={form.control}
            name="reason"
            render={({ field }) => (
              <FormItem>
                <FormLabel>නිවාඩු ඉල්ලුම් කිරීමේ හේතුව</FormLabel>
                <FormControl>
                  <Textarea 
                    placeholder="නිවාඩු ඉල්ලුම් කිරීමේ හේතුව සඳහන් කරන්න" 
                    rows={3} 
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <div className="flex justify-end space-x-3">
            <Button 
              type="button" 
              variant="outline" 
              onClick={resetForm}
              disabled={isPending}
            >
              අවලංගු කරන්න
            </Button>
            <Button 
              type="submit" 
              disabled={isPending}
            >
              {isPending ? "ඉදිරිපත් කරමින්..." : "නිවාඩු ඉල්ලුම ඉදිරිපත් කරන්න"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
