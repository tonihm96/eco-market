import type { ComponentProps } from "react";

import { cn } from "@/lib/utils";

export const Input = ({ className, type, ...props }: ComponentProps<"input">) => (
  <input
    type={type}
    data-slot="input"
    className={cn(
      "h-9 w-full min-w-0 rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-xs outline-none transition-[color,box-shadow] placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:opacity-50 md:text-sm",
      className,
    )}
    {...props}
  />
);

export const Select = ({ className, ...props }: ComponentProps<"select">) => (
  <select
    data-slot="select"
    className={cn(
      "h-8 rounded-md border border-input bg-transparent px-2 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50",
      className,
    )}
    {...props}
  />
);

export const Label = ({ className, ...props }: ComponentProps<"label">) => (
  <label data-slot="label" className={cn("text-sm font-medium leading-none", className)} {...props} />
);
