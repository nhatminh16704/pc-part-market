import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ff5636] disabled:pointer-events-none disabled:opacity-50 cursor-pointer select-none",
  {
    variants: {
      variant: {
        default:
          "bg-[#ff5636] text-white shadow-sm hover:bg-[#e63e1c] active:scale-[0.98]",
        glow:
          "bg-gradient-to-r from-[#ff5636] to-[#ff7350] text-white shadow-md shadow-orange-500/25 hover:shadow-orange-500/40 hover:brightness-105 active:scale-[0.98]",
        destructive:
          "bg-rose-600 text-white shadow-sm hover:bg-rose-500 active:scale-[0.98]",
        outline:
          "border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 hover:border-slate-300 active:scale-[0.98]",
        secondary:
          "bg-slate-100 text-slate-800 hover:bg-slate-200 active:scale-[0.98]",
        ghost: "hover:bg-slate-100 text-slate-700 hover:text-slate-900",
        link: "text-[#ff5636] underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-8 rounded-md px-3 text-xs",
        lg: "h-11 rounded-md px-8 text-base",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
