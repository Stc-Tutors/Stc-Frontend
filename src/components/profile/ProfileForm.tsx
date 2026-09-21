"use client";

import { useEffect, useState } from "react";
import InlineLoader from "@/components/shared/InlineLoader";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ToastError, ToastSuccess } from "@/components/ui/custom/toast";
import { GetUserAction, UpdateUserAction } from "@/server/user";
import { useUser } from "@/contexts/user-context";
import { User, UserRole } from "@/types/user";
import AvatarUpload from "./AvatarUpload";
import ChangePasswordForm from "./ChangePasswordForm";
import StudentPersonalDetailsForm from "./StudentPersonalDetailsForm";
import NotificationPreferencesForm from "./NotificationPreferencesForm";

// The profile picture isn't part of this form - AvatarUpload saves it on its
// own the moment a file is picked (see handleAvatarChange), so "Save changes"
// only ever sends the text fields below.
const formSchema = z.object({
  firstName: z.string().min(1, { message: "First name is required" }),
  lastName: z.string().min(1, { message: "Last name is required" }),
  phone: z.string().optional(),
});

export default function ProfileForm() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { updateUser } = useUser();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { firstName: "", lastName: "", phone: "" },
  });

  useEffect(() => {
    const load = async () => {
      const [res] = await GetUserAction();
      if (res?.data) {
        setUser(res.data);
        form.reset({
          firstName: res.data.firstName || "",
          lastName: res.data.lastName || "",
          phone: res.data.phone || "",
        });
      }
      setIsLoading(false);
    };
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    const [res, error] = await UpdateUserAction(data);
    if (res?.data) {
      setUser(res.data);
      // Keep the app-wide user (header/sidebar name) in step with what was saved.
      updateUser({ firstName: res.data.firstName, lastName: res.data.lastName, phone: res.data.phone });
      ToastSuccess("Profile updated successfully");
    }
    if (error) {
      ToastError(error);
    }
  };

  // Persists straight away (unlike the text fields, which wait for "Save
  // changes") - picking a file is already an explicit action. Throws on
  // failure so AvatarUpload shows the reason under the picture.
  const handleAvatarChange = async (avatarUrl: string) => {
    const [res, error] = await UpdateUserAction({ avatarUrl });
    if (!res?.data) throw new Error(error || "Could not save your photo");
    setUser(res.data);
    updateUser({ avatarUrl: res.data.avatarUrl });
    ToastSuccess(avatarUrl ? "Profile picture updated" : "Profile picture removed");
  };

  if (isLoading) return <InlineLoader label="Loading profile" />;

  const joinedDate = user?.joinedDate ? new Date(user.joinedDate) : null;
  const joinedOn = joinedDate && !Number.isNaN(joinedDate.getTime()) ? joinedDate.toLocaleDateString() : null;

  return (
    <div className="space-y-6">
    <section className="bg-white rounded-2xl shadow p-6 max-w-2xl">
      <div className="mb-6 space-y-4">
        <AvatarUpload url={user?.avatarUrl} name={user?.firstName} onChange={handleAvatarChange} />
        <div>
          <h1 className="font-bold text-xl">
            {user?.firstName} {user?.lastName}
          </h1>
          {user?.email && <p className="text-gray-500 text-sm">{user.email}</p>}
          {/* A student registered by a parent has no email - their login is this ID. */}
          {user?.studentId && <p className="text-gray-500 text-sm">Student ID: {user.studentId}</p>}
          {joinedOn && <p className="text-gray-400 text-xs mt-1">Member since {joinedOn}</p>}
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="firstName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>First name</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="lastName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Last name</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormItem>
              <FormLabel>Role</FormLabel>
              <FormControl>
                <Input value={user?.role} disabled />
              </FormControl>
            </FormItem>
          </div>

          <Button type="submit" className="mt-2" disabled={form.formState.isSubmitting}>
            {form.formState.isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save changes
          </Button>
        </form>
      </Form>
    </section>

    {user?.role === UserRole.STUDENT && <StudentPersonalDetailsForm />}
    <ChangePasswordForm />
    <NotificationPreferencesForm />
    </div>
  );
}
