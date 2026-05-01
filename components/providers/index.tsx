"use client";

import { QueryProvider } from "./query-provider";
import { ToastProvider } from "./toast-provider";
import { ThemeProvider } from "./theme-provider";
import { LanguageProvider } from "./language-provider";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <LanguageProvider>
      <ThemeProvider>
        <QueryProvider>
          {children}
          <ToastProvider />
        </QueryProvider>
      </ThemeProvider>
    </LanguageProvider>
  );
}

export { ThemeProvider, useTheme } from "./theme-provider";
export { LanguageProvider, useLanguage } from "./language-provider";
