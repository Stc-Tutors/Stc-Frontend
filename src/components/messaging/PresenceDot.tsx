// Small online/offline indicator meant to sit at the corner of an avatar.
// `online` is a point-in-time snapshot from the last contacts/conversations
// fetch (see stcbe's MessageService.withOnline) - undefined (never fetched)
// renders nothing rather than a false "offline".
export function PresenceDot({ online }: { online?: boolean }) {
  if (online === undefined) return null;
  return (
    <span
      className={`absolute bottom-0 right-0 size-2.5 rounded-full border-2 border-white ${
        online ? "bg-green-500" : "bg-gray-300"
      }`}
      aria-label={online ? "Online" : "Offline"}
    />
  );
}
