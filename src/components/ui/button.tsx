
import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 backdrop-filter backdrop-blur-sm",
  {
    variants: {
      variant: {
        default: "bg-primary/90 text-primary-foreground hover:bg-primary/80",
        destructive:
          "bg-destructive/90 text-destructive-foreground hover:bg-destructive/80",
        outline:
          "border border-input/80 bg-background/60 hover:bg-accent/80 hover:text-accent-foreground",
        secondary:
          "bg-secondary/80 text-secondary-foreground hover:bg-secondary/70",
        ghost: "hover:bg-accent/80 hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
        category: "bg-gradient-to-r from-secondary/20 to-primary/20 text-foreground hover:from-secondary/30 hover:to-primary/30 border-0 font-medium transition-all duration-300 shadow-sm hover:shadow category-button",
        aptitude: "bg-blue-100 text-blue-700 hover:bg-blue-200 border border-blue-200",
        reasoning: "bg-purple-100 text-purple-700 hover:bg-purple-200 border border-purple-200",
        english: "bg-green-100 text-green-700 hover:bg-green-200 border border-green-200",
      },
      size: {
        default: "h-10 px-5 py-2",
        sm: "h-9 rounded-full px-4",
        lg: "h-11 rounded-full px-8",
        icon: "h-10 w-10 rounded-full",
        pill: "h-8 rounded-full px-3 text-xs",
      },
      layout: {
        horizontal: "flex-row",
        vertical: "flex-col py-3 h-auto",
      }
    },
    defaultVariants: {
      variant: "default",
      size: "default",
      layout: "horizontal",
    },
    compoundVariants: [
      {
        layout: "vertical",
        className: "min-h-[5rem] w-full justify-between gap-1",
      },
    ],
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, layout, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, layout, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
