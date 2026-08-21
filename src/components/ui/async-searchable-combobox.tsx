"use client";

import { useEffect, useState } from "react";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Check, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type AsyncOption = {
  value: string;
  label: string;
};

interface Props {
  value: string;
  selectedLabel?: string;
  onChange: (value: string, label: string) => void;
  onSearch: (query: string) => Promise<AsyncOption[]>;
  placeholder?: string;
}

// Same Command/Popover primitives as SearchableCombobox, but for lists too
// large to preload (e.g. the tutor directory) - queries onSearch as the user
// types instead of filtering a fixed options array client-side.
export function AsyncSearchableCombobox({ value, selectedLabel, onChange, onSearch, placeholder }: Props) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [options, setOptions] = useState<AsyncOption[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!open || query.trim().length < 2) {
      setOptions([]);
      return;
    }
    let cancelled = false;
    setIsLoading(true);
    const timeout = setTimeout(() => {
      onSearch(query).then((results) => {
        if (!cancelled) {
          setOptions(results);
          setIsLoading(false);
        }
      });
    }, 300);
    return () => {
      cancelled = true;
      clearTimeout(timeout);
    };
  }, [query, open, onSearch]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" role="combobox" aria-expanded={open} className="w-full justify-between">
          {value ? selectedLabel || value : placeholder || "Search..."}
          <ChevronDown className="ml-2 h-4 w-4 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0">
        <Command shouldFilter={false}>
          <CommandInput placeholder="Type a name to search..." value={query} onValueChange={setQuery} className="h-9" />
          {isLoading && <p className="py-6 text-center text-sm text-gray-500">Searching...</p>}
          {!isLoading && query.trim().length >= 2 && <CommandEmpty>No matching tutor found.</CommandEmpty>}
          {!isLoading && query.trim().length < 2 && (
            <p className="py-6 text-center text-sm text-gray-500">Type at least 2 characters to search.</p>
          )}
          <CommandGroup>
            {options.map((option) => (
              <CommandItem
                key={option.value}
                value={option.value}
                onSelect={() => {
                  onChange(option.value, option.label);
                  setOpen(false);
                }}
              >
                <Check className={cn("mr-2 h-4 w-4", value === option.value ? "opacity-100" : "opacity-0")} />
                {option.label}
              </CommandItem>
            ))}
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
