import type { ReactNode } from "react";

export interface PageFrameProps {
  children: ReactNode;
}

export function PageFrame({ children }: PageFrameProps) {
  return (
    <div
      style={{
        maxWidth: "1280px",
        margin: "0 auto",
        padding: "32px 24px",
      }}
    >
      {children}
    </div>
  );
}
