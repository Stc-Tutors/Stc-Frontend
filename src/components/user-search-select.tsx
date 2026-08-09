"use client";

import { useEffect, useState } from "react";
import { Check, ChevronDown, X } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { GetUsersAction } from "@/server/admin";
import { User, UserRole } from "@/types/user";

interface Props {
  role: UserRole;
  value: string; // user id, or "" for none
  onChange: (id: string, user?: User) => void;
  placeholder?: string;
}

// Search-and-select for picking a user account by role, backed by GET
// /users?role=&search= - replaces admins having to type a raw Mongo user ID
// by hand to link an enrollment to an account.
export function UserSearchSelect({ role, value, onChange, placeholder }: Props) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [users, setUsers] = useState<User[]>([]);
  const [selected, setSelected] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!open) return;
    setIsLoading(true);
    const timeout = setTimeout(() => {
      GetUsersAction({ role, search: search || undefined }).then(([res]) => {
        setUsers(res?.data ?? []);
        setIsLoading(false);
      });
    }, 250);
    return () => clearTimeout(timeout);
  }, [open, search, role]);

  useEffect(() => {
    if (!value) {
      setSelected(null);
      return;
    }
    if (selected?.id === value) return;
    GetUsersAction({ role, search: value }).then(([res]) => {
      const match = (res?.data ?? []).find((u) => u.id === value);
      if (match) setSelected(match);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" role="combobox" aria-expanded={open} className="w-full justify-between">
          {selected ? (
            <span className="flex items-center gap-2 truncate">
              {selected.firstName} {selected.lastName}
              <span className="text-muted-foreground text-xs">{selected.email}</span>
            </span>
          ) : (
            <span className="text-muted-foreground font-normal">{placeholder || "Search users..."}</span>
          )}
          <div className="flex items-center gap-1 shrink-0">
            {value && (
              <span
                role="button"
                tabIndex={-1}
                onClick={(e) => {
                  e.stopPropagation();
                  onChange("");
                }}
                className="cursor-pointer"
              >
                <X className="h-3.5 w-3.5 opacity-60" />
              </span>
            )}
            <ChevronDown className="h-4 w-4 opacity-50" />
          </div>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[300px] p-0">
        <Command shouldFilter={false}>
          <CommandInput placeholder="Search by name or email..." value={search} onValueChange={setSearch} />
          <CommandEmpty>{isLoading ? "Searching..." : "No users found."}</CommandEmpty>
          <CommandGroup className="max-h-64 overflow-y-auto">
            {users.map((u) => (
              <CommandItem
                key={u.id}
                value={u.id}
                onSelect={() => {
                  onChange(u.id, u);
                  setSelected(u);
                  setOpen(false);
                }}
              >
                <Check className={cn("mr-2 h-4 w-4", value === u.id ? "opacity-100" : "opacity-0")} />
                <span className="flex flex-col">
                  <span>{u.firstName} {u.lastName}</span>
                  <span className="text-xs text-muted-foreground">{u.email}</span>
                </span>
              </CommandItem>
            ))}
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
