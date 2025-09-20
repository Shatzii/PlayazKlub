import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-semibold transition-all duration-300 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive relative overflow-hidden",
  {
    variants: {
      variant: {
        default: "bg-gradient-to-r from-pk-gold to-pk-gold/80 text-pk-onyx hover:from-pk-gold/90 hover:to-pk-gold/70 shadow-pk-glow hover:shadow-pk-glow-strong transform hover:scale-[1.02] active:scale-[0.98]",
        destructive:
          "bg-gradient-to-r from-red-600 to-red-500 text-white hover:from-red-700 hover:to-red-600 shadow-lg hover:shadow-xl focus-visible:ring-red-500/20 dark:focus-visible:ring-red-500/40",
        outline:
          "border-2 border-pk-gold/30 bg-pk-onyx/50 text-pk-gold hover:bg-pk-gold/10 hover:border-pk-gold/50 shadow-pk-shadow hover:shadow-pk-glow backdrop-blur-sm",
        secondary:
          "bg-gradient-to-r from-pk-onyx/80 to-pk-onyx/60 text-pk-gold hover:from-pk-onyx/90 hover:to-pk-onyx/70 border border-pk-gold/20 shadow-pk-shadow hover:shadow-pk-glow",
        ghost:
          "text-pk-gold hover:bg-pk-gold/10 hover:text-pk-gold/90 dark:hover:bg-pk-gold/5",
        link: "text-pk-gold underline-offset-4 hover:underline hover:text-pk-gold/80",
        premium: "bg-gradient-to-r from-pk-onyx via-pk-onyx/95 to-pk-onyx text-pk-gold border border-pk-gold/30 shadow-pk-glow hover:shadow-pk-glow-strong hover:border-pk-gold/50 transform hover:scale-[1.02] active:scale-[0.98] before:absolute before:inset-0 before:bg-gradient-to-r before:from-transparent before:via-pk-gold/5 before:to-transparent before:translate-x-[-100%] hover:before:translate-x-[100%] before:transition-transform before:duration-700",
      },
      size: {
        default: "h-11 px-6 py-3 has-[>svg]:px-4",
        sm: "h-9 rounded-md gap-1.5 px-4 has-[>svg]:px-3 text-xs",
        lg: "h-13 rounded-lg px-8 has-[>svg]:px-6 text-base",
        icon: "size-11",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }) {
  const Comp = asChild ? Slot : "button"

  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
