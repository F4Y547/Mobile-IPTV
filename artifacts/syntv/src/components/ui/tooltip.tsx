"use client"

import * as React from "react"
import { Slot } from "@radix-ui/react-slot"

import { cn } from "@/lib/utils"

type TooltipProviderProps = React.PropsWithChildren<{
  delayDuration?: number
  skipDelayDuration?: number
  disableHoverableContent?: boolean
}>

function TooltipProvider({ children }: TooltipProviderProps) {
  return <>{children}</>
}

function Tooltip({ className, ...props }: React.ComponentProps<"span">) {
  return (
    <span
      data-slot="tooltip"
      className={cn("group/tooltip relative inline-flex", className)}
      {...props}
    />
  )
}

type TooltipTriggerProps = React.ComponentProps<"span"> & {
  asChild?: boolean
}

function TooltipTrigger({ asChild = false, ...props }: TooltipTriggerProps) {
  const Comp = asChild ? Slot : "span"

  return <Comp data-slot="tooltip-trigger" {...props} />
}

type TooltipContentProps = React.ComponentProps<"div"> & {
  side?: "top" | "right" | "bottom" | "left"
  align?: "start" | "center" | "end"
  sideOffset?: number
}

const TooltipContent = React.forwardRef<HTMLDivElement, TooltipContentProps>(
  (
    {
      className,
      side = "top",
      align = "center",
      sideOffset = 4,
      hidden,
      style,
      ...props
    },
    ref
  ) => {
    if (hidden) {
      return null
    }

    const sideClasses = {
      top: "bottom-full left-1/2 -translate-x-1/2 mb-[var(--tooltip-offset)]",
      right: "left-full top-1/2 -translate-y-1/2 ml-[var(--tooltip-offset)]",
      bottom: "top-full left-1/2 -translate-x-1/2 mt-[var(--tooltip-offset)]",
      left: "right-full top-1/2 -translate-y-1/2 mr-[var(--tooltip-offset)]",
    }

    const alignClasses =
      side === "top" || side === "bottom"
        ? {
            start: "left-0 translate-x-0",
            center: "left-1/2 -translate-x-1/2",
            end: "left-auto right-0 translate-x-0",
          }[align]
        : {
            start: "top-0 translate-y-0",
            center: "top-1/2 -translate-y-1/2",
            end: "bottom-0 top-auto translate-y-0",
          }[align]

    return (
      <div
        ref={ref}
        data-slot="tooltip-content"
        role="tooltip"
        style={{
          "--tooltip-offset": `${sideOffset}px`,
          ...style,
        } as React.CSSProperties}
        className={cn(
          "pointer-events-none absolute z-50 overflow-hidden rounded-md bg-primary px-3 py-1.5 text-xs whitespace-nowrap text-primary-foreground opacity-0 shadow-md transition-opacity group-hover/tooltip:opacity-100 group-focus-within/tooltip:opacity-100",
          sideClasses[side],
          alignClasses,
          className
        )}
        {...props}
      />
    )
  }
)
TooltipContent.displayName = "TooltipContent"

export { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider }
