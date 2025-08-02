"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { useState } from "react";

interface RescheduleModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function RescheduleModal({ open, onOpenChange }: RescheduleModalProps) {
  const [newDay, setNewDay] = useState("");
  const [newTime, setNewTime] = useState("");

  const handleSave = () => {
    // Later, call API here
    console.log("Rescheduled to:", newDay, newTime);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md sm:rounded-2xl p-6">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">Reschedule Class</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label className="mb-1 block">Select New Day</Label>
            <Select value={newDay} onValueChange={setNewDay}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Choose a day" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="monday">Monday</SelectItem>
                <SelectItem value="tuesday">Tuesday</SelectItem>
                <SelectItem value="wednesday">Wednesday</SelectItem>
                <SelectItem value="thursday">Thursday</SelectItem>
                <SelectItem value="friday">Friday</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label className="mb-1 block">Select New Time</Label>
            <Select value={newTime} onValueChange={setNewTime}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Choose a time" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="morning">Morning (8am - 11am)</SelectItem>
                <SelectItem value="afternoon">Afternoon (12pm - 3pm)</SelectItem>
                <SelectItem value="evening">Evening (4pm - 7pm)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter className="mt-6 flex justify-end gap-2">
          <DialogClose asChild>
            <Button variant="outline">Cancel</Button>
          </DialogClose>
          <Button onClick={handleSave} disabled={!newDay || !newTime}>
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
