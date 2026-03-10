import type { ReactNode } from "react";

export interface FilterToolbarProps {
  children: ReactNode;
  "aria-label"?: string;
}

export function FilterToolbar({ children, "aria-label": ariaLabel }: FilterToolbarProps) {
  return (
    <div
      aria-label={ariaLabel}
      style={{
        backgroundColor: "white",
        border: "1px solid rgba(28, 37, 44, 0.1)",
        borderRadius: "8px",
        padding: "16px",
        display: "flex",
        flexWrap: "wrap",
        gap: "16px",
        alignItems: "flex-end",
        boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
      }}
    >
      {children}
    </div>
  );
}
