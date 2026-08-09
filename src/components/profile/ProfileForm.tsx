"use client";

import { useEffect, useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ToastError, ToastSuccess } from "@/components/ui/custom/toast";
import { GetUserAction, UpdateUserAction } from "@/server/user";
import { User } from "@/types/user";
import ChangePasswordForm from "./ChangePasswordForm";

const formSchema = z.object({
  firstName: z.string().min(1, { message: "First name is required" }),
  lastName: z.string().min(1, { message: "Last name is required" }),
  phone: z.string().optional(),
  avatarUrl: z.string().optional(),
});

export default function ProfileForm() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { firstName: "", lastName: "", phone: "", avatarUrl: "" },
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
          avatarUrl: res.data.avatarUrl || "",
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
      ToastSuccess("Profile updated successfully");
    }
    if (error) {
      ToastError(error);
    }
  };

  if (isLoading) return <p className="p-6">Loading profile...</p>;

  return (
    <div className="space-y-6">
    <section className="bg-white rounded-2xl shadow p-6 max-w-2xl">
      <div className="flex items-center gap-4 mb-6">
        <Avatar className="h-16 w-16">
          <AvatarImage src={form.watch("avatarUrl") || user?.avatarUrl} alt={user?.firstName} />
          <AvatarFallback>{user?.firstName?.[0]}</AvatarFallback>
        </Avatar>
        <div>
          <h1 className="font-bold text-xl">
            {user?.firstName} {user?.lastName}
          </h1>
          <p className="text-gray-500 text-sm">{user?.email}</p>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="avatarUrl"
              render={({ field }) => (
                <FormItem className="md:col-span-2">
                  <FormLabel>Photo URL</FormLabel>
                  <FormControl>
                    <Input placeholder="https://..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

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

    <ChangePasswordForm />
    </div>
  );
}
