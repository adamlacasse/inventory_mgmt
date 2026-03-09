"use client";

import { BaseStyles, ThemeProvider } from "@primer/react";
import type { ReactNode } from "react";

export function PrimerProvider({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider colorMode="day">
      <BaseStyles>{children}</BaseStyles>
    </ThemeProvider>
  );
}
