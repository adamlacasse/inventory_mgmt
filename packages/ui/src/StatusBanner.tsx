import { Flash } from "@primer/react";
import type { ReactNode } from "react";

type StatusBannerVariant = "success" | "error" | "warning";

const FLASH_VARIANT_MAP = {
  success: "success" as const,
  error: "danger" as const,
  warning: "warning" as const,
};

export interface StatusBannerProps {
  variant: StatusBannerVariant;
  children: ReactNode;
}

export function StatusBanner({ variant, children }: StatusBannerProps) {
  return <Flash variant={FLASH_VARIANT_MAP[variant]}>{children}</Flash>;
}
