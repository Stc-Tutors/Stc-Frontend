import { Check, CheckCheck } from "lucide-react";
import { Message } from "@/types/message";

// WhatsApp-style status derived from the message's own receipt maps - never
// tracked separately client-side, so it can't drift from what the server
// actually recorded. "Read" implies "delivered" (see stcbe's
// message.repository.ts), so read is checked first.
export function messageStatus(message: Message, otherParticipantIds: string[]): "sent" | "delivered" | "read" {
  if (otherParticipantIds.some((id) => message.readReceipts?.[id])) return "read";
  if (otherParticipantIds.some((id) => message.deliveredTo?.[id])) return "delivered";
  return "sent";
}

export function MessageStatusTicks({ message, otherParticipantIds }: { message: Message; otherParticipantIds: string[] }) {
  const status = messageStatus(message, otherParticipantIds);
  if (status === "sent") return <Check className="size-3.5 inline-block" aria-label="Sent" />;
  return (
    <CheckCheck
      className={`size-3.5 inline-block ${status === "read" ? "text-blue-400" : ""}`}
      aria-label={status === "read" ? "Read" : "Delivered"}
    />
  );
}
