"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Megaphone } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { BroadcastHodMessageAction } from "@/server/hod";

// One message pushed to every Tutor/Admin in the caller's own HOD scope at
// once (stcbe's HodService.broadcast resolves who that is - same roster "My
// Tutors (HOD Scope)" shows, plus whoever actually manages them) - the
// alternative being messaging each one individually via the regular chat.
export function HodBroadcastDialog() {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [isSending, setIsSending] = useState(false);

  const reset = () => {
    setTitle("");
    setBody("");
  };

  const handleSend = async () => {
    if (!title.trim() || !body.trim()) {
      toast.error("Title and message are required");
      return;
    }
    setIsSending(true);
    const [res, error] = await BroadcastHodMessageAction({ title: title.trim(), body: body.trim() });
    setIsSending(false);
    if (error) {
      toast.error(error);
      return;
    }
    toast.success(`Broadcast sent to ${res?.data?.recipientCount ?? 0} people in your scope`);
    reset();
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={(next) => { setOpen(next); if (!next) reset(); }}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-1.5">
          <Megaphone className="size-4" /> Broadcast
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Broadcast to your scope</DialogTitle>
          <DialogDescription>
            Sends one message to every Tutor and Admin within your HOD scope - no need to message them one by one.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          <Input placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)} />
          <Textarea placeholder="Message" value={body} onChange={(e) => setBody(e.target.value)} rows={5} />
        </div>

        <DialogFooter>
          <Button onClick={handleSend} disabled={isSending || !title.trim() || !body.trim()}>
            {isSending ? "Sending..." : "Send broadcast"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
