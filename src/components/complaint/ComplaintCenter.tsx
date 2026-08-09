"use client";

import { useEffect, useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { ToastError, ToastSuccess } from "@/components/ui/custom/toast";
import { FileComplaintAction, GetMyComplaintsAction } from "@/server/complaint";
import { Complaint, ComplaintCategory, ComplaintStatus } from "@/types/complaint";

const CATEGORY_LABELS: Record<ComplaintCategory, string> = {
  [ComplaintCategory.PAYMENT]: "Payment",
  [ComplaintCategory.TUTOR_CONDUCT]: "Tutor Conduct",
  [ComplaintCategory.STUDENT_CONDUCT]: "Student Conduct",
  [ComplaintCategory.SESSION_QUALITY]: "Session Quality",
  [ComplaintCategory.TECHNICAL]: "Technical",
  [ComplaintCategory.OTHER]: "Other",
};

const STATUS_COLORS: Record<ComplaintStatus, string> = {
  [ComplaintStatus.OPEN]: "bg-amber-100 text-amber-700",
  [ComplaintStatus.INVESTIGATING]: "bg-blue-100 text-blue-700",
  [ComplaintStatus.RESOLVED]: "bg-green-100 text-green-700",
  [ComplaintStatus.DISMISSED]: "bg-gray-100 text-gray-700",
};

const formSchema = z.object({
  category: z.nativeEnum(ComplaintCategory),
  subject: z.string().min(1, { message: "Subject is required" }),
  description: z.string().min(1, { message: "Please describe the issue" }),
});

// Filing UI reused across STUDENT/PARENT/TUTOR "Support" pages - files a
// complaint via POST /complaints and lists the caller's own complaints via
// GET /complaints/mine.
export default function ComplaintCenter() {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [open, setOpen] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      category: ComplaintCategory.OTHER,
      subject: "",
      description: "",
    },
  });

  const load = async () => {
    setIsLoading(true);
    const [res] = await GetMyComplaintsAction();
    setComplaints(res?.data ?? []);
    setIsLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    const [res, error] = await FileComplaintAction(data);
    if (error) {
      ToastError(error);
      return;
    }
    ToastSuccess(res?.message || "Complaint filed successfully");
    form.reset();
    setOpen(false);
    load();
  };

  return (
    <div className="bg-white shadow rounded-2xl p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Support</h1>
          <p className="text-sm text-gray-500">File a complaint and track its status here.</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>+ File a Complaint</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>File a Complaint</DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Category</FormLabel>
                      <FormControl>
                        <select
                          {...field}
                          className="w-full border rounded-md px-3 py-2 text-sm"
                        >
                          {Object.values(ComplaintCategory).map((c) => (
                            <option key={c} value={c}>
                              {CATEGORY_LABELS[c]}
                            </option>
                          ))}
                        </select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="subject"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Subject</FormLabel>
                      <FormControl>
                        <Input placeholder="Brief summary of the issue" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea rows={5} placeholder="Describe what happened" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <DialogFooter>
                  <Button type="submit" disabled={form.formState.isSubmitting}>
                    {form.formState.isSubmitting ? "Submitting..." : "Submit"}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      <div>
        <h2 className="font-semibold mb-3">My Complaints</h2>
        {isLoading ? (
          <p className="text-sm text-gray-500 py-4">Loading...</p>
        ) : complaints.length === 0 ? (
          <p className="text-sm text-gray-500 py-4">You haven&apos;t filed any complaints yet.</p>
        ) : (
          <div className="space-y-3">
            {complaints.map((c) => (
              <div key={c.id} className="border rounded-lg p-4">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="font-medium text-gray-800">{c.subject}</p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {CATEGORY_LABELS[c.category]} &middot; {new Date(c.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full font-medium whitespace-nowrap ${STATUS_COLORS[c.status]}`}>
                    {c.status}
                  </span>
                </div>
                <p className="text-sm text-gray-600 mt-2">{c.description}</p>
                {c.resolutionNotes && (
                  <p className="text-sm text-gray-500 mt-2 border-t pt-2">
                    <span className="font-medium">Resolution:</span> {c.resolutionNotes}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
