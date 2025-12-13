import * as React from "react"

import { cn } from "@/lib/utils"

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
         "flex w-full rounded-md border border-input bg-inherit px-3 py-2 text-base md:text-sm",
        "placeholder:text-muted-foreground outline-none transition-all duration-200",

        // inset focus ring
        "focus-visible:border-primary focus-visible:shadow-[inset_0_0_0_2px_hsl(var(--primary))]",

        // invalid
        "aria-invalid:border-destructive aria-invalid:shadow-[inset_0_0_0_2px_hsl(var(--destructive))]",

        "disabled:cursor-not-allowed disabled:opacity-50",
      )}
      {...props}
    />
  )
}

export { Textarea }
