import { format } from "date-fns";
import { Teacher, Leave } from "@shared/schema";
import { StatusBadge } from "@/components/ui/status-badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { X } from "lucide-react";

interface LeaveDetailsModalProps {
  leave: Leave;
  teacher: Teacher;
  onClose: () => void;
}

export default function LeaveDetailsModal({ 
  leave, 
  teacher,
  onClose 
}: LeaveDetailsModalProps) {
  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader className="border-b pb-3">
          <div className="flex justify-between items-center">
            <DialogTitle>Leave Request Details</DialogTitle>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={onClose}
              className="h-8 w-8 text-gray-500 hover:text-gray-700"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        <div className="py-4 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h4 className="text-sm font-medium text-gray-500">Teacher</h4>
              <p className="text-gray-700">{teacher.name} ({teacher.teacherId})</p>
            </div>
            <div>
              <h4 className="text-sm font-medium text-gray-500">Leave Type</h4>
              <p className="text-gray-700">{leave.leaveType.charAt(0).toUpperCase() + leave.leaveType.slice(1)} Leave</p>
            </div>
            <div>
              <h4 className="text-sm font-medium text-gray-500">Date Submitted</h4>
              <p className="text-gray-700">{format(new Date(leave.submittedAt), "MMMM d, yyyy")}</p>
            </div>
            <div>
              <h4 className="text-sm font-medium text-gray-500">Status</h4>
              <StatusBadge status={leave.status as any} />
            </div>
            <div>
              <h4 className="text-sm font-medium text-gray-500">Period</h4>
              <p className="text-gray-700">
                {format(new Date(leave.startDate), "MMMM d, yyyy")} - {format(new Date(leave.endDate), "MMMM d, yyyy")} ({leave.days} days)
              </p>
            </div>
            {leave.approvedBy && (
              <div>
                <h4 className="text-sm font-medium text-gray-500">Approved By</h4>
                <p className="text-gray-700">{leave.approvedBy}</p>
              </div>
            )}
          </div>
          
          <div>
            <h4 className="text-sm font-medium text-gray-500">Reason</h4>
            <p className="text-gray-700 mt-1">{leave.reason}</p>
          </div>
          
          {leave.notes && (
            <div>
              <h4 className="text-sm font-medium text-gray-500">Notes</h4>
              <p className="text-gray-700 mt-1">{leave.notes}</p>
            </div>
          )}
        </div>
        
        <DialogFooter className="bg-gray-50 px-6 py-3 rounded-b-lg">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
