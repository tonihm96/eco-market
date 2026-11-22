import type { ComponentProps } from "react";

import { cn } from "@/lib/utils";

export const Table = ({ className, ...props }: ComponentProps<"table">) => (
  <div className="relative w-full overflow-x-auto rounded-lg border bg-card">
    <table data-slot="table" className={cn("w-full caption-bottom text-sm", className)} {...props} />
  </div>
);

export const TableHeader = (props: ComponentProps<"thead">) => <thead data-slot="table-header" className="[&_tr]:border-b" {...props} />;

export const TableBody = (props: ComponentProps<"tbody">) => <tbody data-slot="table-body" className="[&_tr:last-child]:border-0" {...props} />;

export const TableRow = ({ className, ...props }: ComponentProps<"tr">) => (
  <tr data-slot="table-row" className={cn("border-b transition-colors hover:bg-muted/50", className)} {...props} />
);

export const TableHead = ({ className, ...props }: ComponentProps<"th">) => (
  <th data-slot="table-head" className={cn("h-10 px-3 text-left align-middle font-medium whitespace-nowrap text-muted-foreground", className)} {...props} />
);

export const TableCell = ({ className, ...props }: ComponentProps<"td">) => (
  <td data-slot="table-cell" className={cn("p-3 align-middle whitespace-nowrap", className)} {...props} />
);
