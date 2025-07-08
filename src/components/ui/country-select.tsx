"use client"

import * as React from "react"
import { Check, ChevronDown } from "lucide-react"
import allCountries from "world-countries"
import { cn } from "@/lib/utils"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Button } from "@/components/ui/button"

export type CountryOption = {
  name: string
  flag: string
  dialCode: string
  code: string
}

const countries: CountryOption[] = allCountries.map((c) => ({
  name: c.name.common,
  code: c.cca2.toLowerCase(),
  flag: String.fromCodePoint(...[...c.flag].map((ch) => ch.codePointAt(0)!)),
  dialCode: c.idd.root + (c.idd.suffixes?.[0] || ""),
}))

interface CountrySelectProps {
  value?: string
  onChange: (value: string, dialCode: string, flag: string) => void
}

export function CountrySelect({ value, onChange }: CountrySelectProps) {
  const [open, setOpen] = React.useState(false)
  const selected = countries.find((c) => c.name === value)

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" role="combobox" className="w-full justify-between">
          {selected ? (
            <span className="flex items-center gap-2">
              <span className="text-xl">{selected.flag}</span>
              {selected.name}
            </span>
          ) : (
            "Select country"
          )}
          <ChevronDown className="ml-2 h-4 w-4 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[300px] p-0">
        <Command>
          <CommandInput placeholder="Search countries..." />
          <CommandEmpty>No country found.</CommandEmpty>
          <CommandGroup className="max-h-[300px] overflow-y-auto">
            {countries.map((country) => (
              <CommandItem
                key={country.name}
                value={country.name}
                onSelect={() => {
                  onChange(country.name, country.dialCode, country.flag)
                  setOpen(false)
                }}
              >
                <span className="mr-2 text-lg">{country.flag}</span>
                {country.name}
                {value === country.name && (
                  <Check className="ml-auto h-4 w-4 text-green-600" />
                )}
              </CommandItem>
            ))}
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
