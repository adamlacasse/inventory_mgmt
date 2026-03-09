import { Label } from "@primer/react";
import type { LabelColorOptions } from "@primer/react";
import type { ReactNode } from "react";

export interface StatusBadgeProps {
  variant?: LabelColorOptions;
  children: ReactNode;
}

export function StatusBadge({ variant = "default", children }: StatusBadgeProps) {
  return <Label variant={variant}>{children}</Label>;
}
