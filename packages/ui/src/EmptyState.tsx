import type { ReactNode } from "react";

export interface EmptyStateProps {
  children: ReactNode;
}

export function EmptyState({ children }: EmptyStateProps) {
  return (
    <p
      style={{
        color: "rgba(28, 37, 44, 0.5)",
        fontStyle: "italic",
        fontSize: "0.875rem",
        margin: 0,
      }}
    >
      {children}
    </p>
  );
}
