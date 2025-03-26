import * as React from "react";
import { format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import { DateRange } from "react-day-picker";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface DateRangePickerProps {
  dateRange: DateRange | undefined;
  onDateRangeChange: (range: DateRange | undefined) => void;
  onDaysChange?: (days: number) => void;
  className?: string;
}

export function DateRangePicker({
  dateRange,
  onDateRangeChange,
  onDaysChange,
  className,
}: DateRangePickerProps) {
  // Calculate number of days between dates (inclusive)
  const calculateDays = React.useCallback((from?: Date, to?: Date) => {
    if (!from || !to) return 0;
    
    const diffTime = Math.abs(to.getTime() - from.getTime());
    return Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1; // Add 1 to include both start and end days
  }, []);

  // Update days when date range changes
  React.useEffect(() => {
    if (onDaysChange && dateRange?.from && dateRange?.to) {
      const days = calculateDays(dateRange.from, dateRange.to);
      onDaysChange(days);
    }
  }, [dateRange, calculateDays, onDaysChange]);

  return (
    <div className={cn("grid gap-2", className)}>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            id="date"
            variant={"outline"}
            className={cn(
              "w-full justify-start text-left font-normal",
              !dateRange && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {dateRange?.from ? (
              dateRange.to ? (
                <>
                  {format(dateRange.from, "LLL dd, y")} -{" "}
                  {format(dateRange.to, "LLL dd, y")}
                </>
              ) : (
                format(dateRange.from, "LLL dd, y")
              )
            ) : (
              <span>Pick a date range</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            initialFocus
            mode="range"
            defaultMonth={dateRange?.from}
            selected={dateRange}
            onSelect={onDateRangeChange}
            numberOfMonths={2}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}
