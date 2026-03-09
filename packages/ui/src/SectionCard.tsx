import type { ReactNode } from "react";

export interface SectionCardProps {
  children: ReactNode;
  heading?: string;
  "aria-label"?: string;
}

export function SectionCard({ children, heading, "aria-label": ariaLabel }: SectionCardProps) {
  return (
    <div
      aria-label={ariaLabel}
      style={{
        backgroundColor: "white",
        border: "1px solid rgba(28, 37, 44, 0.1)",
        borderRadius: "4px",
        overflow: "hidden",
        boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
      }}
    >
      {heading !== undefined && (
        <div
          style={{
            padding: "12px 20px",
            borderBottom: "1px solid rgba(28, 37, 44, 0.08)",
            backgroundColor: "rgba(28, 37, 44, 0.02)",
            fontSize: "0.75rem",
            fontWeight: 600,
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            color: "rgba(28, 37, 44, 0.5)",
          }}
        >
          {heading}
        </div>
      )}
      {children}
    </div>
  );
}
