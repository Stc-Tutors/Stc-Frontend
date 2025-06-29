import { toast } from "sonner";

export function ToastSuccess(message: string) {
  return toast.success(message, {
    style: {
      backgroundColor: "hsl(var(--success))",
      color: "hsl(var(--primary-foreground))",
    },
  });
}

export function ToastError(error: string, duration: number = 5000) {
  return toast.error(
    typeof error === "string"
      ? error
      : "Unexpected error occurred. Please try again later",
    {
      // style: {
      //   backgroundColor: "var(--destructive)",
      // //   color: "hsl(var(--destructive-foreground))",
      // },
      duration: duration,
    }
  );
}
