import * as React from "react"

import { cn } from "@/lib/utils"

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "file:text-pk-gold placeholder:text-pk-gold/50 selection:bg-pk-gold selection:text-pk-onyx dark:bg-pk-onyx/30 border-pk-gold/30 h-11 w-full min-w-0 rounded-lg border bg-gradient-to-r from-pk-onyx/50 to-pk-onyx/30 px-4 py-3 text-base shadow-pk-shadow transition-all duration-300 outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm backdrop-blur-sm",
        "focus-visible:border-pk-gold/60 focus-visible:ring-pk-gold/20 focus-visible:ring-[3px] focus-visible:shadow-pk-glow focus-visible:bg-pk-onyx/60",
        "aria-invalid:ring-red-500/20 dark:aria-invalid:ring-red-500/40 aria-invalid:border-red-500 hover:border-pk-gold/50",
        className
      )}
      {...props}
    />
  )
}

export { Input }
