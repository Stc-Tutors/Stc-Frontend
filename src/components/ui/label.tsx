"use client"

import * as React from "react"
import * as LabelPrimitive from "@radix-ui/react-label"

import { cn } from "@/lib/utils"

const CONTROL_SELECTOR = "button,select,input,textarea,[role='combobox']"

function Label({
  className,
  htmlFor,
  ...props
}: React.ComponentProps<typeof LabelPrimitive.Root>) {
  const ref = React.useRef<HTMLLabelElement>(null)
  const fallbackId = React.useId()

  // Many forms put a <Label> straight above a custom control (Select, combobox) without wiring htmlFor/id, so the control has no
  // accessible name for screen readers. When nothing is wired, tie the label to the control that follows it.
  React.useEffect(() => {
    const label = ref.current
    if (!label || htmlFor || label.control) return
    const next = label.nextElementSibling
    if (!next || !next.matches(CONTROL_SELECTOR)) return
    if (next.hasAttribute("aria-label") || next.hasAttribute("aria-labelledby")) return
    if (!next.id) next.id = `${fallbackId}-control`
    label.htmlFor = next.id
  })

  return (
    <LabelPrimitive.Root
      ref={ref}
      data-slot="label"
      htmlFor={htmlFor}
      className={cn(
        "flex items-center gap-2 text-sm leading-none font-medium select-none group-data-[disabled=true]:pointer-events-none group-data-[disabled=true]:opacity-50 peer-disabled:cursor-not-allowed peer-disabled:opacity-50",
        className
      )}
      {...props}
    />
  )
}

export { Label }
